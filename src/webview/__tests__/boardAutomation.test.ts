import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { applyBoardAutomation } from '../../automation/boardAutomation';
import { readRunningTimerTasks } from '../../automation/timelog';
import type { KanbanBoard } from '../../markdownParser';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-kanban-tracker-automation-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeBoard(): KanbanBoard {
  return {
    title: 'Test',
    columns: [
      { id: 'c-todo', title: 'To Do', tasks: [{ id: 't-a', title: 'Tarea A' }, { id: 't-b', title: 'Tarea B' }] },
      { id: 'c-wip', title: 'WIP', tasks: [] },
      { id: 'c-done', title: 'Done', tasks: [] },
      { id: 'c-donedone', title: 'Done Done', tasks: [] },
    ],
  };
}

describe('applyBoardAutomation', () => {
  it('starts the timer automatically when a task enters an empty WIP', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'To Do')!.tasks = [{ id: 't-b', title: 'Tarea B' }];
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-a', title: 'Tarea A' }];

    const result = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: [],
      justMovedTitle: 'Tarea A',
      now: new Date(2026, 7, 22, 10, 0),
    });

    expect(result.newWipTitles).toEqual(['Tarea A']);
    expect(readRunningTimerTasks(tmpDir)).toEqual(['Tarea A']);
  });

  it('switches focus in one step: stops the outgoing task and starts the incoming one', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-b', title: 'Tarea B' }];
    board.columns.find((c) => c.title === 'Done')!.tasks = [{ id: 't-a', title: 'Tarea A' }];

    // simulate "Tarea A" already had a running timer from a previous automation call
    const setupBoard = makeBoard();
    setupBoard.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-a', title: 'Tarea A' }];
    applyBoardAutomation({
      board: setupBoard,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: [],
      justMovedTitle: 'Tarea A',
      now: new Date(2026, 7, 22, 9, 0),
    });
    expect(readRunningTimerTasks(tmpDir)).toEqual(['Tarea A']);

    const result = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Tarea A'],
      justMovedTitle: 'Tarea B',
      now: new Date(2026, 7, 22, 9, 30),
    });

    expect(result.newWipTitles).toEqual(['Tarea B']);
    expect(readRunningTimerTasks(tmpDir)).toEqual(['Tarea B']);

    const log = fs.readFileSync(path.join(tmpDir, 'board.timelog.md'), 'utf-8');
    expect(log).toContain('"Tarea A" (auto, cambio de foco en WIP)');
  });

  it('does not touch an ad-hoc timer for a task that is not a WIP occupant', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'To Do')!.tasks = [{ id: 't-a', title: 'Tarea A' }];
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-b', title: 'Tarea B' }];

    // "Fuera del board" is being timed manually, unrelated to WIP
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.timelog-state'), '1700000000|Fuera del board', 'utf-8');

    // "Tarea B" leaves WIP back to To Do
    board.columns.find((c) => c.title === 'WIP')!.tasks = [];
    board.columns.find((c) => c.title === 'To Do')!.tasks.push({ id: 't-b', title: 'Tarea B' });

    applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Tarea B'],
      justMovedTitle: null,
      now: new Date(2026, 7, 22, 11, 0),
    });

    expect(readRunningTimerTasks(tmpDir)).toEqual(['Fuera del board']);
  });

  it('enforces single WIP per owner and keeps the just-moved task', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [
      { id: 't-a', title: 'Ya estaba' },
      { id: 't-b', title: 'Recien entra' },
    ];

    const result = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Ya estaba'],
      justMovedTitle: 'Recien entra',
      now: new Date(2026, 7, 22, 12, 0),
    });

    expect(result.boardChanged).toBe(true);
    expect(result.newWipTitles).toEqual(['Recien entra']);
    const wip = board.columns.find((c) => c.title === 'WIP')!;
    expect(wip.tasks.map((t) => t.title)).toEqual(['Recien entra']);
    const todo = board.columns.find((c) => c.title === 'To Do')!;
    expect(todo.tasks[0].title).toBe('Ya estaba');
  });

  it('lets a task owned by a different agent stay in WIP alongside the just-moved one', () => {
    // "Tarea del agente" already had a running timer from a previous call
    const setupBoard = makeBoard();
    setupBoard.columns.find((c) => c.title === 'WIP')!.tasks = [
      { id: 't-agent', title: 'Tarea del agente', owner: 'Claude' },
    ];
    applyBoardAutomation({
      board: setupBoard,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: [],
      justMovedTitle: 'Tarea del agente',
      now: new Date(2026, 7, 22, 11, 0),
    });

    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [
      { id: 't-agent', title: 'Tarea del agente', owner: 'Claude' },
      { id: 't-luis', title: 'Tarea de Luis' },
    ];

    const result = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Tarea del agente'],
      justMovedTitle: 'Tarea de Luis',
      now: new Date(2026, 7, 22, 12, 0),
    });

    expect(result.boardChanged).toBe(false);
    expect(result.newWipTitles.sort()).toEqual(['Tarea de Luis', 'Tarea del agente'].sort());
    expect(readRunningTimerTasks(tmpDir).sort()).toEqual(['Tarea de Luis', 'Tarea del agente'].sort());
  });

  it('archives Done into Done Done only once per day, the first time something enters WIP', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'Done')!.tasks = [{ id: 't-x', title: 'Hecha' }];
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-a', title: 'Tarea A' }];

    const firstRun = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: [],
      justMovedTitle: 'Tarea A',
      now: new Date(2026, 7, 22, 8, 0),
    });
    expect(firstRun.boardChanged).toBe(true);
    expect(board.columns.find((c) => c.title === 'Done')!.tasks).toEqual([]);
    expect(board.columns.find((c) => c.title === 'Done Done')!.tasks.map((t) => t.title)).toEqual(['Hecha']);

    // something else lands in Done later the same day, then a new task enters WIP again
    board.columns.find((c) => c.title === 'Done')!.tasks = [{ id: 't-y', title: 'Otra hecha' }];
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-c', title: 'Tarea C' }];

    applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Tarea A'],
      justMovedTitle: 'Tarea C',
      now: new Date(2026, 7, 22, 9, 0), // same day
    });

    // Done keeps "Otra hecha" -- archiving already happened today, doesn't retrigger
    expect(board.columns.find((c) => c.title === 'Done')!.tasks.map((t) => t.title)).toEqual(['Otra hecha']);
  });

  it('does nothing to the board when WIP occupants do not change', () => {
    const board = makeBoard();
    board.columns.find((c) => c.title === 'WIP')!.tasks = [{ id: 't-a', title: 'Tarea A' }];

    const result = applyBoardAutomation({
      board,
      companionDir: tmpDir,
      boardBaseName: 'board',
      previousWipTitles: ['Tarea A'],
      justMovedTitle: null,
      now: new Date(2026, 7, 22, 10, 0),
    });

    expect(result.boardChanged).toBe(false);
    expect(readRunningTimerTasks(tmpDir)).toEqual([]);
  });
});
