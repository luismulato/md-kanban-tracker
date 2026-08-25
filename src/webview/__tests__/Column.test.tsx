import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KanbanBoard } from '../components/KanbanBoard';
import { useKanbanStore } from '../stores/kanbanStore';
import { createMockBoard } from './utils/dndTestUtils';

// mock vscode api
vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

/**
 * Scenarios from docs/features/quick-add-note.feature:
 * clicking an empty column area quick-creates a note, reusing the same
 * modal (TaskModal/TaskModalContainer) that the "Add card" button and
 * task-card editing already use.
 */
describe('Quick add a note by clicking an empty column area', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useKanbanStore.setState({
      board: null,
      isLoading: true,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      newTaskColumnId: null,
      _fingerprint: '',
    });
  });

  const setupStore = () => {
    const board = createMockBoard();
    useKanbanStore.getState().setBoard(board);
    return board;
  };

  it('opens the note editor in create mode, pre-filled with "New note", when clicking the empty area of a column', () => {
    setupStore();
    render(<KanbanBoard />);

    fireEvent.click(screen.getByTestId('column-empty-area-column-1'));

    expect(useKanbanStore.getState().newTaskColumnId).toBe('column-1');
    expect(useKanbanStore.getState().openTaskId).toBeNull();

    // same modal used for editing: title field, due date, description,
    // priority/workload badges, subtasks, Create/Cancel footer
    expect(screen.getByDisplayValue('New note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set priority/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set workload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add step/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('does NOT open the quick-add editor when clicking an existing task card', () => {
    setupStore();
    render(<KanbanBoard />);

    fireEvent.click(screen.getByText('Task 1.1'));

    // opens the edit modal for that task instead
    expect(useKanbanStore.getState().openTaskId).toBe('task-1-1');
    expect(useKanbanStore.getState().newTaskColumnId).toBeNull();
    expect(screen.queryByRole('button', { name: /^create$/i })).not.toBeInTheDocument();
  });

  it('opens the same editor with the same "New note" default via the Add card button', () => {
    setupStore();
    render(<KanbanBoard />);

    const addButtons = screen.getAllByRole('button', { name: /add card/i });
    fireEvent.click(addButtons[0]); // Column 1's button

    expect(useKanbanStore.getState().newTaskColumnId).toBe('column-1');
    expect(screen.getByDisplayValue('New note')).toBeInTheDocument();
  });

  it('creates a task titled "New note" when Create is clicked without editing the title', async () => {
    setupStore();
    render(<KanbanBoard />);

    fireEvent.click(screen.getByTestId('column-empty-area-column-1'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    });

    const state = useKanbanStore.getState();
    expect(state.newTaskColumnId).toBeNull();
    const column1 = state.board!.columns.find(c => c.id === 'column-1')!;
    expect(column1.tasks.some(t => t.title === 'New note')).toBe(true);
  });

  it('lets the user overwrite the default title before creating', async () => {
    setupStore();
    render(<KanbanBoard />);

    fireEvent.click(screen.getByTestId('column-empty-area-column-1'));
    const titleInput = screen.getByDisplayValue('New note');
    fireEvent.change(titleInput, { target: { value: 'Buy groceries' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    });

    const column1 = useKanbanStore.getState().board!.columns.find(c => c.id === 'column-1')!;
    expect(column1.tasks.some(t => t.title === 'Buy groceries')).toBe(true);
    expect(column1.tasks.some(t => t.title === 'New note')).toBe(false);
  });

  it('adds nothing and closes the modal when Cancel is clicked', async () => {
    setupStore();
    render(<KanbanBoard />);

    const before = useKanbanStore.getState().board!.columns.find(c => c.id === 'column-1')!.tasks.length;

    fireEvent.click(screen.getByTestId('column-empty-area-column-1'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    });

    const state = useKanbanStore.getState();
    expect(state.newTaskColumnId).toBeNull();
    expect(state.board!.columns.find(c => c.id === 'column-1')!.tasks.length).toBe(before);
  });
});
