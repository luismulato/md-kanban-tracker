import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { KanbanTask } from '../types/kanban';
import { useKanbanStore } from '../stores/kanbanStore';

// mock SortableTask without dnd-kit complexity
vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable');
  return {
    ...actual,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  };
});

const postMessage = vi.fn();
vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: (...args: unknown[]) => postMessage(...args),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

// import after mock
import { SortableTask } from '../components/KanbanBoard/SortableTask';

const first: KanbanTask = { id: 'task-1', title: 'First' };
const second: KanbanTask = { id: 'task-2', title: 'Second' };
const third: KanbanTask = { id: 'task-3', title: 'Third' };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>
    <SortableContext items={['task-1', 'task-2', 'task-3']}>{children}</SortableContext>
  </DndContext>
);

const renderCard = (task: KanbanTask) =>
  render(<SortableTask task={task} columnId="col-1" onUpdateTask={vi.fn()} />, { wrapper });

const columnOrder = () =>
  useKanbanStore.getState().board?.columns[0].tasks.map(t => t.title);

const hoverCard = (title: string) => {
  const card = screen.getByText(title).closest('[data-testid^="task-card-"]');
  if (!card) throw new Error(`card "${title}" not found`);
  fireEvent.mouseEnter(card);
  return card;
};

describe('card hover move controls', () => {
  beforeEach(() => {
    postMessage.mockClear();
    useKanbanStore.setState({
      board: {
        title: 'Board',
        columns: [
          { id: 'col-1', title: 'To Do', tasks: [first, second, third] },
        ],
      },
      isLoading: false,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      selectedTaskIds: new Set(),
    });
  });

  it('hides the move controls while the card is not hovered', () => {
    renderCard(second);

    expect(screen.queryByRole('button', { name: 'Move up' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move to top' })).not.toBeInTheDocument();
  });

  it('shows both move controls on hover', () => {
    renderCard(second);
    hoverCard('Second');

    expect(screen.getByRole('button', { name: 'Move up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move to top' })).toBeInTheDocument();
  });

  it('hides the controls again when the pointer leaves the card', () => {
    renderCard(second);
    const card = hoverCard('Second');

    fireEvent.mouseLeave(card);

    expect(screen.queryByRole('button', { name: 'Move up' })).not.toBeInTheDocument();
  });

  it('moves the card one position up', () => {
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }));

    expect(columnOrder()).toEqual(['Second', 'First', 'Third']);
  });

  it('moves the card to the top of its column', () => {
    renderCard(third);
    hoverCard('Third');

    fireEvent.click(screen.getByRole('button', { name: 'Move to top' }));

    expect(columnOrder()).toEqual(['Third', 'First', 'Second']);
  });

  it('persists the new order through a moveTask message', () => {
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }));

    expect(postMessage).toHaveBeenCalledWith({
      type: 'moveTask',
      taskId: 'task-2',
      fromColumnId: 'col-1',
      toColumnId: 'col-1',
      newIndex: 0,
    });
  });

  it('disables both controls for the first card of the column', () => {
    renderCard(first);
    hoverCard('First');

    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move to top' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move to top' }));

    expect(columnOrder()).toEqual(['First', 'Second', 'Third']);
  });

  it('does not open the task modal when a move control is clicked', () => {
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }));

    expect(useKanbanStore.getState().openTaskId).toBeNull();
  });
});
