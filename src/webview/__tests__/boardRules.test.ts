import { describe, it, expect } from 'vitest';
import { enforceSingleWip, archiveDoneColumn, currentWipTitle, currentWipTitles } from '../../automation/boardRules';
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

  it('keeps keepTitle and demotes the rest to the top of To Do (no owners set = same owner)', () => {
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

  it('an explicit owner defaults to the same slot as an unset owner (both are "Luis")', () => {
    const board = makeBoard();
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    wip.tasks = [
      { id: 't-1', title: 'Sin owner explicito' },
      { id: 't-2', title: 'Owner Luis explicito', owner: 'Luis' },
    ];

    const result = enforceSingleWip(board, 'Owner Luis explicito');

    expect(result.changed).toBe(true);
    expect(wip.tasks.map((t) => t.title)).toEqual(['Owner Luis explicito']);
    expect(result.demotedTitles).toEqual(['Sin owner explicito']);
  });

  it('lets a different owner keep their own WIP task untouched', () => {
    const board = makeBoard();
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    wip.tasks = [
      { id: 't-agent', title: 'Tarea del agente', owner: 'Claude' },
      { id: 't-luis-1', title: 'Luis ya tenia esta' },
      { id: 't-luis-2', title: 'Luis mueve esta ahora' },
    ];

    const result = enforceSingleWip(board, 'Luis mueve esta ahora');

    expect(result.changed).toBe(true);
    expect(result.demotedTitles).toEqual(['Luis ya tenia esta']);
    expect(wip.tasks.map((t) => t.title)).toEqual(['Tarea del agente', 'Luis mueve esta ahora']);
  });

  it('demotes conflicting tasks independently per owner when two owners each have a conflict', () => {
    const board = makeBoard();
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    wip.tasks = [
      { id: 't-luis-old', title: 'Luis vieja', owner: 'Luis' },
      { id: 't-agent-old', title: 'Agente vieja', owner: 'Claude' },
      { id: 't-luis-new', title: 'Luis nueva', owner: 'Luis' },
      { id: 't-agent-new', title: 'Agente nueva', owner: 'Claude' },
    ];

    const result = enforceSingleWip(board, null);

    expect(result.changed).toBe(true);
    // each owner keeps the first task encountered in their own group
    expect(wip.tasks.map((t) => t.title).sort()).toEqual(['Agente vieja', 'Luis vieja'].sort());
    expect(result.demotedTitles.sort()).toEqual(['Agente nueva', 'Luis nueva'].sort());
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

describe('currentWipTitles', () => {
  it('returns an empty array when WIP is empty', () => {
    expect(currentWipTitles(makeBoard())).toEqual([]);
  });

  it('returns every title currently in WIP, in order', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [
      { id: 't-1', title: 'Tarea de Luis' },
      { id: 't-2', title: 'Tarea del agente', owner: 'Claude' },
    ];
    expect(currentWipTitles(board)).toEqual(['Tarea de Luis', 'Tarea del agente']);
  });

  it('returns an empty array when the WIP column does not exist', () => {
    const board: KanbanBoard = { title: 'Sin columnas', columns: [] };
    expect(currentWipTitles(board)).toEqual([]);
  });
});
