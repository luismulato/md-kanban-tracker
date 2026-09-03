import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskModal } from '../components/TaskModal';
import type { KanbanTask } from '../types/kanban';

describe('TaskModal', () => {
  const baseTask: KanbanTask = {
    id: '1',
    title: 'Test Task',
  };

  const defaultProps = {
    task: baseTask,
    onClose: vi.fn(),
    onToggleStep: vi.fn(),
    onUpdateTask: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Type cycling', () => {
    it('cycles type from undefined to epic when clicked', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      const typeButton = screen.getByRole('button', { name: /set type/i });
      fireEvent.click(typeButton);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'epic' });
    });

    it('cycles type from epic to story when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, type: 'epic' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Epic'));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'story' });
    });

    it('cycles type from story to task when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, type: 'story' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Story'));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'task' });
    });

    it('cycles type from task to spike when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, type: 'task' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Task'));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'spike' });
    });

    it('cycles type from spike to bug when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, type: 'spike' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Spike'));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: 'bug' });
    });

    it('cycles type from bug to undefined when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, type: 'bug' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Bug'));

      expect(onUpdateTask).toHaveBeenCalledWith('1', { type: undefined });
    });
  });

  describe('Priority cycling', () => {
    it('cycles priority from undefined to low when clicked', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      const priorityButton = screen.getByRole('button', { name: /set priority/i });
      fireEvent.click(priorityButton);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { priority: 'low' });
    });

    it('cycles priority from low to medium when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, priority: 'low' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const priorityBadge = screen.getByText(/low/i);
      fireEvent.click(priorityBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { priority: 'medium' });
    });

    it('cycles priority from medium to high when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, priority: 'medium' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const priorityBadge = screen.getByText(/medium/i);
      fireEvent.click(priorityBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { priority: 'high' });
    });

    it('cycles priority from high to undefined when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, priority: 'high' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const priorityBadge = screen.getByText(/high/i);
      fireEvent.click(priorityBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { priority: undefined });
    });
  });

  describe('Workload cycling', () => {
    it('cycles workload from undefined to Easy when clicked', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      const workloadButton = screen.getByRole('button', { name: /set workload/i });
      fireEvent.click(workloadButton);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { workload: 'Easy' });
    });

    it('cycles workload from Easy to Normal when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, workload: 'Easy' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const workloadBadge = screen.getByText(/easy/i);
      fireEvent.click(workloadBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { workload: 'Normal' });
    });

    it('cycles workload from Normal to Hard when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, workload: 'Normal' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const workloadBadge = screen.getByText(/normal/i);
      fireEvent.click(workloadBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { workload: 'Hard' });
    });

    it('cycles workload from Hard to Extreme when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, workload: 'Hard' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const workloadBadge = screen.getByText(/hard/i);
      fireEvent.click(workloadBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { workload: 'Extreme' });
    });

    it('cycles workload from Extreme to undefined when clicked', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, workload: 'Extreme' as const };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const workloadBadge = screen.getByText(/extreme/i);
      fireEvent.click(workloadBadge);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { workload: undefined });
    });
  });

  describe('Steps management', () => {
    it('toggles step completion when checkbox clicked', () => {
      const onToggleStep = vi.fn();
      const task = {
        ...baseTask,
        steps: [
          { text: 'Step 1', completed: false },
          { text: 'Step 2', completed: true },
        ],
      };
      render(<TaskModal {...defaultProps} task={task} onToggleStep={onToggleStep} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onToggleStep).toHaveBeenCalledWith(0);
    });

    it('adds new step when add button clicked', () => {
      const onUpdateTask = vi.fn();
      const task = {
        ...baseTask,
        steps: [{ text: 'Step 1', completed: false }],
      };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const addButton = screen.getByRole('button', { name: /add step/i });
      fireEvent.click(addButton);

      expect(onUpdateTask).toHaveBeenCalledWith('1', {
        steps: [
          { text: 'Step 1', completed: false },
          { text: '', completed: false },
        ],
      });
    });

    it('removes step when delete button clicked', () => {
      const onUpdateTask = vi.fn();
      const task = {
        ...baseTask,
        steps: [
          { text: 'Step 1', completed: false },
          { text: 'Step 2', completed: true },
        ],
      };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const deleteButtons = screen.getAllByRole('button', { name: /remove step/i });
      fireEvent.click(deleteButtons[0]);

      expect(onUpdateTask).toHaveBeenCalledWith('1', {
        steps: [{ text: 'Step 2', completed: true }],
      });
    });

    it('updates step text on blur', () => {
      const onUpdateTask = vi.fn();
      const task = {
        ...baseTask,
        steps: [{ text: 'Step 1', completed: false }],
      };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const input = screen.getByDisplayValue('Step 1');
      fireEvent.change(input, { target: { value: 'Updated Step' } });
      fireEvent.blur(input);

      expect(onUpdateTask).toHaveBeenCalledWith('1', {
        steps: [{ text: 'Updated Step', completed: false }],
      });
    });
  });

  describe('Description editing', () => {
    it('updates description on blur', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, description: 'Original description' };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const textarea = screen.getByDisplayValue('Original description');
      fireEvent.change(textarea, { target: { value: 'Updated description' } });
      fireEvent.blur(textarea);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { description: 'Updated description' });
    });

    it('shows placeholder when no description', () => {
      render(<TaskModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/add description/i);
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Due date editing', () => {
    it('updates due date on change', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, dueDate: '2024-12-31' };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const dateInput = screen.getByDisplayValue('2024-12-31');
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });

      expect(onUpdateTask).toHaveBeenCalledWith('1', { dueDate: '2025-01-15' });
    });

    it('clears due date when cleared', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, dueDate: '2024-12-31' };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const dateInput = screen.getByDisplayValue('2024-12-31');
      fireEvent.change(dateInput, { target: { value: '' } });

      expect(onUpdateTask).toHaveBeenCalledWith('1', { dueDate: undefined });
    });
  });

  describe('Modal should NOT close after interactions', () => {
    it('should NOT call onClose when toggling step checkbox', () => {
      const onClose = vi.fn();
      const task = {
        ...baseTask,
        steps: [{ text: 'Step 1', completed: false }],
      };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when clicking add step button', () => {
      const onClose = vi.fn();
      render(<TaskModal {...defaultProps} onClose={onClose} />);

      const addButton = screen.getByRole('button', { name: /add step/i });
      fireEvent.click(addButton);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when clicking type badge', () => {
      const onClose = vi.fn();
      const task = { ...baseTask, type: 'story' as const };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      fireEvent.click(screen.getByText('Story'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when clicking priority badge', () => {
      const onClose = vi.fn();
      const task = { ...baseTask, priority: 'low' as const };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      const priorityBadge = screen.getByText(/low/i);
      fireEvent.click(priorityBadge);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when clicking workload badge', () => {
      const onClose = vi.fn();
      const task = { ...baseTask, workload: 'Easy' as const };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      const workloadBadge = screen.getByText(/easy/i);
      fireEvent.click(workloadBadge);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when removing a step', () => {
      const onClose = vi.fn();
      const task = {
        ...baseTask,
        steps: [{ text: 'Step 1', completed: false }],
      };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      const removeButton = screen.getByRole('button', { name: /remove step/i });
      fireEvent.click(removeButton);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when changing due date', () => {
      const onClose = vi.fn();
      const task = { ...baseTask, dueDate: '2024-12-31' };
      render(<TaskModal {...defaultProps} task={task} onClose={onClose} />);

      const dateInput = screen.getByDisplayValue('2024-12-31');
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should NOT call onClose when clicking inside modal content', () => {
      const onClose = vi.fn();
      render(<TaskModal {...defaultProps} onClose={onClose} />);

      // click on the modal title
      const title = screen.getByText('Test Task');
      fireEvent.click(title);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Title editing', () => {
    it('turns the title into an input when clicked', () => {
      render(<TaskModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Test Task'));

      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    it('commits the new title on Enter and exits edit mode', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Renamed task' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onUpdateTask).toHaveBeenCalledWith('1', { title: 'Renamed task' });
      expect(screen.queryByDisplayValue('Renamed task')).not.toBeInTheDocument();
    });

    it('also closes the whole modal on Enter', () => {
      const onClose = vi.fn();
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onClose={onClose} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Renamed task' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('reverts to the original title on Escape without saving', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Discarded edit' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onUpdateTask).not.toHaveBeenCalled();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Discarded edit')).not.toBeInTheDocument();
    });

    it('does NOT close the whole modal when Escape is pressed while editing the title', () => {
      const onClose = vi.fn();
      render(<TaskModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('commits on blur, same as Enter', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: 'Saved via blur' } });
      fireEvent.blur(input);

      expect(onUpdateTask).toHaveBeenCalledWith('1', { title: 'Saved via blur' });
    });

    it('does not save an empty or whitespace-only title', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onUpdateTask).not.toHaveBeenCalled();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('does not call onUpdateTask when the title is unchanged', () => {
      const onUpdateTask = vi.fn();
      render(<TaskModal {...defaultProps} onUpdateTask={onUpdateTask} />);

      fireEvent.click(screen.getByText('Test Task'));
      const input = screen.getByDisplayValue('Test Task');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onUpdateTask).not.toHaveBeenCalled();
    });
  });

  describe('Due date picker discoverability', () => {
    it('calls showPicker when clicking anywhere in the due date row', () => {
      const showPicker = vi.fn();
      // jsdom does not implement showPicker at all — inject it for this test
      HTMLInputElement.prototype.showPicker = showPicker;

      render(<TaskModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('due-date-row'));

      expect(showPicker).toHaveBeenCalledTimes(1);

      // @ts-expect-error cleaning up the test-only polyfill
      delete HTMLInputElement.prototype.showPicker;
    });

    it('does not throw when showPicker is not supported by the runtime', () => {
      // simulate an embedded Chromium old enough not to have showPicker
      // @ts-expect-error deliberately removing it to simulate lack of support
      delete HTMLInputElement.prototype.showPicker;

      render(<TaskModal {...defaultProps} />);

      expect(() => fireEvent.click(screen.getByTestId('due-date-row'))).not.toThrow();
    });

    it('still updates the task when the date is changed directly', () => {
      const onUpdateTask = vi.fn();
      const task = { ...baseTask, dueDate: '2024-12-31' };
      render(<TaskModal {...defaultProps} task={task} onUpdateTask={onUpdateTask} />);

      const dateInput = screen.getByDisplayValue('2024-12-31');
      fireEvent.change(dateInput, { target: { value: '2025-01-15' } });

      expect(onUpdateTask).toHaveBeenCalledWith('1', { dueDate: '2025-01-15' });
    });
  });
});
