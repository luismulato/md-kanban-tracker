import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/KanbanBoard/TaskCard';
import { MarkdownKanbanParser } from '../../markdownParser';
import { nextTaskType, TASK_TYPE_LABELS, TASK_TYPE_BADGE_VARIANT } from '../utils/taskType';
import type { KanbanTask } from '../types/kanban';

// acceptance for docs/features/bug-task-type.feature

describe('bug task type', () => {
  it('sits after spike in the cycle and clears on the next click', () => {
    expect(nextTaskType('spike')).toBe('bug');
    expect(nextTaskType('bug')).toBeUndefined();
  });

  it('has a label and an error-coloured badge variant', () => {
    expect(TASK_TYPE_LABELS.bug).toBe('Bug');
    expect(TASK_TYPE_BADGE_VARIANT.bug).toBe('error');
  });

  it('renders a "Bug" badge on the card', () => {
    const task: KanbanTask = { id: '1', title: 'Broken thing', type: 'bug' };
    render(<TaskCard task={task} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('cycles a spike card to bug when the badge is clicked', () => {
    const onUpdateTask = vi.fn();
    const task: KanbanTask = { id: '1', title: 'Test Task', type: 'spike' };
    render(<TaskCard task={task} onUpdateTask={onUpdateTask} />);

    fireEvent.click(screen.getByText('Spike'));

    expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'bug' });
  });

  it('parses "- type: bug" and round-trips it through generateMarkdown', () => {
    const markdown = `# Board

## Column

### A Bug
  - type: bug
`;
    const board = MarkdownKanbanParser.parseMarkdown(markdown);
    expect(board.columns[0].tasks[0].type).toBe('bug');

    const regenerated = MarkdownKanbanParser.generateMarkdown(board);
    const reparsed = MarkdownKanbanParser.parseMarkdown(regenerated);
    expect(reparsed.columns[0].tasks[0].type).toBe('bug');
  });
});
