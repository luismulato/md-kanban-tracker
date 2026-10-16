import { memo, useState } from 'react';
import type { KanbanTask } from '../../types/kanban';
import { Badge } from '../atoms/Badge';
import { TASK_TYPE_LABELS, TASK_TYPE_BADGE_VARIANT, nextTaskType } from '../../utils/taskType';
import { TaskTimer } from './TaskTimer';
import { CardMoveControls } from './CardMoveControls';

interface TaskCardProps {
  task: KanbanTask;
  isDragging?: boolean;
  isOverlay?: boolean;
  isSelected?: boolean;
  isFirstInColumn?: boolean;
  onUpdateTask?: (taskId: string, updates: Partial<KanbanTask>) => void;
  onMoveUp?: () => void;
  onMoveToTop?: () => void;
  onDelete?: () => void;
}

function getPriorityBorderClass(priority: string) {
  switch (priority) {
    case 'high': return 'border-l-4 border-l-vscode-error';
    case 'medium': return 'border-l-4 border-l-vscode-warning';
    case 'low': return 'border-l-4 border-l-vscode-success';
    default: return '';
  }
}

function TaskCardComponent({
  task,
  isDragging = false,
  isOverlay = false,
  isSelected = false,
  isFirstInColumn = false,
  onUpdateTask,
  onMoveUp,
  onMoveToTop,
  onDelete,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const baseClasses = 'bg-vscode-background p-3 rounded border';

  const priorityClasses = task.priority ? getPriorityBorderClass(task.priority) : '';

  const stateClasses = isOverlay
    ? 'border-vscode-button-bg shadow-lg opacity-95 scale-105'
    : isDragging
    ? 'opacity-40 border-vscode-focusBorder'
    : 'border-vscode-input-border';

  const selectionClasses = isSelected ? 'ring-2 ring-vscode-focusBorder bg-vscode-list-hoverBg' : '';

  const handleTypeClick = (e: React.MouseEvent) => {
    // click cycles the type; stop propagation so it doesn't also open the task modal
    e.stopPropagation();
    onUpdateTask?.(task.id, { type: nextTaskType(task.type) });
  };

  // reorder controls stay hidden until the card is hovered, like the column's "+ Add card"
  const showMoveControls = !isOverlay && isHovered && !!onMoveUp && !!onMoveToTop;

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={`${baseClasses} ${stateClasses} ${priorityClasses} ${selectionClasses}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {task.type && (
        <Badge
          variant={TASK_TYPE_BADGE_VARIANT[task.type]}
          className={`mb-1 ${onUpdateTask ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onUpdateTask ? handleTypeClick : undefined}
        >
          {TASK_TYPE_LABELS[task.type]}
        </Badge>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-vscode-foreground">{task.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showMoveControls && (
            <CardMoveControls
              onMoveUp={onMoveUp!}
              onMoveToTop={onMoveToTop!}
              onDelete={onDelete}
              disabled={isFirstInColumn}
            />
          )}
          {!isOverlay && <TaskTimer taskId={task.id} title={task.title} />}
        </div>
      </div>

      {task.owner && (
        <span
          data-testid={`task-owner-${task.id}`}
          title="Owner"
          className="inline-block mt-2 text-xs text-vscode-foreground opacity-70"
        >
          @{task.owner}
        </span>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded bg-vscode-badge-bg text-vscode-badge-fg"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.steps && task.steps.length > 0 && (
        <div className="mt-2 text-xs text-vscode-foreground opacity-60">
          {task.steps.filter(s => s.completed).length}/{task.steps.length} steps completed
        </div>
      )}
    </div>
  );
}

// Memoize to prevent re-renders when parent state changes
export const TaskCard = memo(TaskCardComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.type === nextProps.task.type &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.workload === nextProps.task.workload &&
    prevProps.task.owner === nextProps.task.owner &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isOverlay === nextProps.isOverlay &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFirstInColumn === nextProps.isFirstInColumn &&
    JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags) &&
    JSON.stringify(prevProps.task.steps) === JSON.stringify(nextProps.task.steps)
  );
});
