import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type { KanbanTask } from '../types/kanban';

// capture the DndContext handlers so the test can drop a step without real pointer geometry
let onDragEnd: ((e: { active: { id: string }; over: { id: string } | null }) => void) | undefined;

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragEnd: handler }: { children: React.ReactNode; onDragEnd?: typeof onDragEnd }) => {
      onDragEnd = handler;
      return <>{children}</>;
    },
  };
});

import { TaskModal } from '../components/TaskModal';

const task: KanbanTask = {
  id: '1',
  title: 'Card',
  steps: [
    { text: 'A', completed: true },
    { text: 'B', completed: false },
    { text: 'C', completed: false },
  ],
};

function setup(onUpdateTask = vi.fn()) {
  render(<TaskModal task={task} onClose={vi.fn()} onToggleStep={vi.fn()} onUpdateTask={onUpdateTask} />);
  return onUpdateTask;
}

describe('Reordering steps with drag and drop', () => {
  beforeEach(() => {
    onDragEnd = undefined;
  });

  it('renders a drag handle per step', () => {
    setup();
    expect(screen.getAllByLabelText('Drag step')).toHaveLength(3);
  });

  it('dropping A below C saves the order B, C, A and keeps A completed', () => {
    const onUpdateTask = setup();
    act(() => onDragEnd!({ active: { id: 'step-0' }, over: { id: 'step-2' } }));
    expect(onUpdateTask).toHaveBeenCalledWith('1', {
      steps: [
        { text: 'B', completed: false },
        { text: 'C', completed: false },
        { text: 'A', completed: true },
      ],
    });
  });

  it('dropping a step on itself does not update the card', () => {
    const onUpdateTask = setup();
    act(() => onDragEnd!({ active: { id: 'step-1' }, over: { id: 'step-1' } }));
    expect(onUpdateTask).not.toHaveBeenCalled();
  });

  it('dropping outside the list does not update the card', () => {
    const onUpdateTask = setup();
    act(() => onDragEnd!({ active: { id: 'step-1' }, over: null }));
    expect(onUpdateTask).not.toHaveBeenCalled();
  });
});
