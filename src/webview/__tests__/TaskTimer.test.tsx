import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TaskTimer } from '../components/KanbanBoard/TaskTimer';
import { useKanbanStore } from '../stores/kanbanStore';

vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

describe('TaskTimer', () => {
  beforeEach(() => {
    useKanbanStore.setState({ taskTimers: {} });
  });

  it('renders nothing when the task has no timer (not in WIP)', () => {
    const { container } = render(<TaskTimer taskId="task-1" title="Task 1" />);
    expect(container.firstChild).toBeNull();
  });

  describe('running state', () => {
    beforeEach(() => {
      useKanbanStore.setState({
        taskTimers: { 'task-1': { status: 'running', startedAt: Date.now() - 65_000 } },
      });
    });

    it('shows the elapsed time and a pause button', () => {
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      expect(screen.getByTestId('timer-elapsed-task-1')).toHaveTextContent('1:05');
      expect(screen.getByLabelText('Pause timer')).toBeInTheDocument();
      expect(screen.queryByLabelText('Resume timer')).not.toBeInTheDocument();
    });

    it('pauses the timer when the pause button is clicked', () => {
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      fireEvent.click(screen.getByLabelText('Pause timer'));

      expect(useKanbanStore.getState().taskTimers['task-1']).toEqual({ status: 'paused' });
    });

    it('resets the timer when the reset button is clicked', () => {
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      fireEvent.click(screen.getByLabelText('Reset timer'));

      const timer = useKanbanStore.getState().taskTimers['task-1'];
      expect(timer?.status).toBe('running');
      if (timer?.status === 'running') {
        expect(Date.now() - timer.startedAt).toBeLessThan(1000);
      }
    });
  });

  describe('paused state', () => {
    beforeEach(() => {
      useKanbanStore.setState({ taskTimers: { 'task-1': { status: 'paused' } } });
    });

    it('shows a resume button and no elapsed time', () => {
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      expect(screen.getByLabelText('Resume timer')).toBeInTheDocument();
      expect(screen.queryByLabelText('Pause timer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('timer-elapsed-task-1')).not.toBeInTheDocument();
    });

    it('resumes the timer when the resume button is clicked', () => {
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      fireEvent.click(screen.getByLabelText('Resume timer'));

      expect(useKanbanStore.getState().taskTimers['task-1']?.status).toBe('running');
    });
  });

  describe('ticking', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('updates the displayed elapsed time every second while running', () => {
      useKanbanStore.setState({
        taskTimers: { 'task-1': { status: 'running', startedAt: Date.now() } },
      });
      render(<TaskTimer taskId="task-1" title="Task 1" />);

      expect(screen.getByTestId('timer-elapsed-task-1')).toHaveTextContent('0:00');

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByTestId('timer-elapsed-task-1')).toHaveTextContent('0:03');
    });
  });

  it('does not bubble clicks to a parent handler (avoids opening the card / starting a drag)', () => {
    useKanbanStore.setState({
      taskTimers: { 'task-1': { status: 'running', startedAt: Date.now() } },
    });
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <TaskTimer taskId="task-1" title="Task 1" />
      </div>
    );

    fireEvent.click(screen.getByLabelText('Pause timer'));

    expect(onParentClick).not.toHaveBeenCalled();
  });
});
