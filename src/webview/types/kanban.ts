export type TaskType = 'epic' | 'story' | 'task' | 'spike' | 'bug';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  type?: TaskType;
  owner?: string;
  /** Provenance marker `<domain>/<project>` on aggregator boards; unset on a project's own board. */
  origin?: string;
  priority?: 'low' | 'medium' | 'high';
  workload?: 'Easy' | 'Normal' | 'Hard' | 'Extreme';
  dueDate?: string;
  startDate?: string;
  defaultExpanded?: boolean;
  steps?: TaskStep[];
}

export interface TaskStep {
  text: string;
  completed: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  archived?: boolean;
}

export interface KanbanBoard {
  title: string;
  columns: KanbanColumn[];
}

export type TaskFilter = 'all' | string; // 'all' or tag name
export type TaskSort = 'none' | 'priority' | 'dueDate' | 'title';

export interface VSCodeAPI {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
}
