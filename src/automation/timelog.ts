import * as fs from 'fs';
import * as path from 'path';
import { TIMER_STATE_FILE, LAST_ARCHIVE_FILE } from './constants';

/**
 * Filesystem boundary for the timer/timelog side of board automation.
 * Every function takes `companionDir` explicitly (never reads it from a
 * global) so tests can point it at a throwaway temp directory.
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Local time (not UTC) as "YYYY-MM-DD HH:MM", matching mng/scripts/timelog.sh. */
export function formatLocalDateTime(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ` +
    `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  );
}

/** Local time as "HH:MM", used for the end side of a manual-timer log line. */
export function formatLocalTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function stateFilePath(companionDir: string): string {
  return path.join(companionDir, TIMER_STATE_FILE);
}

function archiveDateFilePath(companionDir: string): string {
  return path.join(companionDir, LAST_ARCHIVE_FILE);
}

function timelogFilePath(companionDir: string, boardBaseName: string): string {
  return path.join(companionDir, `${boardBaseName}.timelog.md`);
}

interface RunningTimer {
  title: string;
  startEpoch: number;
}

/**
 * State file holds one `epoch|title` line per task currently being timed,
 * so several WIP occupants (one per owner) can each have their own running
 * timer at once. Still reads a legacy single-line file with no trailing
 * newline just fine — that's just one entry.
 */
function readRunningTimers(companionDir: string): RunningTimer[] {
  const file = stateFilePath(companionDir);
  if (!fs.existsSync(file)) {
    return [];
  }
  return fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .map((line: string) => line.trim())
    .filter(Boolean)
    .flatMap((line: string) => {
      const sep = line.indexOf('|');
      if (sep === -1) return [];
      return [{ startEpoch: Number(line.slice(0, sep)), title: line.slice(sep + 1) }];
    });
}

function writeRunningTimers(companionDir: string, timers: RunningTimer[]): void {
  if (timers.length === 0) {
    fs.rmSync(stateFilePath(companionDir), { force: true });
    return;
  }
  fs.mkdirSync(companionDir, { recursive: true });
  const content = timers.map((t) => `${t.startEpoch}|${t.title}`).join('\n') + '\n';
  fs.writeFileSync(stateFilePath(companionDir), content, 'utf-8');
}

/** Titles of every task with a timer currently running. */
export function readRunningTimerTasks(companionDir: string): string[] {
  return readRunningTimers(companionDir).map((t) => t.title);
}

/** Title of a single running timer, or null — kept for ad-hoc/manual use outside WIP automation. */
export function readRunningTimerTask(companionDir: string): string | null {
  const timers = readRunningTimers(companionDir);
  return timers.length > 0 ? timers[0].title : null;
}

export function startTimer(companionDir: string, title: string, now: Date): void {
  const timers = readRunningTimers(companionDir).filter((t) => t.title !== title);
  timers.push({ title, startEpoch: Math.floor(now.getTime() / 1000) });
  writeRunningTimers(companionDir, timers);
}

/**
 * Stops the timer running for `title` (if any) and appends a line to the
 * board's timelog file. Format matches mng/scripts/timelog.sh exactly:
 * `YYYY-MM-DD HH:MM–HH:MM (Nm) — "Tarea" (razon)` (en dash / em dash, not hyphens).
 * No-op if `title` has no running timer.
 */
export function stopTimer(companionDir: string, boardBaseName: string, title: string, reason: string, now: Date): void {
  const timers = readRunningTimers(companionDir);
  const index = timers.findIndex((t) => t.title === title);
  if (index === -1) {
    return;
  }
  const [timer] = timers.splice(index, 1);
  const startDate = new Date(timer.startEpoch * 1000);
  const minutes = Math.round((now.getTime() - startDate.getTime()) / 60000);

  const logFile = timelogFilePath(companionDir, boardBaseName);
  fs.mkdirSync(companionDir, { recursive: true });
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, `# ${boardBaseName} Timelog\n\n`, 'utf-8');
  }
  const line = `${formatLocalDateTime(startDate)}–${formatLocalTime(now)} (${minutes}m) — "${title}" (${reason})\n`;
  fs.appendFileSync(logFile, line, 'utf-8');
  writeRunningTimers(companionDir, timers);
}

export function readLastArchiveDate(companionDir: string): string | null {
  const file = archiveDateFilePath(companionDir);
  if (!fs.existsSync(file)) {
    return null;
  }
  return fs.readFileSync(file, 'utf-8').trim() || null;
}

export function writeLastArchiveDate(companionDir: string, date: Date): void {
  fs.mkdirSync(companionDir, { recursive: true });
  fs.writeFileSync(archiveDateFilePath(companionDir), `${formatLocalDate(date)}\n`, 'utf-8');
}
