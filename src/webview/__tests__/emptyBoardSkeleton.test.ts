import { describe, it, expect } from 'vitest';
import {
  EMPTY_BOARD_SKELETON,
  DEFAULT_CARD_TITLE,
  isBlankBoardContent,
} from '../../templates/emptyBoardSkeleton';
import { MarkdownKanbanParser } from '../../markdownParser';

describe('isBlankBoardContent', () => {
  it('is true for an empty string', () => {
    expect(isBlankBoardContent('')).toBe(true);
  });

  it('is true for whitespace-only content (spaces, tabs, newlines)', () => {
    expect(isBlankBoardContent('   \n\t\n  \r\n')).toBe(true);
  });

  it('is false once there is any real content', () => {
    expect(isBlankBoardContent('# My board\n')).toBe(false);
    expect(isBlankBoardContent('## To Do\n')).toBe(false);
  });
});

describe('EMPTY_BOARD_SKELETON', () => {
  const board = MarkdownKanbanParser.parseMarkdown(EMPTY_BOARD_SKELETON);

  it('has the five standard columns in order', () => {
    expect(board.columns.map(c => c.title)).toEqual([
      'Backlog',
      'To Do',
      'WIP',
      'Done',
      'Done Done',
    ]);
  });

  it('seeds a single default card in To Do and nowhere else', () => {
    const todo = board.columns.find(c => c.title === 'To Do')!;
    expect(todo.tasks).toHaveLength(1);
    expect(todo.tasks[0].title).toBe(DEFAULT_CARD_TITLE);

    const otherTasks = board.columns
      .filter(c => c.title !== 'To Do')
      .flatMap(c => c.tasks);
    expect(otherTasks).toHaveLength(0);
  });

  it('round-trips through the parser unchanged', () => {
    const regenerated = MarkdownKanbanParser.generateMarkdown(board);
    const reparsed = MarkdownKanbanParser.parseMarkdown(regenerated);
    expect(reparsed.columns.map(c => c.title)).toEqual(
      board.columns.map(c => c.title),
    );
    expect(reparsed.columns.find(c => c.title === 'To Do')!.tasks[0].title).toBe(
      DEFAULT_CARD_TITLE,
    );
  });

  it('is not itself considered blank', () => {
    expect(isBlankBoardContent(EMPTY_BOARD_SKELETON)).toBe(false);
  });
});
