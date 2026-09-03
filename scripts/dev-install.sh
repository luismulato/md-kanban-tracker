#!/usr/bin/env bash
#
# dev-install.sh — build the extension and sync the output to the copy
# installed under ~/.vscode/extensions/, so you can iterate without
# reinstalling the .vsix.
#
# After running it, in VSCode: Cmd+Shift+P -> "Developer: Reload Window".
#
# Usage:
#   scripts/dev-install.sh            # build + sync (the usual case)
#   scripts/dev-install.sh --no-build # sync only (if you already built)
#   scripts/dev-install.sh --help     # show this help
#
set -euo pipefail

usage() {
  cat <<'EOF'
dev-install.sh — build md-kanban-tracker and sync it into the installed copy

What it does:
  1. Runs `npm run build` (extension + webview).
  2. Copies dist/ over every installed copy found at
     ~/.vscode/extensions/luismulato.md-kanban-tracker-*/dist
     (VSCode loads the highest version; all copies are updated to be safe).

Then reload the editor yourself:
  Cmd+Shift+P -> "Developer: Reload Window"

Usage:
  scripts/dev-install.sh            build + sync (the usual case)
  scripts/dev-install.sh --no-build sync only, if you already ran the build
  scripts/dev-install.sh --help     show this help

Requires the extension to have been installed once from the .vsix.
EOF
}

do_build=1
case "${1:-}" in
  --help|-h) usage; exit 0 ;;
  --no-build) do_build=0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; echo >&2; usage >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXT_DIR="${HOME}/.vscode/extensions"
NAME="luismulato.md-kanban-tracker"

if [[ "$do_build" == "1" ]]; then
  echo "==> npm run build"
  npm run build
fi

if [[ ! -d "dist" ]]; then
  echo "ERROR: dist/ does not exist — run the build first." >&2
  exit 1
fi

# Every installed copy (there can be several versions; VSCode uses the highest).
shopt -s nullglob
targets=("$EXT_DIR/$NAME-"*)
shopt -u nullglob

if [[ ${#targets[@]} -eq 0 ]]; then
  echo "ERROR: no installation found at $EXT_DIR/$NAME-*" >&2
  echo "Install the .vsix once, then run this again." >&2
  exit 1
fi

for t in "${targets[@]}"; do
  echo "==> sync dist -> $t/dist"
  rm -rf "$t/dist"
  cp -R dist "$t/dist"
done

echo
echo "Done. In VSCode: Cmd+Shift+P -> \"Developer: Reload Window\""
