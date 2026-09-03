# scripts/

Helper scripts for local development.

## `dev-install.sh`

Builds the extension and syncs the output into the copy installed under
`~/.vscode/extensions/`, so you can iterate on the code without repacking
and reinstalling the `.vsix` every time.

**Where things live:**

- `scripts/dev-install.sh` — runs `npm run build` and copies `dist/` to
  every installed copy at `~/.vscode/extensions/luismulato.md-kanban-tracker-*/`.
- `Makefile` — `make dev-install` is an alias for the script.

**Usage:**

```bash
scripts/dev-install.sh            # build + sync (the usual case)
scripts/dev-install.sh --no-build # sync only, if you already ran the build
scripts/dev-install.sh --help     # show help
```

or via make:

```bash
make dev-install
```

**After running it**, reload the editor so it picks up the new build:

> `Cmd+Shift+P` → **Developer: Reload Window**

**Notes:**

- The extension must have been installed once from the `.vsix` first — the
  script only updates existing copies, it does not install.
- If several versions are installed, all of them are updated (VSCode loads
  the highest version).
