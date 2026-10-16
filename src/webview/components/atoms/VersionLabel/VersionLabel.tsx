// plugin version pinned to the top-right corner: small, muted, and click-through
export function VersionLabel() {
  return (
    <span
      data-testid="app-version"
      className="fixed top-1 right-2 text-xs opacity-40 pointer-events-none select-none text-vscode-foreground"
    >
      v{__APP_VERSION__}
    </span>
  );
}
