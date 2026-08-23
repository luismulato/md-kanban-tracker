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

/** Title of the task the manual timer is currently running for, or null. */
export function readRunningTimerTask(companionDir: string): string | null {
  const file = stateFilePath(companionDir);
  if (!fs.existsSync(file)) {
    return null;
  }
  const content = fs.readFileSync(file, 'utf-8').trim();
  const sep = content.indexOf('|');
  if (sep === -1) {
    return null;
  }
  return content.slice(sep + 1);
}

export function startTimer(companionDir: string, task: string, now: Date): void {
  fs.mkdirSync(companionDir, { recursive: true });
  fs.writeFileSync(stateFilePath(companionDir), `${Math.floor(now.getTime() / 1000)}|${task}`, 'utf-8');
}

/**
 * Stops the running timer (if any) and appends a line to the board's
 * timelog file. Format matches mng/scripts/timelog.sh exactly:
 * `YYYY-MM-DD HH:MM–HH:MM (Nm) — "Tarea" (razon)` (en dash / em dash, not hyphens).
 */
export function stopTimer(companionDir: string, boardBaseName: string, reason: string, now: Date): void {
  const file = stateFilePath(companionDir);
  if (!fs.existsSync(file)) {
    return;
  }
  const content = fs.readFileSync(file, 'utf-8').trim();
  const sep = content.indexOf('|');
  if (sep === -1) {
    fs.rmSync(file, { force: true });
    return;
  }
  const startEpoch = Number(content.slice(0, sep));
  const task = content.slice(sep + 1);
  const startDate = new Date(startEpoch * 1000);
  const minutes = Math.round((now.getTime() - startDate.getTime()) / 60000);

  const logFile = timelogFilePath(companionDir, boardBaseName);
  fs.mkdirSync(companionDir, { recursive: true });
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, `# ${boardBaseName} Timelog\n\n`, 'utf-8');
  }
  const line = `${formatLocalDateTime(startDate)}–${formatLocalTime(now)} (${minutes}m) — "${task}" (${reason})\n`;
  fs.appendFileSync(logFile, line, 'utf-8');
  fs.rmSync(file, { force: true });
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
