import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KanbanBoard } from '../components/KanbanBoard';
import { useKanbanStore } from '../stores/kanbanStore';
import { MarkdownKanbanParser } from '../../markdownParser';

vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({ postMessage: vi.fn(), getState: vi.fn(), setState: vi.fn() }),
}));

/**
 * Scenarios from docs/features/context-menu-survives-sync.feature.
 * The extension re-parses the .kanban.md and pushes the board to the
 * webview on all sorts of unrelated triggers (file touched, editor focus,
 * WIP timer). Because parsed ids are deterministic, a no-op re-parse now
 * matches the fingerprint and syncFromBackend bails out — so React never
 * remounts the cards and an open context menu stays open.
 */
const MARKDOWN = `# Board

## To Do

### First card

### Second card

## WIP

## Done
`;

describe('context menu survives a background board sync', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      board: null,
      isLoading: true,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      newTaskColumnId: null,
      selectedTaskIds: new Set(),
      taskTimers: {},
      _fingerprint: '',
    });
    useKanbanStore.getState().setBoard(MarkdownKanbanParser.parseMarkdown(MARKDOWN));
  });

  it('a no-op re-parse does not replace the board', () => {
    const before = useKanbanStore.getState().board;

    act(() => {
      useKanbanStore.getState().syncFromBackend(MarkdownKanbanParser.parseMarkdown(MARKDOWN));
    });

    // fingerprint matched -> early return -> same board instance
    expect(useKanbanStore.getState().board).toBe(before);
  });

  it('keeps the context menu open across a background sync', () => {
    render(<KanbanBoard />);

    fireEvent.contextMenu(screen.getByText('First card'));
    expect(screen.getByRole('menuitem', { name: 'Move to top' })).toBeInTheDocument();

    act(() => {
      useKanbanStore.getState().syncFromBackend(MarkdownKanbanParser.parseMarkdown(MARKDOWN));
    });

    expect(screen.getByRole('menuitem', { name: 'Move to top' })).toBeInTheDocument();
  });
});
