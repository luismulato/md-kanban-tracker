import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/KanbanBoard/TaskCard';
import type { KanbanTask } from '../types/kanban';

describe('TaskCard', () => {
  describe('Priority display (left border)', () => {
    it('renders high priority with red left border', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        priority: 'high',
      };

      const { container } = render(<TaskCard task={task} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-4');
      expect(card.className).toContain('border-l-vscode-error');
    });

    it('renders medium priority with yellow left border', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        priority: 'medium',
      };

      const { container } = render(<TaskCard task={task} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-4');
      expect(card.className).toContain('border-l-vscode-warning');
    });

    it('renders low priority with green left border', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        priority: 'low',
      };

      const { container } = render(<TaskCard task={task} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-4');
      expect(card.className).toContain('border-l-vscode-success');
    });

    it('renders no left border when priority is undefined', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
      };

      const { container } = render(<TaskCard task={task} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('border-l-4');
    });
  });

  describe('Type badge', () => {
    it('renders a badge for each task type', () => {
      const types = [
        ['epic', 'Epic'],
        ['story', 'Story'],
        ['task', 'Task'],
        ['spike', 'Spike'],
        ['bug', 'Bug'],
      ] as const;

      for (const [type, label] of types) {
        const task: KanbanTask = { id: '1', title: 'Test Task', type };
        const { unmount } = render(<TaskCard task={task} />);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      }
    });

    it('renders no type badge when type is undefined', () => {
      const task: KanbanTask = { id: '1', title: 'Test Task' };
      const { container } = render(<TaskCard task={task} />);
      expect(container.querySelectorAll('.rounded-full')).toHaveLength(0);
    });
  });

  describe('Type click-to-cycle', () => {
    const transitions: Array<[KanbanTask['type'], string, KanbanTask['type']]> = [
      ['epic', 'Epic', 'story'],
      ['story', 'Story', 'task'],
      ['task', 'Task', 'spike'],
      ['spike', 'Spike', 'bug'],
      ['bug', 'Bug', undefined],
    ];

    it.each(transitions)('clicking the %s badge sets the next type in the cycle', (current, label, expectedNext) => {
      const onUpdateTask = vi.fn();
      const task: KanbanTask = { id: '1', title: 'Test Task', type: current };
      render(<TaskCard task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText(label));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: expectedNext });
    });

    it('does not throw when clicked without an onUpdateTask handler', () => {
      const task: KanbanTask = { id: '1', title: 'Test Task', type: 'story' };
      render(<TaskCard task={task} />);
      expect(() => fireEvent.click(screen.getByText('Story'))).not.toThrow();
    });

    it('stops propagation so clicking the badge does not bubble to a parent handler', () => {
      const onUpdateTask = vi.fn();
      const onParentClick = vi.fn();
      const task: KanbanTask = { id: '1', title: 'Test Task', type: 'story' };

      render(
        <div onClick={onParentClick}>
          <TaskCard task={task} onUpdateTask={onUpdateTask} />
        </div>
      );

      fireEvent.click(screen.getByText('Story'));

      expect(onUpdateTask).toHaveBeenCalledTimes(1);
      expect(onParentClick).not.toHaveBeenCalled();
    });
  });

  describe('Selection highlight', () => {
    it('applies a selection ring when isSelected is true', () => {
      const task: KanbanTask = { id: '1', title: 'Test Task' };
      const { container } = render(<TaskCard task={task} isSelected />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('ring-2');
    });

    it('renders no selection ring by default', () => {
      const task: KanbanTask = { id: '1', title: 'Test Task' };
      const { container } = render(<TaskCard task={task} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('ring-2');
    });
  });

  describe('Tags display', () => {
    it('renders tags as badges', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        tags: ['frontend', 'urgent', 'bug'],
      };

      render(<TaskCard task={task} />);
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('bug')).toBeInTheDocument();
    });

    it('renders no tags when empty array', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        tags: [],
      };

      const { container } = render(<TaskCard task={task} />);
      expect(container.querySelectorAll('.bg-vscode-badge-bg')).toHaveLength(0);
    });

    it('renders no tags when undefined', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
      };

      const { container } = render(<TaskCard task={task} />);
      expect(container.querySelectorAll('.bg-vscode-badge-bg')).toHaveLength(0);
    });
  });

  describe('Steps display', () => {
    it('renders steps progress', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        steps: [
          { text: 'Step 1', completed: true },
          { text: 'Step 2', completed: false },
          { text: 'Step 3', completed: true },
        ],
      };

      render(<TaskCard task={task} />);
      expect(screen.getByText('2/3 steps completed')).toBeInTheDocument();
    });

    it('renders all steps completed', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        steps: [
          { text: 'Step 1', completed: true },
          { text: 'Step 2', completed: true },
        ],
      };

      render(<TaskCard task={task} />);
      expect(screen.getByText('2/2 steps completed')).toBeInTheDocument();
    });

    it('renders no steps progress when empty', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Test Task',
        steps: [],
      };

      render(<TaskCard task={task} />);
      expect(screen.queryByText(/steps completed/)).not.toBeInTheDocument();
    });
  });

  describe('Combined properties', () => {
    it('renders task with all properties', () => {
      const task: KanbanTask = {
        id: '1',
        title: 'Complete Task',
        priority: 'high',
        workload: 'Hard',
        tags: ['frontend', 'urgent'],
        steps: [
          { text: 'Step 1', completed: true },
          { text: 'Step 2', completed: false },
        ],
      };

      const { container } = render(<TaskCard task={task} />);

      expect(screen.getByText('Complete Task')).toBeInTheDocument();
      // Priority shows as left border, not text
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-vscode-error');
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('1/2 steps completed')).toBeInTheDocument();
    });
  });
});
