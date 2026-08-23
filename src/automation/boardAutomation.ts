import type { KanbanBoard } from '../markdownParser';
import { enforceSingleWip, archiveDoneColumn, currentWipTitle } from './boardRules';
import {
  readRunningTimerTask,
  startTimer,
  stopTimer,
  readLastArchiveDate,
  writeLastArchiveDate,
  formatLocalDate,
} from './timelog';

export interface ApplyBoardAutomationParams {
  board: KanbanBoard;
  companionDir: string;
  boardBaseName: string;
  /** WIP occupant before this change, as tracked by the caller across calls. */
  previousWipTitle: string | null;
  /**
   * Title of the task the caller just moved/added into a column (if any).
   * Used to decide who "wins" WIP when enforceSingleWip finds more than
   * one task there. Pass null when there's no specific signal (e.g. a
   * manual edit of the .md was just reparsed).
   */
  justMovedTitle?: string | null;
  now?: Date;
}

export interface ApplyBoardAutomationResult {
  /** True if `board` was mutated (single-WIP enforcement and/or archiving) and needs saving. */
  boardChanged: boolean;
  /** WIP occupant after this change — pass this back in as `previousWipTitle` next time. */
  newWipTitle: string | null;
}

/**
 * Equivalent of mng/scripts/kanban_events.py's process_change, ported to
 * run synchronously inside the extension instead of via file polling.
 * Applies, in order: (1) single WIP, (2) daily Done -> Done Done archive
 * the first time something enters WIP each day, (3) syncs the manual
 * timer to whatever ends up in WIP. Never touches a timer that's running
 * for a task that isn't (and wasn't) the WIP occupant — ad-hoc manual
 * timing of something off-board is left alone.
 */
export function applyBoardAutomation(params: ApplyBoardAutomationParams): ApplyBoardAutomationResult {
  const { board, companionDir, boardBaseName, previousWipTitle } = params;
  const now = params.now ?? new Date();
  const justMovedTitle = params.justMovedTitle ?? null;

  let boardChanged = false;

  if (enforceSingleWip(board, justMovedTitle).changed) {
    boardChanged = true;
  }

  const newWipTitle = currentWipTitle(board);

  const enteredWip = newWipTitle !== null && newWipTitle !== previousWipTitle;
  if (enteredWip) {
    const last = readLastArchiveDate(companionDir);
    if (last !== formatLocalDate(now)) {
      if (archiveDoneColumn(board)) {
        boardChanged = true;
      }
      writeLastArchiveDate(companionDir, now);
    }
  }

  if (previousWipTitle !== newWipTitle) {
    const tracked = readRunningTimerTask(companionDir);
    let stillTracked = tracked;
    if (tracked !== null && tracked === previousWipTitle) {
      stopTimer(companionDir, boardBaseName, `auto, cambio de foco en WIP`, now);
      stillTracked = null;
    }
    if (newWipTitle !== null && stillTracked === null) {
      startTimer(companionDir, newWipTitle, now);
    }
  }

  return { boardChanged, newWipTitle };
}
