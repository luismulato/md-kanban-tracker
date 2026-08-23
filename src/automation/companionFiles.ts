import * as fs from 'fs';
import * as path from 'path';
import { COMPANION_DIR_NAME } from './constants';
import { KANBAN_GUIDE_ES_TEMPLATE } from '../templates/trackerGuideTemplate';
import { TRACKER_README_TEMPLATE } from '../templates/trackerReadmeTemplate';

export interface CompanionPaths {
  companionDir: string;
  timelogPath: string;
  boardBaseName: string;
}

/** "opi.kanban.md" -> "opi" */
export function boardBaseNameFor(kanbanFilePath: string): string {
  return path.basename(kanbanFilePath).replace(/\.kanban\.md$/, '');
}

/**
 * Ensures `<dir-of-kanbanFilePath>/md-kanban-tracker/` exists with its
 * static companion files (guide, readme). Idempotent — only writes what's
 * missing, never overwrites an existing timelog. Returns the paths the
 * rest of the automation needs.
 */
export function ensureCompanionFolder(kanbanFilePath: string): CompanionPaths {
  const dir = path.dirname(kanbanFilePath);
  const boardBaseName = boardBaseNameFor(kanbanFilePath);
  const companionDir = path.join(dir, COMPANION_DIR_NAME);
  const timelogPath = path.join(companionDir, `${boardBaseName}.timelog.md`);

  fs.mkdirSync(companionDir, { recursive: true });

  const guidePath = path.join(companionDir, 'kanban-guia-ES.md');
  if (!fs.existsSync(guidePath)) {
    fs.writeFileSync(guidePath, KANBAN_GUIDE_ES_TEMPLATE, 'utf-8');
  }

  const readmePath = path.join(companionDir, 'Readme.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, TRACKER_README_TEMPLATE, 'utf-8');
  }

  if (!fs.existsSync(timelogPath)) {
    fs.writeFileSync(timelogPath, `# ${boardBaseName} Timelog\n\n`, 'utf-8');
  }

  return { companionDir, timelogPath, boardBaseName };
}
