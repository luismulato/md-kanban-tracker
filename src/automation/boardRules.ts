import type { KanbanBoard, KanbanColumn, KanbanTask } from '../markdownParser';
import { WIP_COLUMN, TODO_COLUMN, DONE_COLUMN, DONE_DONE_COLUMN, DEFAULT_OWNER } from './constants';

export interface EnforceSingleWipResult {
  changed: boolean;
  demotedTitles: string[];
}

function findColumn(board: KanbanBoard, title: string): KanbanColumn | undefined {
  return board.columns.find((col) => col.title === title);
}

/**
 * Keeps at most one task per owner in the WIP column — "single WIP" applies
 * per person/agent, not to the column as a whole, so a human and one or more
 * AI agents can each have their own task in WIP at the same time. A task
 * with no `- owner:` property defaults to DEFAULT_OWNER ('Luis'), so
 * existing boards with no owners set keep behaving exactly like the
 * original single-WIP-for-everyone rule.
 *
 * Tasks are identified by title, not id — column ids are regenerated on
 * every markdown reparse (MarkdownKanbanParser.generateId), so id-based
 * tracking would silently break across reloads. Within an owner's group, if
 * more than one of their tasks ends up in WIP, `keepTitle` (when it's
 * actually present in that group) wins; otherwise the first task in the
 * group wins. Everyone else is pushed to the top of To Do.
 */
export function enforceSingleWip(board: KanbanBoard, keepTitle: string | null): EnforceSingleWipResult {
  const wipColumn = findColumn(board, WIP_COLUMN);
  const todoColumn = findColumn(board, TODO_COLUMN);
  if (!wipColumn || !todoColumn || wipColumn.tasks.length <= 1) {
    return { changed: false, demotedTitles: [] };
  }

  const groups = new Map<string, KanbanTask[]>();
  for (const task of wipColumn.tasks) {
    const owner = task.owner || DEFAULT_OWNER;
    const group = groups.get(owner);
    if (group) {
      group.push(task);
    } else {
      groups.set(owner, [task]);
    }
  }

  const remaining: KanbanTask[] = [];
  const demotedTitles: string[] = [];
  for (const group of groups.values()) {
    if (group.length <= 1) {
      remaining.push(...group);
      continue;
    }

    const keep =
      keepTitle !== null && group.some((t) => t.title === keepTitle) ? keepTitle : group[0].title;

    for (const task of group) {
      if (task.title === keep) {
        remaining.push(task);
      } else {
        todoColumn.tasks.unshift(task);
        demotedTitles.push(task.title);
      }
    }
  }

  // groups.values() doesn't preserve the original WIP order across owners,
  // so re-sort the kept tasks back into their original relative order
  const originalOrder = wipColumn.tasks;
  remaining.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
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

/** Titles of every task currently occupying WIP (one per owner, after enforceSingleWip). */
export function currentWipTitles(board: KanbanBoard): string[] {
  const wipColumn = findColumn(board, WIP_COLUMN);
  return wipColumn ? wipColumn.tasks.map((t) => t.title) : [];
}
