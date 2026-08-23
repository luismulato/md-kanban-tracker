import { describe, it, expect } from 'vitest';
import { enforceSingleWip, archiveDoneColumn, currentWipTitle } from '../../automation/boardRules';
import type { KanbanBoard } from '../../markdownParser';

function makeBoard(): KanbanBoard {
  return {
    title: 'Test',
    columns: [
      { id: 'c-todo', title: 'To Do', tasks: [{ id: 't-a', title: 'Tarea A' }] },
      { id: 'c-wip', title: 'WIP', tasks: [] },
      { id: 'c-done', title: 'Done', tasks: [] },
      { id: 'c-donedone', title: 'Done Done', tasks: [{ id: 't-old', title: 'Tarea vieja' }] },
    ],
  };
}

describe('enforceSingleWip', () => {
  it('does nothing when WIP has zero or one task', () => {
    const board = makeBoard();
    const result = enforceSingleWip(board, null);
    expect(result.changed).toBe(false);
    expect(result.demotedTitles).toEqual([]);
  });

  it('keeps keepTitle and demotes the rest to the top of To Do', () => {
    const board = makeBoard();
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    wip.tasks = [{ id: 't-old-wip', title: 'Ya estaba' }, { id: 't-new', title: 'Recien entra' }];

    const result = enforceSingleWip(board, 'Recien entra');

    expect(result.changed).toBe(true);
    expect(result.demotedTitles).toEqual(['Ya estaba']);
    expect(wip.tasks.map((t) => t.title)).toEqual(['Recien entra']);
    const todo = board.columns.find((c) => c.title === 'To Do')!;
    expect(todo.tasks[0].title).toBe('Ya estaba');
    expect(todo.tasks.map((t) => t.title)).toEqual(['Ya estaba', 'Tarea A']);
  });

  it('falls back to the first WIP task when keepTitle is not actually in WIP', () => {
    const board = makeBoard();
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    wip.tasks = [{ id: 't-1', title: 'Primera' }, { id: 't-2', title: 'Segunda' }];

    const result = enforceSingleWip(board, 'No existe en WIP');

    expect(result.changed).toBe(true);
    expect(wip.tasks.map((t) => t.title)).toEqual(['Primera']);
    expect(result.demotedTitles).toEqual(['Segunda']);
  });

  it('is a no-op when WIP or To Do columns are missing', () => {
    const board: KanbanBoard = { title: 'Sin columnas', columns: [] };
    const result = enforceSingleWip(board, null);
    expect(result.changed).toBe(false);
  });
});

describe('archiveDoneColumn', () => {
  it('moves all Done tasks to the end of Done Done and empties Done', () => {
    const board = makeBoard();
    const done = board.columns.find((c) => c.title === 'Done')!;
    done.tasks = [{ id: 't-1', title: 'Recien terminada' }];

    const changed = archiveDoneColumn(board);

    expect(changed).toBe(true);
    expect(done.tasks).toEqual([]);
    const doneDone = board.columns.find((c) => c.title === 'Done Done')!;
    expect(doneDone.tasks.map((t) => t.title)).toEqual(['Tarea vieja', 'Recien terminada']);
  });

  it('returns false and does not touch anything when Done is already empty', () => {
    const board = makeBoard();
    const before = JSON.stringify(board);

    const changed = archiveDoneColumn(board);

    expect(changed).toBe(false);
    expect(JSON.stringify(board)).toBe(before);
  });
});

describe('currentWipTitle', () => {
  it('returns null when WIP is empty', () => {
    expect(currentWipTitle(makeBoard())).toBeNull();
  });

  it('returns the title of the (single) task in WIP', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-1', title: 'En curso' }];
    expect(currentWipTitle(board)).toBe('En curso');
  });
});
