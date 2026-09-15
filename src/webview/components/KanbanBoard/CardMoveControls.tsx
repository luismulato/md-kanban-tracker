import { Icon } from '../atoms/Icon';

interface CardMoveControlsProps {
  onMoveUp: () => void;
  onMoveToTop: () => void;
  disabled?: boolean;
}

// hover-only reorder controls of a card: one step up, or straight to the top
export function CardMoveControls({ onMoveUp, onMoveToTop, disabled = false }: CardMoveControlsProps) {
  // stop propagation so clicking a control doesn't start a drag or open the modal
  const stopProp = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const withStop = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    action();
  };

  const buttonClasses = disabled
    ? 'opacity-30 cursor-default'
    : 'opacity-70 hover:opacity-100';

  return (
    <div
      className="flex items-center gap-1 text-vscode-foreground flex-shrink-0"
      {...stopProp}
    >
      <button
        onClick={withStop(onMoveUp)}
        disabled={disabled}
        aria-label="Move up"
        title="Move up"
        className={buttonClasses}
      >
        <Icon name="chevron-up" size="sm" />
      </button>
      <button
        onClick={withStop(onMoveToTop)}
        disabled={disabled}
        aria-label="Move to top"
        title="Move to top"
        className={buttonClasses}
      >
        <Icon name="fold-up" size="sm" />
      </button>
    </div>
  );
}
