import type { KanbanTask } from '../types/kanban';

type Step = NonNullable<KanbanTask['steps']>[number];

// returns a new array with the step at `from` moved to `to`; invalid or no-op moves return the same array
export function moveStep(steps: Step[], from: number, to: number): Step[] {
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < steps.length;
  if (!inRange(from) || !inRange(to) || from === to) return steps;
  const next = [...steps];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
