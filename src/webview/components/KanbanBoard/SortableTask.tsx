import { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { KanbanTask } from '../../types/kanban';
import { TaskCard } from './TaskCard';
import { TaskContextMenu } from './TaskContextMenu';
import { useKanbanStore, useIsTaskSelected } from '../../stores/kanbanStore';

interface SortableTaskProps {
  task: KanbanTask;
  columnId: string;
  onUpdateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
}

function SortableTaskComponent({ task, columnId, onUpdateTask }: SortableTaskProps) {
  const openModal = useKanbanStore((s) => s.openModal);
  const moveTaskToTop = useKanbanStore((s) => s.moveTaskToTop);
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const toggleTaskSelection = useKanbanStore((s) => s.toggleTaskSelection);
  const isSelected = useIsTaskSelected(task.id);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const handleClick = (e: React.MouseEvent) => {
    // don't open modal if dragging
    if (isDragging) return;
    // Cmd/Ctrl+click toggles selection instead of opening the card
    if (e.metaKey || e.ctrlKey) {
      toggleTaskSelection(task.id);
      return;
    }
    openModal(task.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    // deletion can't be undone, so confirm before touching the board
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      deleteTask(columnId, task.id);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="cursor-grab active:cursor-grabbing"
      >
        <TaskCard task={task} isDragging={isDragging} isSelected={isSelected} onUpdateTask={onUpdateTask} />
      </div>

      {contextMenuPos && (
        <TaskContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onMoveToTop={() => moveTaskToTop(columnId, task.id)}
          onDelete={handleDelete}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </>
  );
}

export const SortableTask = memo(SortableTaskComponent);
