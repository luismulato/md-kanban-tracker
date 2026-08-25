import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKanbanStore, useDisplayColumns, useModalTask, getBoardFingerprint } from '../stores/kanbanStore';
import type { KanbanBoard, KanbanColumn, KanbanTask } from '../types/kanban';

// mock vscode api
vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

const createMockBoard = (): KanbanBoard => ({
  title: 'Test Board',
  columns: [
    {
      id: 'col-1',
      title: 'To Do',
      tasks: [
        { id: 'task-1', title: 'Task 1' },
        { id: 'task-2', title: 'Task 2' },
      ],
    },
    {
      id: 'col-2',
      title: 'Done',
      tasks: [
        { id: 'task-3', title: 'Task 3' },
      ],
    },
  ],
});

describe('kanbanStore', () => {
  beforeEach(() => {
    // reset store state before each test
    useKanbanStore.setState({
      board: null,
      isLoading: true,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      newTaskColumnId: null,
      selectedTaskIds: new Set(),
      taskTimers: {},
    });
  });

  describe('getBoardFingerprint', () => {
    it('returns empty string for null board', () => {
      expect(getBoardFingerprint(null)).toBe('');
    });

    it('creates fingerprint from column ids and task ids', () => {
      const board = createMockBoard();
      const fingerprint = getBoardFingerprint(board);
      expect(fingerprint).toBe('col-1:[task-1,task-2]|col-2:[task-3]');
    });

    it('returns same fingerprint for identical boards', () => {
      const board1 = createMockBoard();
      const board2 = createMockBoard();
      expect(getBoardFingerprint(board1)).toBe(getBoardFingerprint(board2));
    });

    it('returns different fingerprint when task order changes', () => {
      const board1 = createMockBoard();
      const board2 = createMockBoard();
      // swap task order
      const temp = board2.columns[0].tasks[0];
      board2.columns[0].tasks[0] = board2.columns[0].tasks[1];
      board2.columns[0].tasks[1] = temp;
      expect(getBoardFingerprint(board1)).not.toBe(getBoardFingerprint(board2));
    });
  });

  describe('setBoard', () => {
    it('sets board and clears loading state', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      const state = useKanbanStore.getState();
      expect(state.board).toEqual(board);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('syncFromBackend', () => {
    it('updates board when not dragging', () => {
      // set initial board first
      const initialBoard = createMockBoard();
      useKanbanStore.getState().setBoard(initialBoard);

      // now sync with different board
      const newBoard = createMockBoard();
      newBoard.columns[0].tasks.push({ id: 'task-4', title: 'Task 4' });
      useKanbanStore.getState().syncFromBackend(newBoard);

      expect(useKanbanStore.getState().board).toEqual(newBoard);
    });

    it('ignores update when dragging', () => {
      const board1 = createMockBoard();
      useKanbanStore.getState().setBoard(board1);
      useKanbanStore.getState().startDrag('task-1');

      const board2 = createMockBoard();
      board2.title = 'Updated Board';
      useKanbanStore.getState().syncFromBackend(board2);

      // should still have original board
      expect(useKanbanStore.getState().board?.title).toBe('Test Board');
    });

    it('skips update when fingerprints match', () => {
      const board1 = createMockBoard();
      useKanbanStore.getState().setBoard(board1);

      // create identical board (different reference)
      const board2 = createMockBoard();

      // spy on setState
      const originalBoard = useKanbanStore.getState().board;
      useKanbanStore.getState().syncFromBackend(board2);

      // should be same reference (no update)
      expect(useKanbanStore.getState().board).toBe(originalBoard);
    });
  });

  describe('updateTask', () => {
    it('updates task in board state', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().updateTask('task-1', { title: 'Updated Task' });

      const updatedTask = useKanbanStore.getState().board?.columns[0].tasks[0];
      expect(updatedTask?.title).toBe('Updated Task');
    });

    it('preserves other task properties', () => {
      const board = createMockBoard();
      board.columns[0].tasks[0].priority = 'high';
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().updateTask('task-1', { title: 'Updated Task' });

      const updatedTask = useKanbanStore.getState().board?.columns[0].tasks[0];
      expect(updatedTask?.priority).toBe('high');
      expect(updatedTask?.title).toBe('Updated Task');
    });

    it('updates fingerprint after task update', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      // add a new task to change fingerprint
      const newBoard = createMockBoard();
      newBoard.columns[0].tasks.push({ id: 'task-4', title: 'Task 4' });

      useKanbanStore.getState().syncFromBackend(newBoard);

      // fingerprint should have changed, board should update
      expect(useKanbanStore.getState().board?.columns[0].tasks.length).toBe(3);
    });
  });

  describe('modal operations', () => {
    it('opens modal with task id', () => {
      useKanbanStore.getState().openModal('task-1');
      expect(useKanbanStore.getState().openTaskId).toBe('task-1');
    });

    it('closes modal', () => {
      useKanbanStore.getState().openModal('task-1');
      useKanbanStore.getState().closeModal();
      expect(useKanbanStore.getState().openTaskId).toBeNull();
    });

    it('modal persists through board updates', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-1');

      // update task (simulating user interaction)
      useKanbanStore.getState().updateTask('task-1', { title: 'Updated' });

      // modal should still be open
      expect(useKanbanStore.getState().openTaskId).toBe('task-1');
    });

    it('modal persists through backend sync', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-1');

      // sync from backend with same fingerprint
      const board2 = createMockBoard();
      useKanbanStore.getState().syncFromBackend(board2);

      // modal should still be open
      expect(useKanbanStore.getState().openTaskId).toBe('task-1');
    });
  });

  describe('drag operations', () => {
    it('startDrag sets isDragging and creates dragPreview', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().startDrag('task-1');

      const state = useKanbanStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.dragPreview).toEqual(board.columns);
    });

    it('updateDragPreview updates preview columns', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().startDrag('task-1');

      const newColumns: KanbanColumn[] = [
        { id: 'col-1', title: 'To Do', tasks: [{ id: 'task-2', title: 'Task 2' }] },
        { id: 'col-2', title: 'Done', tasks: [{ id: 'task-3', title: 'Task 3' }, { id: 'task-1', title: 'Task 1' }] },
      ];
      useKanbanStore.getState().updateDragPreview(newColumns);

      expect(useKanbanStore.getState().dragPreview).toEqual(newColumns);
    });

    it('endDrag clears isDragging and dragPreview', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().startDrag('task-1');
      useKanbanStore.getState().endDrag();

      const state = useKanbanStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.dragPreview).toBeNull();
    });

    it('cancelDrag restores original columns', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().startDrag('task-1');

      // modify preview
      const newColumns: KanbanColumn[] = [
        { id: 'col-1', title: 'To Do', tasks: [] },
        { id: 'col-2', title: 'Done', tasks: board.columns[0].tasks.concat(board.columns[1].tasks) },
      ];
      useKanbanStore.getState().updateDragPreview(newColumns);

      // cancel should restore original
      useKanbanStore.getState().cancelDrag();

      const state = useKanbanStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.dragPreview).toBeNull();
      // original board should be unchanged
      expect(state.board?.columns[0].tasks.length).toBe(2);
    });
  });

  describe('moveTask', () => {
    it('moves task between columns in board state', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveTask('task-1', 'col-1', 'col-2', 0);

      const state = useKanbanStore.getState();
      expect(state.board?.columns[0].tasks.length).toBe(1);
      expect(state.board?.columns[1].tasks.length).toBe(2);
      expect(state.board?.columns[1].tasks[0].id).toBe('task-1');
    });
  });

  describe('reorderTask', () => {
    it('reorders task within same column', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().reorderTask('col-1', 0, 1);

      const state = useKanbanStore.getState();
      expect(state.board?.columns[0].tasks[0].id).toBe('task-2');
      expect(state.board?.columns[0].tasks[1].id).toBe('task-1');
    });
  });

  describe('moveTaskToTop', () => {
    it('moves a task to the top of its column', () => {
      const board = createMockBoard();
      board.columns[0].tasks.push({ id: 'task-4', title: 'Task 4' });
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveTaskToTop('col-1', 'task-4');

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-4', 'task-1', 'task-2']);
    });

    it('does nothing when the task is already at the top', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveTaskToTop('col-1', 'task-1');

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-1', 'task-2']);
    });

    it('does nothing when the task is not found', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveTaskToTop('col-1', 'missing-task');

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-1', 'task-2']);
    });
  });

  describe('deleteTask', () => {
    it('removes the task from its column', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().deleteTask('col-1', 'task-1');

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-2']);
    });

    it('closes the modal when deleting the task that is open', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-1');

      useKanbanStore.getState().deleteTask('col-1', 'task-1');

      expect(useKanbanStore.getState().openTaskId).toBeNull();
    });

    it('leaves the modal open when deleting a different task', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-2');

      useKanbanStore.getState().deleteTask('col-1', 'task-1');

      expect(useKanbanStore.getState().openTaskId).toBe('task-2');
    });

    it('does nothing when the task is not found', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().deleteTask('col-1', 'missing-task');

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-1', 'task-2']);
    });

    it('does nothing when there is no board', () => {
      expect(() => useKanbanStore.getState().deleteTask('col-1', 'task-1')).not.toThrow();
    });
  });

  describe('deleteSelectedTasks', () => {
    it('removes every given task, from any column', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().deleteSelectedTasks(['task-1', 'task-3']);

      const columns = useKanbanStore.getState().board?.columns;
      expect(columns?.[0].tasks.map(t => t.id)).toEqual(['task-2']);
      expect(columns?.[1].tasks).toHaveLength(0);
    });

    it('clears the selection after deleting', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().toggleTaskSelection('task-1');
      useKanbanStore.getState().toggleTaskSelection('task-3');

      useKanbanStore.getState().deleteSelectedTasks(['task-1', 'task-3']);

      expect(useKanbanStore.getState().selectedTaskIds.size).toBe(0);
    });

    it('closes the modal if it was open on one of the deleted tasks', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-1');

      useKanbanStore.getState().deleteSelectedTasks(['task-1', 'task-3']);

      expect(useKanbanStore.getState().openTaskId).toBeNull();
    });

    it('leaves the modal open when it is showing an unrelated task', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().openModal('task-2');

      useKanbanStore.getState().deleteSelectedTasks(['task-1', 'task-3']);

      expect(useKanbanStore.getState().openTaskId).toBe('task-2');
    });

    it('does nothing when none of the given ids exist', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().deleteSelectedTasks(['missing-1', 'missing-2']);

      const columns = useKanbanStore.getState().board?.columns;
      expect(columns?.[0].tasks.map(t => t.id)).toEqual(['task-1', 'task-2']);
      expect(columns?.[1].tasks.map(t => t.id)).toEqual(['task-3']);
    });

    it('does nothing when there is no board', () => {
      expect(() => useKanbanStore.getState().deleteSelectedTasks(['task-1'])).not.toThrow();
    });
  });

  describe('toggleTaskSelection / clearSelection', () => {
    it('adds a task to the selection when toggled on', () => {
      useKanbanStore.getState().toggleTaskSelection('task-1');
      expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(true);
    });

    it('removes a task from the selection when toggled again', () => {
      useKanbanStore.getState().toggleTaskSelection('task-1');
      useKanbanStore.getState().toggleTaskSelection('task-1');
      expect(useKanbanStore.getState().selectedTaskIds.has('task-1')).toBe(false);
    });

    it('tracks multiple selected tasks independently', () => {
      useKanbanStore.getState().toggleTaskSelection('task-1');
      useKanbanStore.getState().toggleTaskSelection('task-3');
      expect(useKanbanStore.getState().selectedTaskIds).toEqual(new Set(['task-1', 'task-3']));
    });

    it('clearSelection empties the selection', () => {
      useKanbanStore.getState().toggleTaskSelection('task-1');
      useKanbanStore.getState().toggleTaskSelection('task-2');
      useKanbanStore.getState().clearSelection();
      expect(useKanbanStore.getState().selectedTaskIds.size).toBe(0);
    });
  });

  describe('moveSelectedTasks', () => {
    it('moves several selected tasks from different columns into the target column, in original order', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveSelectedTasks(['task-2', 'task-3'], 'col-1', 1);

      const columns = useKanbanStore.getState().board?.columns;
      expect(columns?.[0].tasks.map(t => t.id)).toEqual(['task-1', 'task-2', 'task-3']);
      expect(columns?.[1].tasks).toHaveLength(0);
    });

    it('clears the selection after moving', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);
      useKanbanStore.getState().toggleTaskSelection('task-1');
      useKanbanStore.getState().toggleTaskSelection('task-3');

      useKanbanStore.getState().moveSelectedTasks(['task-1', 'task-3'], 'col-2', 0);

      expect(useKanbanStore.getState().selectedTaskIds.size).toBe(0);
    });

    it('reorders a selected group within the same column', () => {
      const board = createMockBoard();
      board.columns[0].tasks.push({ id: 'task-4', title: 'Task 4' });
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveSelectedTasks(['task-1', 'task-4'], 'col-1', 1);

      const tasks = useKanbanStore.getState().board?.columns[0].tasks;
      expect(tasks?.map(t => t.id)).toEqual(['task-2', 'task-1', 'task-4']);
    });

    it('does nothing when none of the given ids exist', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().moveSelectedTasks(['missing-1', 'missing-2'], 'col-1', 0);

      const columns = useKanbanStore.getState().board?.columns;
      expect(columns?.[0].tasks.map(t => t.id)).toEqual(['task-1', 'task-2']);
      expect(columns?.[1].tasks.map(t => t.id)).toEqual(['task-3']);
    });

    it('does nothing when there is no board', () => {
      expect(() =>
        useKanbanStore.getState().moveSelectedTasks(['task-1'], 'col-1', 0)
      ).not.toThrow();
    });
  });

  describe('addTask', () => {
    it('adds new task to specified column', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().addTask('col-1', { title: 'New Task' });

      const state = useKanbanStore.getState();
      expect(state.board?.columns[0].tasks.length).toBe(3);
      expect(state.board?.columns[0].tasks[2].title).toBe('New Task');
    });

    it('generates unique id for new task', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().addTask('col-1', { title: 'New Task' });

      const state = useKanbanStore.getState();
      const newTask = state.board?.columns[0].tasks[2];
      expect(newTask?.id).toBeDefined();
      expect(newTask?.id).not.toBe('task-1');
      expect(newTask?.id).not.toBe('task-2');
    });

    it('adds task with all provided properties', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().addTask('col-1', {
        title: 'New Task',
        priority: 'high',
        workload: 'Hard',
        description: 'Test description',
      });

      const state = useKanbanStore.getState();
      const newTask = state.board?.columns[0].tasks[2];
      expect(newTask?.title).toBe('New Task');
      expect(newTask?.priority).toBe('high');
      expect(newTask?.workload).toBe('Hard');
      expect(newTask?.description).toBe('Test description');
    });

    it('does nothing if column not found', () => {
      const board = createMockBoard();
      useKanbanStore.getState().setBoard(board);

      useKanbanStore.getState().addTask('non-existent', { title: 'New Task' });

      const state = useKanbanStore.getState();
      expect(state.board?.columns[0].tasks.length).toBe(2);
      expect(state.board?.columns[1].tasks.length).toBe(1);
    });
  });

  describe('WIP timers', () => {
    const createBoardWithWip = (): KanbanBoard => ({
      title: 'Test Board',
      columns: [
        { id: 'col-todo', title: 'To Do', tasks: [{ id: 'task-1', title: 'Task 1' }] },
        { id: 'col-wip', title: 'WIP', tasks: [] },
        { id: 'col-done', title: 'Done', tasks: [] },
      ],
    });

    describe('automatic sync with WIP membership', () => {
      it('starts a running timer for a task that is already in WIP on setBoard', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];

        useKanbanStore.getState().setBoard(board);

        const timer = useKanbanStore.getState().taskTimers['task-wip'];
        expect(timer).toEqual({ status: 'running', startedAt: expect.any(Number) });
      });

      it('does not create a timer for tasks outside WIP', () => {
        const board = createBoardWithWip();
        useKanbanStore.getState().setBoard(board);

        expect(useKanbanStore.getState().taskTimers['task-1']).toBeUndefined();
      });

      it('starts a timer when a task moves into WIP', () => {
        const board = createBoardWithWip();
        useKanbanStore.getState().setBoard(board);

        useKanbanStore.getState().moveTask('task-1', 'col-todo', 'col-wip', 0);

        expect(useKanbanStore.getState().taskTimers['task-1']?.status).toBe('running');
      });

      it('drops the timer immediately when a task leaves WIP', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);
        expect(useKanbanStore.getState().taskTimers['task-wip']).toBeDefined();

        useKanbanStore.getState().moveTask('task-wip', 'col-wip', 'col-done', 0);

        expect(useKanbanStore.getState().taskTimers['task-wip']).toBeUndefined();
      });

      it('drops the timer when a WIP task is deleted', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);

        useKanbanStore.getState().deleteTask('col-wip', 'task-wip');

        expect(useKanbanStore.getState().taskTimers['task-wip']).toBeUndefined();
      });

      it('preserves an already-tracked timer state instead of resetting it on re-sync', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);
        useKanbanStore.getState().pauseTaskTimer('task-wip', 'In progress');

        // an unrelated board update (e.g. from the backend) shouldn't touch it
        useKanbanStore.getState().moveTask('task-1', 'col-todo', 'col-done', 0);

        expect(useKanbanStore.getState().taskTimers['task-wip']).toEqual({ status: 'paused' });
      });
    });

    describe('pauseTaskTimer / resumeTaskTimer / resetTaskTimer', () => {
      it('pauses a running timer', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);

        useKanbanStore.getState().pauseTaskTimer('task-wip', 'In progress');

        expect(useKanbanStore.getState().taskTimers['task-wip']).toEqual({ status: 'paused' });
      });

      it('resumes a paused timer with a fresh start time', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);
        useKanbanStore.getState().pauseTaskTimer('task-wip', 'In progress');

        useKanbanStore.getState().resumeTaskTimer('task-wip', 'In progress');

        expect(useKanbanStore.getState().taskTimers['task-wip']).toEqual({
          status: 'running',
          startedAt: expect.any(Number),
        });
      });

      it('reset always leaves the timer running with a fresh start time', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [{ id: 'task-wip', title: 'In progress' }];
        useKanbanStore.getState().setBoard(board);

        useKanbanStore.getState().resetTaskTimer('task-wip', 'In progress');

        expect(useKanbanStore.getState().taskTimers['task-wip']).toEqual({
          status: 'running',
          startedAt: expect.any(Number),
        });
      });
    });

    describe('pauseAllWipTimers / resumeAllWipTimers', () => {
      it('pauses every running WIP timer, leaving already-paused ones alone', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [
          { id: 'task-a', title: 'A' },
          { id: 'task-b', title: 'B' },
        ];
        useKanbanStore.getState().setBoard(board);
        useKanbanStore.getState().pauseTaskTimer('task-b', 'B');

        useKanbanStore.getState().pauseAllWipTimers();

        expect(useKanbanStore.getState().taskTimers['task-a']).toEqual({ status: 'paused' });
        expect(useKanbanStore.getState().taskTimers['task-b']).toEqual({ status: 'paused' });
      });

      it('resumes every paused WIP timer, leaving already-running ones alone', () => {
        const board = createBoardWithWip();
        board.columns.find((c) => c.id === 'col-wip')!.tasks = [
          { id: 'task-a', title: 'A' },
          { id: 'task-b', title: 'B' },
        ];
        useKanbanStore.getState().setBoard(board);
        useKanbanStore.getState().pauseTaskTimer('task-a', 'A');

        useKanbanStore.getState().resumeAllWipTimers();

        expect(useKanbanStore.getState().taskTimers['task-a']?.status).toBe('running');
        expect(useKanbanStore.getState().taskTimers['task-b']?.status).toBe('running');
      });

      it('does nothing when there is no WIP column', () => {
        useKanbanStore.setState({ board: null });
        expect(() => useKanbanStore.getState().pauseAllWipTimers()).not.toThrow();
        expect(() => useKanbanStore.getState().resumeAllWipTimers()).not.toThrow();
      });
    });
  });

  describe('openModalForNewTask', () => {
    it('sets newTaskColumnId and opens modal with null taskId', () => {
      useKanbanStore.getState().openModalForNewTask('col-1');

      const state = useKanbanStore.getState();
      expect(state.newTaskColumnId).toBe('col-1');
      expect(state.openTaskId).toBeNull();
    });

    it('closeModal clears newTaskColumnId', () => {
      useKanbanStore.getState().openModalForNewTask('col-1');
      useKanbanStore.getState().closeModal();

      const state = useKanbanStore.getState();
      expect(state.newTaskColumnId).toBeNull();
    });
  });

  describe('selectors', () => {
    describe('useDisplayColumns', () => {
      it('returns board columns when not dragging', () => {
        const board = createMockBoard();
        useKanbanStore.setState({ board, isDragging: false, dragPreview: null });

        // manually test selector logic
        const state = useKanbanStore.getState();
        const columns = state.isDragging ? state.dragPreview : state.board?.columns;
        expect(columns).toEqual(board.columns);
      });

      it('returns dragPreview when dragging', () => {
        const board = createMockBoard();
        const preview: KanbanColumn[] = [{ id: 'preview', title: 'Preview', tasks: [] }];
        useKanbanStore.setState({ board, isDragging: true, dragPreview: preview });

        const state = useKanbanStore.getState();
        const columns = state.isDragging ? state.dragPreview : state.board?.columns;
        expect(columns).toEqual(preview);
      });
    });

    describe('useModalTask', () => {
      it('returns null when no task is open', () => {
        const board = createMockBoard();
        useKanbanStore.setState({ board, openTaskId: null });

        const state = useKanbanStore.getState();
        let task = null;
        if (state.openTaskId && state.board) {
          for (const col of state.board.columns) {
            const found = col.tasks.find(t => t.id === state.openTaskId);
            if (found) { task = found; break; }
          }
        }
        expect(task).toBeNull();
      });

      it('returns task when modal is open', () => {
        const board = createMockBoard();
        useKanbanStore.setState({ board, openTaskId: 'task-1' });

        const state = useKanbanStore.getState();
        let task = null;
        if (state.openTaskId && state.board) {
          for (const col of state.board.columns) {
            const found = col.tasks.find(t => t.id === state.openTaskId);
            if (found) { task = found; break; }
          }
        }
        expect(task).toEqual({ id: 'task-1', title: 'Task 1' });
      });

      it('returns updated task after updateTask', () => {
        const board = createMockBoard();
        useKanbanStore.setState({ board, openTaskId: 'task-1' });
        useKanbanStore.getState().updateTask('task-1', { title: 'Updated Task' });

        const state = useKanbanStore.getState();
        let task = null;
        if (state.openTaskId && state.board) {
          for (const col of state.board.columns) {
            const found = col.tasks.find(t => t.id === state.openTaskId);
            if (found) { task = found; break; }
          }
        }
        expect(task?.title).toBe('Updated Task');
      });
    });
  });
});
