import { useEffect, useRef, useState } from 'react';
import type { KanbanTask } from '../types/kanban';
import { TASK_TYPE_LABELS, nextTaskType } from '../utils/taskType';

interface TaskModalProps {
  task: KanbanTask;
  onClose: () => void;
  onToggleStep: (stepIndex: number) => void;
  onUpdateTask?: (taskId: string, updates: Partial<KanbanTask>) => void;
  isCreateMode?: boolean;
  onCreateTask?: () => void;
}

type Priority = 'low' | 'medium' | 'high' | undefined;
type Workload = 'Easy' | 'Normal' | 'Hard' | 'Extreme' | undefined;

const PRIORITY_CYCLE: Priority[] = [undefined, 'low', 'medium', 'high'];
const WORKLOAD_CYCLE: Workload[] = [undefined, 'Easy', 'Normal', 'Hard', 'Extreme'];

export function TaskModal({ task, onClose, onToggleStep, onUpdateTask, isCreateMode, onCreateTask }: TaskModalProps) {
  const [localSteps, setLocalSteps] = useState(task.steps || []);
  const [localDescription, setLocalDescription] = useState(task.description || '');
  const [localTitle, setLocalTitle] = useState(task.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // sync local state when task changes
  useEffect(() => {
    setLocalSteps(task.steps || []);
    setLocalDescription(task.description || '');
    setLocalTitle(task.title || '');
  }, [task.steps, task.description, task.title]);

  // create-mode title input: saves on every keystroke, no click-to-edit involved
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    if (onUpdateTask) {
      onUpdateTask(task.id, { title: e.target.value });
    }
  };

  // existing-task title: click-to-edit, Enter/blur commits, Escape reverts
  const handleTitleClick = () => {
    setLocalTitle(task.title || '');
    setIsEditingTitle(true);
  };

  const commitTitleEdit = () => {
    if (onUpdateTask) {
      const trimmed = localTitle.trim();
      if (trimmed.length > 0 && trimmed !== task.title) {
        onUpdateTask(task.id, { title: trimmed });
      }
    }
    setIsEditingTitle(false);
  };

  const revertTitleEdit = () => {
    setLocalTitle(task.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      commitTitleEdit();
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      revertTitleEdit();
    }
  };

  // close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const cyclePriority = () => {
    if (!onUpdateTask) return;
    const currentIndex = PRIORITY_CYCLE.indexOf(task.priority as Priority);
    const nextIndex = (currentIndex + 1) % PRIORITY_CYCLE.length;
    onUpdateTask(task.id, { priority: PRIORITY_CYCLE[nextIndex] });
  };

  const cycleType = () => {
    if (!onUpdateTask) return;
    onUpdateTask(task.id, { type: nextTaskType(task.type) });
  };

  const cycleWorkload = () => {
    if (!onUpdateTask) return;
    const currentIndex = WORKLOAD_CYCLE.indexOf(task.workload as Workload);
    const nextIndex = (currentIndex + 1) % WORKLOAD_CYCLE.length;
    onUpdateTask(task.id, { workload: WORKLOAD_CYCLE[nextIndex] });
  };

  const handleAddStep = () => {
    if (!onUpdateTask) return;
    const newSteps = [...(task.steps || []), { text: '', completed: false }];
    onUpdateTask(task.id, { steps: newSteps });
  };

  const handleRemoveStep = (index: number) => {
    if (!onUpdateTask) return;
    const newSteps = (task.steps || []).filter((_, i) => i !== index);
    onUpdateTask(task.id, { steps: newSteps });
  };

  const handleStepTextChange = (index: number, text: string) => {
    const newSteps = [...localSteps];
    newSteps[index] = { ...newSteps[index], text };
    setLocalSteps(newSteps);
  };

  const handleStepTextBlur = (index: number) => {
    if (!onUpdateTask) return;
    const newSteps = [...(task.steps || [])];
    newSteps[index] = { ...newSteps[index], text: localSteps[index].text };
    onUpdateTask(task.id, { steps: newSteps });
  };

  const handleDescriptionBlur = () => {
    if (!onUpdateTask) return;
    if (localDescription !== task.description) {
      onUpdateTask(task.id, { description: localDescription });
    }
  };

  const handleDueDateChange = (date: string) => {
    if (!onUpdateTask) return;
    onUpdateTask(task.id, { dueDate: date || undefined });
  };

  const dueDateInputRef = useRef<HTMLInputElement>(null);

  // Native <input type="date"> only opens its calendar when you hit the
  // tiny icon exactly. showPicker() lets a click anywhere in the row open
  // it. Must be called synchronously from a real click (not a promise) or
  // browsers refuse it — feature-detect since jsdom (tests) and older
  // embedded Chromium versions don't implement it.
  const handleDueDateRowClick = () => {
    const input = dueDateInputRef.current;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // ignore — e.g. browser refused because this wasn't a direct user gesture
      }
    }
  };

  // helper to stop event propagation (prevents dnd-kit from capturing events)
  const stopProp = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const getTypeBadge = (type?: KanbanTask['type']) => {
    const styles = {
      epic: 'border border-vscode-info text-vscode-info',
      story: 'border border-vscode-primary text-vscode-primary',
      task: 'border border-vscode-success text-vscode-success',
      spike: 'border border-vscode-warning text-vscode-warning',
    };

    if (!type) {
      return (
        <button
          onClick={cycleType}
          {...stopProp}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-dashed border-vscode-input-border text-vscode-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Set type"
        >
          + Type
        </button>
      );
    }

    return (
      <button
        onClick={cycleType}
        {...stopProp}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${styles[type]}`}
      >
        {TASK_TYPE_LABELS[type]}
      </button>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const styles = {
      high: 'border border-vscode-error text-vscode-error',
      medium: 'border border-vscode-warning text-vscode-warning',
      low: 'border border-vscode-success text-vscode-success',
    };
    const labels = {
      high: '↑ High',
      medium: '→ Medium',
      low: '↓ Low',
    };

    if (!priority) {
      return (
        <button
          onClick={cyclePriority}
          {...stopProp}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-dashed border-vscode-input-border text-vscode-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Set priority"
        >
          + Priority
        </button>
      );
    }

    return (
      <button
        onClick={cyclePriority}
        {...stopProp}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${styles[priority as keyof typeof styles]}`}
      >
        {labels[priority as keyof typeof labels]}
      </button>
    );
  };

  const getWorkloadBadge = (workload?: string) => {
    const styles = {
      Easy: 'border border-vscode-success text-vscode-success',
      Normal: 'border border-vscode-warning text-vscode-warning',
      Hard: 'border border-vscode-error text-vscode-error',
      Extreme: 'border-2 border-vscode-error text-vscode-error font-bold',
    };
    const labels = {
      Easy: '◇ Easy',
      Normal: '◈ Normal',
      Hard: '◆ Hard',
      Extreme: '◆◆ Extreme',
    };

    if (!workload) {
      return (
        <button
          onClick={cycleWorkload}
          {...stopProp}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-dashed border-vscode-input-border text-vscode-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Set workload"
        >
          + Workload
        </button>
      );
    }

    return (
      <button
        onClick={cycleWorkload}
        {...stopProp}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${styles[workload as keyof typeof styles]}`}
      >
        {labels[workload as keyof typeof labels]}
      </button>
    );
  };

  const completedSteps = task.steps?.filter(s => s.completed).length || 0;
  const totalSteps = task.steps?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // stop all pointer events from propagating to parent (prevents dnd-kit interference)
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-vscode-background border border-vscode-input-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={handleContentClick}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-vscode-input-border">
          <div className="flex items-start justify-between gap-4">
            {isCreateMode ? (
              <input
                type="text"
                value={localTitle}
                onChange={handleTitleChange}
                onFocus={(e) => e.target.select()}
                placeholder="Task title..."
                autoFocus
                {...stopProp}
                className="text-xl font-semibold text-vscode-foreground flex-1 bg-transparent border-b border-vscode-input-border focus:outline-none focus:border-vscode-primary pb-1"
              />
            ) : isEditingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onKeyDown={handleTitleEditKeyDown}
                onBlur={commitTitleEdit}
                autoFocus
                {...stopProp}
                aria-label="Task title"
                className="text-xl font-semibold text-vscode-foreground flex-1 bg-transparent border-b border-vscode-input-border focus:outline-none focus:border-vscode-primary pb-1"
              />
            ) : (
              <h2
                onClick={handleTitleClick}
                className="text-xl font-semibold text-vscode-foreground flex-1 cursor-text rounded hover:bg-vscode-list-hoverBg transition-colors"
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
            <button
              onClick={onClose}
              {...stopProp}
              className="text-vscode-foreground hover:text-vscode-button-fg transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {getTypeBadge(task.type)}
            {getPriorityBadge(task.priority)}
            {getWorkloadBadge(task.workload)}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded bg-vscode-badge-bg text-vscode-badge-fg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Due Date */}
          <div>
            <h3 className="text-sm font-semibold text-vscode-foreground mb-2">
              Due Date
            </h3>
            <div onClick={handleDueDateRowClick} data-testid="due-date-row">
              <input
                ref={dueDateInputRef}
                type="date"
                value={task.dueDate || ''}
                onChange={(e) => handleDueDateChange(e.target.value)}
                {...stopProp}
                className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-foreground border border-vscode-input-border rounded focus:outline-none focus:border-vscode-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-vscode-foreground mb-2">
              Description
            </h3>
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              {...stopProp}
              placeholder="Add description..."
              className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-foreground border border-vscode-input-border rounded focus:outline-none focus:border-vscode-primary min-h-[100px] resize-y"
            />
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-vscode-foreground">
                Subtasks
              </h3>
              {totalSteps > 0 && (
                <span className="text-xs text-vscode-foreground">
                  {completedSteps}/{totalSteps} completed
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {totalSteps > 0 && (
              <div className="w-full bg-vscode-input-bg rounded-full h-2 mb-4">
                <div
                  className="bg-vscode-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Steps List */}
            <div className="space-y-2">
              {localSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded hover:bg-vscode-list-hoverBg transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => onToggleStep(idx)}
                    {...stopProp}
                    className="cursor-pointer w-4 h-4 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleStepTextChange(idx, e.target.value)}
                    onBlur={() => handleStepTextBlur(idx)}
                    {...stopProp}
                    className={`flex-1 text-sm bg-transparent border-none focus:outline-none focus:bg-vscode-input-bg px-1 rounded ${
                      step.completed
                        ? 'line-through text-vscode-foreground opacity-60'
                        : 'text-vscode-foreground'
                    }`}
                    placeholder="Step description..."
                  />
                  <button
                    onClick={() => handleRemoveStep(idx)}
                    {...stopProp}
                    className="opacity-0 group-hover:opacity-100 text-vscode-error hover:text-vscode-error transition-opacity text-sm px-1"
                    aria-label="Remove step"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add Step Button */}
            <button
              onClick={handleAddStep}
              {...stopProp}
              className="mt-3 flex items-center gap-2 text-sm text-vscode-foreground opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Add step"
            >
              <span>+</span>
              <span>Add step</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-vscode-input-border flex justify-end gap-2">
          {isCreateMode ? (
            <>
              <button
                onClick={onClose}
                {...stopProp}
                className="px-4 py-2 text-sm font-medium rounded border border-vscode-input-border text-vscode-foreground hover:bg-vscode-list-hoverBg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreateTask}
                disabled={!localTitle.trim()}
                {...stopProp}
                className="px-4 py-2 text-sm font-medium rounded bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hoverBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              {...stopProp}
              className="px-4 py-2 text-sm font-medium rounded bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hoverBg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
