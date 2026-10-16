import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../components/KanbanBoard';
import { useKanbanStore } from '../stores/kanbanStore';
import { createMockBoard } from './utils/dndTestUtils';
import pkg from '../../../package.json';

vi.mock('../hooks/useVSCodeApi', () => ({
  getVSCodeAPI: () => ({
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  }),
}));

describe('plugin version label', () => {
  beforeEach(() => {
    useKanbanStore.setState({
      board: null,
      isLoading: true,
      isDragging: false,
      dragPreview: null,
      openTaskId: null,
      selectedTaskIds: new Set(),
      _fingerprint: '',
    });
    useKanbanStore.getState().setBoard(createMockBoard());
  });

  it('shows the package.json version prefixed with "v"', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('app-version')).toHaveTextContent(`v${pkg.version}`);
  });

  it('is pinned to the top-right corner', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('app-version').className).toMatch(/\bfixed\b/);
    expect(screen.getByTestId('app-version').className).toMatch(/\btop-\d/);
    expect(screen.getByTestId('app-version').className).toMatch(/\bright-\d/);
  });

  it('uses a small, muted font', () => {
    render(<KanbanBoard />);

    const classes = screen.getByTestId('app-version').className;
    expect(classes).toMatch(/\btext-xs\b/);
    expect(classes).toMatch(/\bopacity-\d+\b/);
  });

  it('does not capture clicks', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('app-version').className).toMatch(/\bpointer-events-none\b/);
  });
});
