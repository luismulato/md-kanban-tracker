import type { KanbanBoard } from '../markdownParser';
import { enforceSingleWip, archiveDoneColumn, currentWipTitles } from './boardRules';
import { startTimer, stopTimer, readLastArchiveDate, writeLastArchiveDate, formatLocalDate } from './timelog';

export interface ApplyBoardAutomationParams {
  board: KanbanBoard;
  companionDir: string;
  boardBaseName: string;
  /** WIP occupants before this change (one per owner), as tracked by the caller across calls. */
  previousWipTitles: string[];
  /**
   * Title of the task the caller just moved/added into a column (if any).
   * Used to decide who "wins" WIP within their owner's group when
   * enforceSingleWip finds more than one of their tasks there. Pass null
   * when there's no specific signal (e.g. a manual edit of the .md was
   * just reparsed).
   */
  justMovedTitle?: string | null;
  now?: Date;
}

export interface ApplyBoardAutomationResult {
  /** True if `board` was mutated (single-WIP enforcement and/or archiving) and needs saving. */
  boardChanged: boolean;
  /** WIP occupants after this change — pass this back in as `previousWipTitles` next time. */
  newWipTitles: string[];
}

/**
 * Equivalent of mng/scripts/kanban_events.py's process_change, ported to
 * run synchronously inside the extension instead of via file polling.
 * Applies, in order: (1) single WIP per owner — a human and one or more AI
 * agents can each have their own task in WIP at once, but a second task
 * from the *same* owner still bumps their previous one back to To Do, (2)
 * daily Done -> Done Done archive the first time anything enters WIP each
 * day, (3) starts/stops a timer for each task as it enters/leaves WIP.
 * Never touches a timer running for a task that isn't (and wasn't) a WIP
 * occupant — ad-hoc manual timing of something off-board is left alone.
 */
export function applyBoardAutomation(params: ApplyBoardAutomationParams): ApplyBoardAutomationResult {
  const { board, companionDir, boardBaseName, previousWipTitles } = params;
  const now = params.now ?? new Date();
  const justMovedTitle = params.justMovedTitle ?? null;

  let boardChanged = false;

  if (enforceSingleWip(board, justMovedTitle).changed) {
    boardChanged = true;
  }

  const newWipTitles = currentWipTitles(board);
  const previousSet = new Set(previousWipTitles);
  const newSet = new Set(newWipTitles);

  const entered = newWipTitles.filter((title) => !previousSet.has(title));
  const left = previousWipTitles.filter((title) => !newSet.has(title));

  if (entered.length > 0) {
    const last = readLastArchiveDate(companionDir);
    if (last !== formatLocalDate(now)) {
      if (archiveDoneColumn(board)) {
        boardChanged = true;
      }
      writeLastArchiveDate(companionDir, now);
    }
  }

  for (const title of left) {
    stopTimer(companionDir, boardBaseName, title, 'auto, cambio de foco en WIP', now);
  }
  for (const title of entered) {
    startTimer(companionDir, title, now);
  }

  return { boardChanged, newWipTitles };
}
