import { useEffect, useState } from 'react';
import { useKanbanStore, useTaskTimer } from '../../stores/kanbanStore';
import { Icon } from '../atoms/Icon';

interface TaskTimerProps {
  taskId: string;
  title: string;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// only rendered for a task currently in WIP — the timer disappears the
// moment the card leaves that column (see syncTimersWithWip in kanbanStore)
export function TaskTimer({ taskId, title }: TaskTimerProps) {
  const timer = useTaskTimer(taskId);
  const pauseTaskTimer = useKanbanStore((s) => s.pauseTaskTimer);
  const resumeTaskTimer = useKanbanStore((s) => s.resumeTaskTimer);
  const resetTaskTimer = useKanbanStore((s) => s.resetTaskTimer);

  // force a re-render every second while running, just to recompute the elapsed label
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!timer || timer.status !== 'running') return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!timer) return null;

  // stop propagation so clicking the controls doesn't also start a drag or open the modal
  const stopProp = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const withStop = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className="flex items-center gap-1 text-xs text-vscode-foreground opacity-80 flex-shrink-0"
      {...stopProp}
    >
      {timer.status === 'running' ? (
        <>
          <span data-testid={`timer-elapsed-${taskId}`}>{formatElapsed(Date.now() - timer.startedAt)}</span>
          <button
            onClick={withStop(() => pauseTaskTimer(taskId, title))}
            aria-label="Pause timer"
            className="hover:opacity-70"
          >
            <Icon name="debug-pause" size="sm" />
          </button>
        </>
      ) : (
        <button
          onClick={withStop(() => resumeTaskTimer(taskId, title))}
          aria-label="Resume timer"
          className="hover:opacity-70"
        >
          <Icon name="play" size="sm" />
        </button>
      )}
      <button
        onClick={withStop(() => resetTaskTimer(taskId, title))}
        aria-label="Reset timer"
        className="hover:opacity-70"
      >
        <Icon name="debug-restart" size="sm" />
      </button>
    </div>
  );
}
