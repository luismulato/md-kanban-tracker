import { describe, it, expect } from 'vitest';
import { moveStep } from '../utils/steps';
import { MarkdownKanbanParser } from '../../markdownParser';

const steps = [
  { text: 'A', completed: true },
  { text: 'B', completed: false },
  { text: 'C', completed: false },
];

describe('moveStep', () => {
  it('moves a step down', () => {
    expect(moveStep(steps, 0, 2).map((s) => s.text)).toEqual(['B', 'C', 'A']);
  });

  it('moves a step up', () => {
    expect(moveStep(steps, 2, 0).map((s) => s.text)).toEqual(['C', 'A', 'B']);
  });

  it('keeps text and completed together', () => {
    expect(moveStep(steps, 0, 2)[2]).toEqual({ text: 'A', completed: true });
  });

  it('does not mutate the input', () => {
    moveStep(steps, 0, 2);
    expect(steps.map((s) => s.text)).toEqual(['A', 'B', 'C']);
  });

  it('returns the same array for a no-op or out-of-range move', () => {
    expect(moveStep(steps, 1, 1)).toBe(steps);
    expect(moveStep(steps, -1, 1)).toBe(steps);
    expect(moveStep(steps, 0, 3)).toBe(steps);
  });
});

describe('reordered steps survive the markdown round trip', () => {
  it('parses back in the same order with the same completed state', () => {
    const board = MarkdownKanbanParser.parseMarkdown(
      '# T\n\n## To Do\n\n### Card\n\n- steps:\n  - [x] A\n  - [ ] B\n  - [ ] C\n'
    );
    const task = board.columns[0].tasks[0];
    task.steps = moveStep(task.steps!, 0, 2);

    const reparsed = MarkdownKanbanParser.parseMarkdown(MarkdownKanbanParser.generateMarkdown(board));
    expect(reparsed.columns[0].tasks[0].steps).toEqual([
      { text: 'B', completed: false },
      { text: 'C', completed: false },
      { text: 'A', completed: true },
    ]);
  });
});
