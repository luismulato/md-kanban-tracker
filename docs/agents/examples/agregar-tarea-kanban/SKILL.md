---
name: agregar-tarea-kanban
description: Adds a new task card to a project's md-kanban-tracker board (mng/*.kanban.md), locating it by approximate project name under a configured search root. If the name doesn't match a single project exactly, shows the candidates found and confirms before writing. Use when the user asks to add a task/card to a project's kanban board (e.g. "add to:<project> task: <text>", "add a card to X in the kanban").
allowed-tools: Bash
---

# Add Kanban Task

Adds a card (`### <title>`) to a section of a `mng/*.kanban.md` board,
without requiring the project name to be exact. All the search and
writing logic lives in a script (`scripts/kanban-task.sh`) — this
skill only invokes it and interprets the result.

Before using it, set `KANBAN_BOARDS_ROOT` (or rely on its default, the
current directory) to a directory that actually contains your
projects — see the script's header comment.

## Flow

1. **Extract from the user's request:** the approximate project name,
   the card's title, and optionally the target column (if unspecified,
   use `Backlog`). Typical formats: `add to:<project> task: <text>`,
   or natural language ("add a card to <project> in the kanban:
   <text>").

2. **Search for the project:**
   ```bash
   scripts/kanban-task.sh find "<approximate-name>"
   ```
   Returns a JSON array of candidates `{project, root, board, match}`
   (`match`: `exact` | `partial` | `fuzzy`), already reduced to the
   best available match tier (if any exact match exists, only exact
   ones are returned; otherwise only partial; otherwise only fuzzy).

3. **Resolve the project:**
   - **A single candidate with `match: "exact"`** → use that board
     directly, no need to ask.
   - **Any other case** (0 candidates, more than one, or the single
     one found isn't exact) → show the user the candidates
     (`project` + `root` for each) and confirm which one before
     writing anything. If the list comes back empty, say no matching
     `mng/*.kanban.md` board was found and ask for a clearer name.

4. **Add the card:**
   ```bash
   scripts/kanban-task.sh add-card "<board>" "<section>" "<title>"
   ```
   `<section>` matches case-insensitively against the `## ...` headers
   that already exist on the board (`Backlog`, `To Do`, `WIP`, `Done`,
   `Done Done`, or whatever custom columns that particular project
   has). If the user didn't specify a column, use `Backlog`. If the
   script fails because the section doesn't exist, use the real
   section names it lists on stderr to retry with the correct one (or
   ask the user if that's not obvious either).

5. **Report.** Confirm in one short line which project and section the
   card was added to, with the board's path.

## Rules

- Never write to a board without having resolved a single project —
  on any ambiguity, always ask first (see step 3).
- Do not invent a section or create it if it doesn't exist — the board
  defines its own set of columns; if the requested one isn't there,
  say so instead of adding it.
- Do not create a new board if the project doesn't have one — that's a
  different operation, out of scope for this skill.
