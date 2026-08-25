import { memo, useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { KanbanColumn, KanbanTask } from '../../types/kanban';
import { SortableTask } from './SortableTask';
import { useKanbanStore } from '../../stores/kanbanStore';
import { WIP_COLUMN } from '../../../automation/constants';

interface ColumnProps {
  column: KanbanColumn;
  onUpdateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
}

function ColumnComponent({ column, onUpdateTask }: ColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const openModalForNewTask = useKanbanStore((s) => s.openModalForNewTask);
  const pauseAllWipTimers = useKanbanStore((s) => s.pauseAllWipTimers);
  const resumeAllWipTimers = useKanbanStore((s) => s.resumeAllWipTimers);
  const isWipColumn = column.title === WIP_COLUMN;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Memoize task IDs to prevent SortableContext from re-computing
  const taskIds = useMemo(
    () => column.tasks.map(task => task.id),
    [column.tasks]
  );

  const handleAddClick = () => {
    openModalForNewTask(column.id);
  };

  // clicking the empty area of the task list (not a task card) opens the
  // same "new note" modal as the Add card button. Guarded by target===
  // currentTarget so clicks that bubble up from a task or its children
  // don't also trigger this (which would clobber the edit-modal state
  // openModal(taskId) just set with openModalForNewTask's newTaskColumnId).
  const handleEmptyAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    openModalForNewTask(column.id);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-lg p-4 transition-colors duration-150 flex flex-col ${
        isOver
          ? 'bg-vscode-list-hoverBg ring-2 ring-vscode-focusBorder'
          : 'bg-vscode-input-bg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-vscode-foreground">
          {column.title}
          {column.archived && (
            <span className="ml-2 text-xs opacity-60">[Archived]</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {isWipColumn && column.tasks.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={pauseAllWipTimers}
                aria-label="Pause all timers"
                className="text-xs text-vscode-foreground opacity-60 hover:opacity-100"
              >
                Pause all
              </button>
              <button
                onClick={resumeAllWipTimers}
                aria-label="Resume all timers"
                className="text-xs text-vscode-foreground opacity-60 hover:opacity-100"
              >
                Resume all
              </button>
            </div>
          )}
          <span className="text-sm text-vscode-foreground opacity-60">
            {column.tasks.length}
          </span>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          className="space-y-2 min-h-[100px] flex-1"
          onClick={handleEmptyAreaClick}
          data-testid={`column-empty-area-${column.id}`}
        >
          {column.tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              columnId={column.id}
              onUpdateTask={onUpdateTask}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add task button - always visible at bottom, more prominent on hover */}
      <button
        onClick={handleAddClick}
        className={`mt-3 w-full py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-all duration-150 ${
          isHovered
            ? 'bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hoverBg'
            : 'text-vscode-foreground opacity-50 hover:opacity-100 hover:bg-vscode-list-hoverBg'
        }`}
      >
        <span className="text-lg leading-none">+</span>
        <span>Add card</span>
      </button>
    </div>
  );
}

export const Column = memo(ColumnComponent);
