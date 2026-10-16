import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
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

const columnTitles = () =>
  useKanbanStore.getState().board?.columns[0].tasks.map(t => t.title);

const hoverCard = (title: string) => {
  const card = screen.getByText(title).closest('[data-testid^="task-card-"]');
  if (!card) throw new Error(`card "${title}" not found`);
  fireEvent.mouseEnter(card);
  return card;
};

describe('card hover delete control', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      board: {
        title: 'Board',
        columns: [{ id: 'col-1', title: 'To Do', tasks: [first, second, third] }],
      },
      isLoading: false,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      selectedTaskIds: new Set(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the delete control while the card is not hovered', () => {
    renderCard(second);

    expect(screen.queryByRole('button', { name: 'Delete card' })).not.toBeInTheDocument();
  });

  it('shows the delete control on hover', () => {
    renderCard(second);
    hoverCard('Second');

    expect(screen.getByRole('button', { name: 'Delete card' })).toBeInTheDocument();
  });

  it('deletes the card after confirming', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }));

    expect(columnTitles()).toEqual(['First', 'Third']);
  });

  it('keeps the card when the confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }));

    expect(columnTitles()).toEqual(['First', 'Second', 'Third']);
  });

  it('deletes every selected card when several are selected', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useKanbanStore.setState({ selectedTaskIds: new Set(['task-1', 'task-2']) });
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }));

    expect(columnTitles()).toEqual(['Third']);
  });

  it('does not open the edit modal when clicking the control', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCard(second);
    hoverCard('Second');

    fireEvent.click(screen.getByRole('button', { name: 'Delete card' }));

    expect(useKanbanStore.getState().openTaskId).toBeNull();
  });
});
