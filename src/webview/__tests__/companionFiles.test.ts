import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ensureCompanionFolder, boardBaseNameFor } from '../../automation/companionFiles';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-kanban-tracker-companion-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('boardBaseNameFor', () => {
  it('strips the .kanban.md suffix', () => {
    expect(boardBaseNameFor('/some/dir/opi.kanban.md')).toBe('opi');
  });
});

describe('ensureCompanionFolder', () => {
  it('creates md-kanban-tracker/ next to the kanban file with all companion files', () => {
    const kanbanFile = path.join(tmpDir, 'opi.kanban.md');
    fs.writeFileSync(kanbanFile, '# OPI Kanban\n', 'utf-8');

    const result = ensureCompanionFolder(kanbanFile);

    const companionDir = path.join(tmpDir, 'md-kanban-tracker');
    expect(result.companionDir).toBe(companionDir);
    expect(result.boardBaseName).toBe('opi');
    expect(fs.existsSync(companionDir)).toBe(true);
    expect(fs.existsSync(path.join(companionDir, 'opi.timelog.md'))).toBe(true);
    expect(fs.existsSync(path.join(companionDir, 'kanban-guia-ES.md'))).toBe(true);
    expect(fs.existsSync(path.join(companionDir, 'Readme.md'))).toBe(true);
  });

  it('is idempotent and never overwrites an existing timelog', () => {
    const kanbanFile = path.join(tmpDir, 'opi.kanban.md');
    fs.writeFileSync(kanbanFile, '# OPI Kanban\n', 'utf-8');

    ensureCompanionFolder(kanbanFile);
    const timelogPath = path.join(tmpDir, 'md-kanban-tracker', 'opi.timelog.md');
    fs.appendFileSync(timelogPath, '2026-01-01 09:00–09:10 (10m) — "Algo" (manual)\n', 'utf-8');

    ensureCompanionFolder(kanbanFile);

    const content = fs.readFileSync(timelogPath, 'utf-8');
    expect(content).toContain('Algo');
  });

  it('names the timelog file after the board, not a hardcoded name', () => {
    const kanbanFile = path.join(tmpDir, 'proyecto-x.kanban.md');
    fs.writeFileSync(kanbanFile, '# X\n', 'utf-8');

    const result = ensureCompanionFolder(kanbanFile);

    expect(result.timelogPath).toBe(path.join(tmpDir, 'md-kanban-tracker', 'proyecto-x.timelog.md'));
    expect(fs.existsSync(result.timelogPath)).toBe(true);
  });
});
