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

// mock vscode api
vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

// import after mock
import { SortableTask } from '../components/KanbanBoard/SortableTask';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>
    <SortableContext items={['1']}>
      {children}
    </SortableContext>
  </DndContext>
);

// helper to check if modal is open via store
function ModalChecker() {
  const openTaskId = useKanbanStore((s) => s.openTaskId);
  return <div data-testid="modal-checker" data-open={openTaskId || ''} />;
}

const isModalOpenViaStore = () => {
  const checker = screen.queryByTestId('modal-checker');
  return checker?.getAttribute('data-open') !== '';
};

describe('SortableTask modal behavior', () => {
  const baseTask: KanbanTask = {
    id: '1',
    title: 'Test Task',
    steps: [
      { text: 'Step 1', completed: false },
    ],
  };

  beforeEach(() => {
    // reset store state before each test
    useKanbanStore.setState({
      board: null,
      isLoading: true,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
    });
  });

  // wrapper with ModalChecker to verify modal state
  const wrapperWithChecker = ({ children }: { children: React.ReactNode }) => (
    <DndContext>
      <SortableContext items={['1']}>
        {children}
        <ModalChecker />
      </SortableContext>
    </DndContext>
  );

  it('should open modal when task card is clicked', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper: wrapperWithChecker }
    );

    // modal should not be open initially
    expect(isModalOpenViaStore()).toBe(false);

    // click on the task card
    const taskCard = screen.getByText('Test Task');
    fireEvent.click(taskCard);

    // modal should be open
    expect(isModalOpenViaStore()).toBe(true);
  });

  it('should keep modal open after task update (re-render)', async () => {
    const onUpdateTask = vi.fn();
    const { rerender } = render(
      <>
        <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />
        <ModalChecker />
      </>,
      { wrapper }
    );

    // open modal
    const taskCard = screen.getByText('Test Task');
    fireEvent.click(taskCard);

    // verify modal is open
    expect(isModalOpenViaStore()).toBe(true);

    // simulate task update (as if parent component updated)
    const updatedTask = {
      ...baseTask,
      steps: [{ text: 'Step 1', completed: true }],
    };
    rerender(
      <>
        <SortableTask task={updatedTask} columnId="col-1" onUpdateTask={onUpdateTask} />
        <ModalChecker />
      </>
    );

    // modal should still be open because state is in store
    expect(isModalOpenViaStore()).toBe(true);
  });

  it('should persist modal state across multiple re-renders', () => {
    const onUpdateTask = vi.fn();
    const { rerender } = render(
      <>
        <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />
        <ModalChecker />
      </>,
      { wrapper }
    );

    // open modal
    fireEvent.click(screen.getByText('Test Task'));
    expect(isModalOpenViaStore()).toBe(true);

    // simulate multiple task updates
    for (let i = 0; i < 3; i++) {
      const updatedTask = {
        ...baseTask,
        priority: ['low', 'medium', 'high'][i] as 'low' | 'medium' | 'high',
      };
      rerender(
        <>
          <SortableTask task={updatedTask} columnId="col-1" onUpdateTask={onUpdateTask} />
          <ModalChecker />
        </>
      );
      // modal should still be open after each re-render
      expect(isModalOpenViaStore()).toBe(true);
    }
  });
});

describe('SortableTask context menu', () => {
  const baseTask: KanbanTask = {
    id: 'task-1',
    title: 'Test Task',
  };

  beforeEach(() => {
    useKanbanStore.setState({
      board: {
        title: 'Board',
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [
              baseTask,
              { id: 'task-2', title: 'Second Task' },
            ],
          },
        ],
      },
      isLoading: false,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
    });
  });

  it('shows "Move to top" option on right-click', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Test Task'));

    expect(screen.getByRole('menuitem', { name: 'Move to top' })).toBeInTheDocument();
  });

  it('moves the task to the top of its column when clicked', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={{ id: 'task-2', title: 'Second Task' }} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Second Task'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Move to top' }));

    const tasks = useKanbanStore.getState().board?.columns[0].tasks;
    expect(tasks?.[0].id).toBe('task-2');
  });

  it('closes the menu on Escape', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Test Task'));
    expect(screen.getByRole('menuitem', { name: 'Move to top' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: 'Move to top' })).not.toBeInTheDocument();
  });

  it('shows "Delete card" option on right-click', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Test Task'));

    expect(screen.getByRole('menuitem', { name: 'Delete card' })).toBeInTheDocument();
  });

  it('deletes the task when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Test Task'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete card' }));

    const tasks = useKanbanStore.getState().board?.columns[0].tasks;
    expect(tasks?.map(t => t.id)).toEqual(['task-2']);
    vi.restoreAllMocks();
  });

  it('does not delete the task when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.contextMenu(screen.getByText('Test Task'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete card' }));

    const tasks = useKanbanStore.getState().board?.columns[0].tasks;
    expect(tasks?.map(t => t.id)).toEqual(['task-1', 'task-2']);
    vi.restoreAllMocks();
  });
});

describe('SortableTask multi-select', () => {
  const baseTask: KanbanTask = {
    id: 'task-1',
    title: 'Test Task',
  };

  beforeEach(() => {
    useKanbanStore.setState({
      board: {
        title: 'Board',
        columns: [
          {
            id: 'col-1',
            title: 'To Do',
            tasks: [
              baseTask,
              { id: 'task-2', title: 'Second Task' },
            ],
          },
        ],
      },
      isLoading: false,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      selectedTaskIds: new Set(),
    });
  });

  const wrapperWithChecker = ({ children }: { children: React.ReactNode }) => (
    <DndContext>
      <SortableContext items={['task-1', 'task-2']}>
        {children}
        <ModalChecker />
      </SortableContext>
    </DndContext>
  );

  it('toggles selection on Cmd+click instead of opening the modal', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper: wrapperWithChecker }
    );

    fireEvent.click(screen.getByText('Test Task'), { metaKey: true });

    expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(true);
    expect(isModalOpenViaStore()).toBe(false);
  });

  it('toggles selection on Ctrl+click too', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('Test Task'), { ctrlKey: true });

    expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(true);
  });

  it('deselects a task on a second Cmd+click', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('Test Task'), { metaKey: true });
    fireEvent.click(screen.getByText('Test Task'), { metaKey: true });

    expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(false);
  });

  it('a plain click still opens the modal and does not touch the selection', () => {
    const onUpdateTask = vi.fn();
    render(
      <SortableTask task={baseTask} columnId="col-1" onUpdateTask={onUpdateTask} />,
      { wrapper: wrapperWithChecker }
    );

    fireEvent.click(screen.getByText('Test Task'));

    expect(isModalOpenViaStore()).toBe(true);
    expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(false);
  });
});
