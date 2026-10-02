import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/KanbanBoard/TaskCard';
import { TaskModal } from '../components/TaskModal';
import type { KanbanTask } from '../types/kanban';

vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({ postMessage: vi.fn(), getState: vi.fn(), setState: vi.fn() }),
}));

const base: KanbanTask = { id: '1', title: 'Fix login' };

describe('card owner chip', () => {
  it('shows the owner when defined', () => {
    render(<TaskCard task={{ ...base, owner: 'Claude' }} />);
    expect(screen.getByTestId('task-owner-1')).toHaveTextContent('Claude');
  });

  it('shows nothing when there is no owner', () => {
    render(<TaskCard task={base} />);
    expect(screen.queryByTestId('task-owner-1')).toBeNull();
  });
});

describe('owner field in the task modal', () => {
  const props = { onClose: vi.fn(), onToggleStep: vi.fn(), onUpdateTask: vi.fn() };

  beforeEach(() => vi.clearAllMocks());

  it('updates the owner on blur', () => {
    const onUpdateTask = vi.fn();
    render(<TaskModal {...props} task={base} onUpdateTask={onUpdateTask} />);
    const input = screen.getByLabelText('Owner');
    fireEvent.change(input, { target: { value: 'Claude' } });
    fireEvent.blur(input);
    expect(onUpdateTask).toHaveBeenCalledWith('1', { owner: 'Claude' });
  });

  it('clears the owner when the field is emptied', () => {
    const onUpdateTask = vi.fn();
    render(<TaskModal {...props} task={{ ...base, owner: 'Claude' }} onUpdateTask={onUpdateTask} />);
    const input = screen.getByLabelText('Owner');
    fireEvent.change(input, { target: { value: '  ' } });
    fireEvent.blur(input);
    expect(onUpdateTask).toHaveBeenCalledWith('1', { owner: undefined });
  });

  it('does not update when the owner did not change', () => {
    const onUpdateTask = vi.fn();
    render(<TaskModal {...props} task={{ ...base, owner: 'Claude' }} onUpdateTask={onUpdateTask} />);
    fireEvent.blur(screen.getByLabelText('Owner'));
    expect(onUpdateTask).not.toHaveBeenCalled();
  });

  it('works in create mode too', () => {
    const onUpdateTask = vi.fn();
    render(<TaskModal {...props} task={base} onUpdateTask={onUpdateTask} isCreateMode onCreateTask={vi.fn()} />);
    const input = screen.getByLabelText('Owner');
    fireEvent.change(input, { target: { value: 'Claude' } });
    fireEvent.blur(input);
    expect(onUpdateTask).toHaveBeenCalledWith('1', { owner: 'Claude' });
  });
});
