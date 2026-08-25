import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  readRunningTimerTask,
  readRunningTimerTasks,
  startTimer,
  stopTimer,
  readLastArchiveDate,
  writeLastArchiveDate,
  formatLocalDateTime,
  formatLocalDate,
} from '../../automation/timelog';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-kanban-tracker-timelog-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('startTimer / readRunningTimerTask(s)', () => {
  it('returns null / empty when no timer is running', () => {
    expect(readRunningTimerTask(tmpDir)).toBeNull();
    expect(readRunningTimerTasks(tmpDir)).toEqual([]);
  });

  it('persists the task name so it can be read back', () => {
    startTimer(tmpDir, 'Tarea A', new Date());
    expect(readRunningTimerTask(tmpDir)).toBe('Tarea A');
    expect(readRunningTimerTasks(tmpDir)).toEqual(['Tarea A']);
  });

  it('creates the companion dir if it does not exist yet', () => {
    const nested = path.join(tmpDir, 'nested', 'dir');
    startTimer(nested, 'Tarea A', new Date());
    expect(fs.existsSync(nested)).toBe(true);
  });

  it('supports several concurrent running timers', () => {
    startTimer(tmpDir, 'Tarea A', new Date());
    startTimer(tmpDir, 'Tarea B', new Date());

    expect(readRunningTimerTasks(tmpDir).sort()).toEqual(['Tarea A', 'Tarea B']);
  });

  it('starting a timer for a title that is already running replaces its start time', () => {
    const t1 = new Date(2026, 7, 22, 9, 0, 0);
    const t2 = new Date(2026, 7, 22, 9, 30, 0);
    const t3 = new Date(2026, 7, 22, 9, 40, 0);

    startTimer(tmpDir, 'Tarea A', t1);
    startTimer(tmpDir, 'Tarea A', t2);
    stopTimer(tmpDir, 'board', 'Tarea A', 'manual', t3);

    const log = fs.readFileSync(path.join(tmpDir, 'board.timelog.md'), 'utf-8');
    // 9:30 -> 9:40 (10m), not 9:00 -> 9:40 (40m)
    expect(log).toContain('09:30–09:40 (10m)');
  });
});

describe('stopTimer', () => {
  it('is a no-op when the given title has no running timer (no file created)', () => {
    stopTimer(tmpDir, 'board', 'Tarea inexistente', 'manual', new Date());
    expect(fs.existsSync(path.join(tmpDir, 'board.timelog.md'))).toBe(false);
  });

  it('appends a line with the exact expected format and clears the state for that title', () => {
    const start = new Date(2026, 7, 22, 14, 5, 0); // 2026-08-22 14:05 local
    const end = new Date(2026, 7, 22, 14, 43, 0); // 2026-08-22 14:43 local

    startTimer(tmpDir, 'Tarea A', start);
    stopTimer(tmpDir, 'board', 'Tarea A', 'manual', end);

    expect(readRunningTimerTask(tmpDir)).toBeNull();

    const log = fs.readFileSync(path.join(tmpDir, 'board.timelog.md'), 'utf-8');
    expect(log).toContain('# board Timelog');
    expect(log).toContain('2026-08-22 14:05–14:43 (38m) — "Tarea A" (manual)');
  });

  it('appends multiple stops to the same file instead of overwriting it', () => {
    const t1 = new Date(2026, 7, 22, 9, 0, 0);
    const t2 = new Date(2026, 7, 22, 9, 10, 0);
    const t3 = new Date(2026, 7, 22, 9, 20, 0);

    startTimer(tmpDir, 'Tarea A', t1);
    stopTimer(tmpDir, 'board', 'Tarea A', 'manual', t2);
    startTimer(tmpDir, 'Tarea B', t2);
    stopTimer(tmpDir, 'board', 'Tarea B', 'manual', t3);

    const lines = fs
      .readFileSync(path.join(tmpDir, 'board.timelog.md'), 'utf-8')
      .split('\n')
      .filter((l) => l.includes('—'));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Tarea A');
    expect(lines[1]).toContain('Tarea B');
  });

  it('stopping one of several concurrent timers leaves the others running', () => {
    const t1 = new Date(2026, 7, 22, 9, 0, 0);
    const t2 = new Date(2026, 7, 22, 9, 15, 0);

    startTimer(tmpDir, 'Tarea A', t1);
    startTimer(tmpDir, 'Tarea B', t1);

    stopTimer(tmpDir, 'board', 'Tarea A', 'manual', t2);

    expect(readRunningTimerTasks(tmpDir)).toEqual(['Tarea B']);
  });
});

describe('archive date marker', () => {
  it('returns null when never written', () => {
    expect(readLastArchiveDate(tmpDir)).toBeNull();
  });

  it('round-trips a date', () => {
    writeLastArchiveDate(tmpDir, new Date(2026, 7, 22));
    expect(readLastArchiveDate(tmpDir)).toBe('2026-08-22');
  });
});

describe('date formatting helpers', () => {
  it('formatLocalDateTime pads single digits', () => {
    expect(formatLocalDateTime(new Date(2026, 0, 5, 9, 3))).toBe('2026-01-05 09:03');
  });

  it('formatLocalDate pads single digits', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
