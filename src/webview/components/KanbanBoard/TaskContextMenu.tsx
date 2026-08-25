import { useEffect, useRef } from 'react';

interface TaskContextMenuProps {
  x: number;
  y: number;
  onMoveToTop: () => void;
  onClose: () => void;
}

export function TaskContextMenu({ x, y, onMoveToTop, onClose }: TaskContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click, Escape, or losing focus
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('contextmenu', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('contextmenu', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleMoveToTop = () => {
    onMoveToTop();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ position: 'fixed', top: y, left: x }}
      className="z-50 min-w-[160px] py-1 rounded border border-vscode-input-border bg-vscode-background shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        role="menuitem"
        onClick={handleMoveToTop}
        className="w-full text-left px-3 py-1.5 text-sm text-vscode-foreground hover:bg-vscode-list-hoverBg transition-colors"
      >
        Move to top
      </button>
    </div>
  );
}
