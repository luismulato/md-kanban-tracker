# Changelog

All notable changes to "md-kanban-tracker" will be documented in this file.
This project is a fork of [kanban.md](https://github.com/wguilherme/kanban.md)
(MIT) — entries up to and including 0.1.4 are inherited from the upstream
project; entries from 0.1.0-tracker onward are specific to this fork.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-09-03

### Features

- **`bug` task type**: a fifth task type, `bug`, joins `epic`, `story`, `task` and `spike`. Set it in markdown with `- type: bug`, or reach it by clicking a card's type badge — the click-to-cycle order is now `epic -> story -> task -> spike -> bug -> (unset)` on both the card and the task modal. Bug cards show a red "Bug" badge. Parsed, serialized and round-tripped like the other types.

## [0.3.0] - 2026-09-03

### Bug Fixes

- **Card context menu (and hover state) no longer vanishes**: right-clicking a card sometimes did nothing because the parser assigned a fresh random id to every column and task on each parse. The extension re-parses and re-pushes the board on all kinds of unrelated triggers (file touched on disk, editor focus, WIP timer), and since the board fingerprint changed every time, the webview replaced the whole board and React remounted every card — tearing down any open context menu or in-progress hover/edit. Parsed ids are now deterministic (derived from column/task title + occurrence), so a no-op re-parse matches the fingerprint and the sync is skipped. Same-titled cards still get distinct ids.

### Features

- **Hover-only "+ Add card" button**: each column's "+ Add card" button is now hidden until the pointer is over that column (Notion-style), instead of always sitting at the footer in a dim state. The task counter next to the column title is unchanged — always visible. Clicking the column's empty area still opens the same new-note editor, so the button isn't the only way in.
- **Skeleton board on first open**: opening an empty (or whitespace-only) `.kanban.md` now seeds it with the five standard columns (`Backlog`, `To Do`, `WIP`, `Done`, `Done Done`) and a single starter card in `To Do`, then saves the file — so a freshly created board opens onto something usable instead of an empty panel. Files that already have content are left untouched.
- **Task origin marker**: cards can now carry an `- origin: <domain>/<project>` markdown property. It records where a card was promoted from, for aggregator boards such as a weekly planner that pulls cards out of several project backlogs into one board. On a project's own board you leave it unset — the origin is implicitly that project. Markdown-only for now (no UI to set it), same as `owner`. Parsed, serialized first among the task properties, and round-trips cleanly. Also documents the previously-undocumented `type` and `owner` properties in the README attribute table.

## [0.2.0] - 2026-08-25

### Features

- **Enter closes the modal when editing a card's title**: pressing Enter while renaming a task's title (click-to-edit) now saves the new title and closes the whole task modal, instead of just exiting title-edit mode. Scoped to the title field only — the description textarea and step-text inputs keep Enter's normal behavior (newline / no-op), since forcing a close from every field would be disruptive.
- **Per-task WIP timers with pause/resume/reset, and single-WIP-per-owner**: every task now gets its own live timer the moment it enters WIP, shown next to its title and running only while it's in WIP — it stops immediately when the task leaves. Each card has its own pause/resume and reset controls; the WIP column header adds "Pause all" / "Resume all" for every WIP timer at once. Reset always leaves the timer running from zero; pausing/resuming/resetting logs a closed segment to the board's `.timelog.md` via the extension, same format as the existing automatic entries.
  Tasks can now carry an `- owner: <name>` markdown property (unset defaults to `Luis`). The existing "single WIP" enforcement is now scoped per owner instead of per column: a human and one or more AI agents can each have their own task in WIP at the same time, but a second task from the *same* owner still bumps their previous one back to the top of To Do. No UI was added to set a task's owner in this pass — it's markdown-only for now.
- **Multi-select cards and move them together**: Cmd/Ctrl+click a card to toggle it into a selection instead of opening it (a plain click still opens the card as before). With two or more cards selected, dragging any one of them moves the whole group into the target column, in their original relative order. The header shows a live "N selected" hint while Esc clears the selection.
- **Delete multiple selected cards at once**: with two or more cards selected (same Cmd/Ctrl+click selection), right-click any of them and choose "Delete N cards" to remove the whole selection in one confirmation, instead of one at a time.
- **Delete a card from the board**: right-click a card and choose "Delete card" to remove it, with a confirmation prompt since it can't be undone. The extension backend already supported a `deleteTask` message; this wires up the missing frontend trigger.
- **Task type**: cards can now carry a `type` (`epic`, `story`, `task`, `spike`), set via the `- type: <value>` property in markdown. Shown as a badge on the card when set.
- **Click-to-cycle task type**: clicking a card's type badge cycles it through `epic -> story -> task -> spike -> (unset)`, same interaction as the priority/workload badges in the task modal.
- **Edit task type in the task modal**: the task modal now shows a type badge (or a "+ Type" placeholder when unset) next to priority/workload, cycling `epic -> story -> task -> spike -> (unset)` on click. This is also how a task first gets a type, since the card's badge only appears once one is set.
- **Move a card to the top of its column**: right-click a card and choose "Move to top" to reorder it to the first position in its column.
- **Quick-add a note**: clicking a column's empty area (or the existing "+ Add card" button) opens the task modal in create mode pre-filled with the title "New note", ready to edit or accept as-is.

## [0.1.0] - 2026-08-23 (md-kanban-tracker fork)

### Features

- **Board automation**: single active WIP task (a second task dragged into WIP sends the previous one to the top of To Do), daily Done → Done Done archiving on the first task to enter WIP each day, and a timer synced to whatever occupies WIP — starts/stops automatically, never touches a manually-started timer for a task outside WIP. Runs synchronously in the extension backend (`src/automation/`), no external watcher process.
- **Companion folder**: opening a `.kanban.md` file creates a `md-kanban-tracker/` folder next to it (if missing) with `<board>.timelog.md`, a Spanish usage guide (`kanban-guia-ES.md`), and a short product readme.
- **Editable task title**: click the title in the task modal to rename it in place. `Enter` saves, `Escape` reverts to the original value without saving (and does not close the modal), blur commits like `Enter`.
- **Due date picker discoverability**: clicking anywhere in the due-date row opens the native calendar picker via `showPicker()`, not just the small icon.
- Internal extension namespace (commands, views, configuration section) renamed to `md-kanban-tracker.*` so this fork can be installed alongside the original marketplace extension without id collisions.

### Bug Fixes

- **Empty-column drop**: fixed dropping a card onto a column with zero tasks sometimes snapping it back to the source column — `closestCorners` alone can fail to register an empty column as a valid drop target; now falls back from `pointerWithin`. (Also submitted upstream as [wguilherme/kanban.md#7](https://github.com/wguilherme/kanban.md/pull/7).)

## [0.1.4] - 2026-01-02

### Features

- **Add card button**: New "+ Add card" button in column footer to create tasks directly from the UI
  - Appears on hover with full visibility, subtle when not hovered
  - Opens task modal in create mode

### Bug Fixes

- **VSCode formatter compatibility**: Parser now handles markdown formatted by VSCode/Prettier
  - Properties without indentation are now correctly parsed
  - Steps with 2-space indentation are now correctly parsed
  - Generator outputs formatter-compatible format to prevent formatting from breaking the board

- **File detection scope**: Extension now only detects `.kanban.md` files
  - "Open as Kanban" button only appears for `.kanban.md` files
  - Extension no longer reacts to changes in regular `.md` files
  - Sidebar already correctly filtered, now the editor title bar matches

## [0.1.3] - 2025-11-29

### UX Improvements

- **Priority indicator redesign**: Cards now display priority as a colored left border (Trello-style)
  - High priority: red border
  - Medium priority: yellow border
  - Low priority: green border

- **Task modal badges**: Priority and workload now display as outline badges with icons
  - Priority uses arrow icons (↑ High, → Medium, ↓ Low)
  - Workload uses diamond icons (◇ Easy, ◈ Normal, ◆ Hard, ◆◆ Extreme)
  - Badges have colored borders instead of solid backgrounds for better readability

- **Editable task modal**: Task details can now be edited directly from the modal
  - **Clickable badges**: Priority and workload cycle through values when clicked
  - **Editable steps**: Add, remove, and edit subtask text inline
  - **Editable description**: Description textarea with save-on-blur
  - **Editable due date**: Date picker input for due dates

- **Fixed warning color**: Medium priority now correctly displays yellow instead of blue

### Bug Fixes

- **Modal closing fix**: Fixed modal unexpectedly closing when editing task details
  - Implemented Zustand store for centralized state management
  - Added deferred save pattern - changes are now saved when modal closes
  - Unsaved changes indicator (●) shown in modal header

- **Tags merging fix**: Inline hashtag tags now correctly merge with array-format tags instead of being overwritten

### Sidebar

- **Edit markdown button**: Added pencil icon to sidebar items to open the raw markdown file directly
- **Removed redundant preview icon**: Clicking on file name already opens the Kanban view

### Developer Experience

- **Fixed build tasks**: F5 now runs full build before starting watchers
- **Fixed task scripts**: Corrected watch task references in `.vscode/tasks.json`
- **Zustand architecture**: Migrated state management to Zustand store with selectors

### Documentation

- Added `CLAUDE.md` with project architecture documentation

## [0.1.1] - 2025-11-25

### Bug Fixes

- **Race condition fix**: Prevent cards from reverting when dragging multiple cards quickly
  - Implemented Promise queue to serialize save operations
  - Added pending operations counter for proper flag management

### Performance

- **UI Optimization**: Improved drag-and-drop with cross-column preview
  - Added fingerprint comparison to prevent unnecessary re-renders
  - Implemented optimistic updates for smoother UX
  - Added automated tests for render behavior

### Chore

- Remove development documentation from `.vscodeignore` to enable Changelog tab in marketplace

## [0.0.1] - 2025-11-21

### Features

- **Sidebar Integration**: Activity Bar icon with dedicated sidebar view
  - TreeView displaying all `.kanban.md` files in workspace
  - Quick access to open kanban boards directly from sidebar
  - **New Kanban Board** button to create new boards instantly
  - Refresh button and auto-refresh on file changes

- **Quick Board Creation**: One-click board creation with pre-filled template

- **Drag & Drop**: Full drag-and-drop support for tasks using DnD Kit
  - Move tasks between columns
  - Reorder tasks within columns
  - Real-time visual feedback with semantic styles

- **Task Features**:
  - Inline hashtags support for tags
  - Task steps/checklist support
  - Priority and workload indicators
  - Due dates
  - Default expanded state

- **Column Features**:
  - Archive columns support
  - Configurable task header format (title or list)

- **Webview**: React-based Kanban board with VSCode API integration

- **Build System**: Modern Vite 7 build tooling with TypeScript 5.9

- **Developer Tools**: Added Makefile for build, check, clean, and install tasks

---
