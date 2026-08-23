import type { KanbanBoard, KanbanColumn } from '../markdownParser';
import { WIP_COLUMN, TODO_COLUMN, DONE_COLUMN, DONE_DONE_COLUMN } from './constants';

export interface EnforceSingleWipResult {
  changed: boolean;
  demotedTitles: string[];
}

function findColumn(board: KanbanBoard, title: string): KanbanColumn | undefined {
  return board.columns.find((col) => col.title === title);
}

/**
 * Keeps at most one task in the WIP column. Tasks are identified by title,
 * not id — column ids are regenerated on every markdown reparse
 * (MarkdownKanbanParser.generateId), so id-based tracking would silently
 * break across reloads. If more than one task ends up in WIP, `keepTitle`
 * (when it's actually present in WIP) wins; otherwise the first task in
 * WIP wins. Everyone else is pushed to the top of To Do.
 */
export function enforceSingleWip(board: KanbanBoard, keepTitle: string | null): EnforceSingleWipResult {
  const wipColumn = findColumn(board, WIP_COLUMN);
  const todoColumn = findColumn(board, TODO_COLUMN);
  if (!wipColumn || !todoColumn || wipColumn.tasks.length <= 1) {
    return { changed: false, demotedTitles: [] };
  }

  const keep =
    keepTitle !== null && wipColumn.tasks.some((t) => t.title === keepTitle)
      ? keepTitle
      : wipColumn.tasks[0].title;

  const remaining = [];
  const demotedTitles: string[] = [];
  for (const task of wipColumn.tasks) {
    if (task.title === keep) {
      remaining.push(task);
    } else {
      todoColumn.tasks.unshift(task);
      demotedTitles.push(task.title);
    }
  }
  wipColumn.tasks = remaining;

  return { changed: demotedTitles.length > 0, demotedTitles };
}

/**
 * Moves every task from Done to the end of Done Done, leaving Done empty.
 * Returns false (no-op) if there was nothing to move.
 */
export function archiveDoneColumn(board: KanbanBoard): boolean {
  const doneColumn = findColumn(board, DONE_COLUMN);
  const doneDoneColumn = findColumn(board, DONE_DONE_COLUMN);
  if (!doneColumn || !doneDoneColumn || doneColumn.tasks.length === 0) {
    return false;
  }
  doneDoneColumn.tasks.push(...doneColumn.tasks);
  doneColumn.tasks = [];
  return true;
}

/** Title of the task currently occupying WIP, or null if WIP is empty. */
export function currentWipTitle(board: KanbanBoard): string | null {
  const wipColumn = findColumn(board, WIP_COLUMN);
  return wipColumn && wipColumn.tasks.length > 0 ? wipColumn.tasks[0].title : null;
}
