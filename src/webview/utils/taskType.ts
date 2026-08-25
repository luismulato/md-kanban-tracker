import type { TaskType } from '../types/kanban';
import type { BadgeVariant } from '../components/atoms/Badge';

// undefined first so cycling through types can also clear it
export const TASK_TYPE_CYCLE: Array<TaskType | undefined> = [undefined, 'epic', 'story', 'task', 'spike'];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  epic: 'Epic',
  story: 'Story',
  task: 'Task',
  spike: 'Spike',
};

export const TASK_TYPE_BADGE_VARIANT: Record<TaskType, BadgeVariant> = {
  epic: 'info',
  story: 'default',
  task: 'success',
  spike: 'warning',
};

export function nextTaskType(current: TaskType | undefined): TaskType | undefined {
  const currentIndex = TASK_TYPE_CYCLE.indexOf(current);
  const nextIndex = (currentIndex + 1) % TASK_TYPE_CYCLE.length;
  return TASK_TYPE_CYCLE[nextIndex];
}
