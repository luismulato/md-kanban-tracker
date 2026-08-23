# Plan: Board Automation + Timelog

## Context

Before this fork, keeping a single WIP task, archiving `Done` daily, and
syncing a timer to whatever occupied WIP required an external Python
watcher polling a `.kanban.md` file every 2 seconds (see
`mng/scripts/kanban_events.py` in the opi-openside project this fork
originated from). That worked, but lived entirely outside the editor —
a separate process, a separate failure mode, and no reaction until the
next poll.

This fork ports that business logic directly into the extension
backend, so it runs synchronously the moment a task actually moves —
no polling, no external process — and adds two small UX gaps the
original didn't have: editing a task's title in place, and a more
discoverable due-date picker.

## Current Architecture (relevant to this feature)

- `src/kanbanWebviewPanel.ts` — `KanbanWebviewPanel` is a **singleton**
  (`static currentPanel`). `loadMarkdownFile(document)` reparses the
  `.kanban.md` into an in-memory `KanbanBoard` any time the file is
  opened, the active editor changes, or an external edit is detected
  (debounced 500ms via `onDidChangeTextDocument` in `extension.ts`).
  `moveTask`/`addTask`/`updateTask` mutate `this._board` directly and
  go through `performAction()`, which either saves immediately
  (`_saveImmediately()`, queued via `_saveQueue`) or, if a modal is
  open, defers the save (`_hasPendingChanges`) until it closes.
- `src/markdownParser.ts` — `MarkdownKanbanParser.parseMarkdown`
  regenerates every `id` (`Math.random()`) on **every** reparse.
  Column/task ids are therefore only stable within a single in-memory
  session between reparses — they cannot be used as a persistent key
  across reloads.

## Proposal

### Identity: track tasks by title, not id

Since ids reset on every reparse, and the automation's state (which
timer is running, when Done was last archived) has to survive reparses
and even VSCode restarts, everything in `src/automation/` identifies
tasks and columns by **title** (`"WIP"`, `"To Do"`, `"Tarea X"`), the
same approach the original Python watcher used.

### Where the logic lives

`src/automation/` (pure business logic + a thin fs boundary), separate
from `src/webview/` (React) and independent of `kanbanWebviewPanel.ts`
(VSCode API) so it's directly unit-testable:

- `boardRules.ts` — pure, no fs: `enforceSingleWip`, `archiveDoneColumn`,
  `currentWipTitle`. Operates on an in-memory `KanbanBoard`.
- `timelog.ts` — fs boundary (`companionDir` always passed in, never
  hardcoded): timer state, timelog line format, daily-archive marker.
- `companionFiles.ts` — `ensureCompanionFolder`, idempotent creation of
  `md-kanban-tracker/` next to a `.kanban.md`.
- `boardAutomation.ts` — orchestrator, equivalent to the Python
  watcher's `process_change`: single-WIP → daily archive → timer sync,
  in that order, given `previousWipTitle` as an explicit parameter
  (not a module-level global) so it stays pure-testable.

### Wiring into the panel

`KanbanWebviewPanel` gets a private `_runBoardAutomation(justMovedTitle)`
called from three places:

- `moveTask()` and `addTask()`, inside the `performAction()` closure —
  its own mutation of `this._board` rides the same save/defer path
  those already use, no parallel save logic needed.
- `loadMarkdownFile()` — after reparsing, since a manual edit of the
  `.md` can also move a task into/out of WIP. If automation mutates
  the board here, the save explicitly re-checks `_isModalOpen` before
  calling `_saveImmediately()` — `loadMarkdownFile` doesn't go through
  `performAction`, so this guard has to be duplicated, not inherited.

Because the panel is a singleton, `_runBoardAutomation` resets its
`_previousWipTitle` baseline to whatever's *currently* in WIP the first
time it sees a given file path (`_ensuredCompanionForPath` cache) —
otherwise opening a file that already has something in WIP would look
like "a task just entered WIP" and spuriously start a timer.

### Two new UI features (TaskModal.tsx)

- **Editable title**: for existing tasks (not create-mode), the
  previously-static `<h2>{task.title}</h2>` becomes clickable → local
  `<input>`. `Enter`/blur commit via the existing `onUpdateTask`
  message (no new message type needed); `Escape` reverts local state
  without calling `onUpdateTask`, and calls `stopPropagation()` so the
  modal's global `window.keydown` Escape-to-close listener never fires.
- **Due date discoverability**: `<input type="date">` was already
  functional (the project already sets `color-scheme` correctly for
  VSCode's theme), but only the small native icon opened the picker.
  Wrapping the input in a container with `onClick` → `showPicker()`
  (feature-detected, called synchronously from the click) lets any
  click in the row open it.

## Manual Verification Checklist

jsdom (the test environment) doesn't compute real layout, so these
have to be confirmed by hand in a real VSCode window, same as the
empty-column drag fix:

- [ ] Open a `.kanban.md` for the first time → `md-kanban-tracker/`
      appears with `<board>.timelog.md`, `kanban-guia-ES.md`, `Readme.md`.
- [ ] Drag a task into WIP → its timer starts (check the `.timelog-state`
      companion file, or just move it out and confirm a line appears).
- [ ] With one task in WIP, drag a second one in → the first goes to
      the top of To Do, and the timer switches to the new one in one step.
- [ ] Manually time something unrelated to WIP (there's no UI for this
      yet — it mirrors the Python `timelog.sh start "task"` fallback),
      then move an unrelated task through WIP → the ad-hoc timer is untouched.
- [ ] Move something into WIP for the first time in the day with tasks
      sitting in Done → they archive into Done Done.
- [ ] Click a task's title → input appears; `Enter` saves; `Escape`
      reverts and does **not** close the modal.
- [ ] Click anywhere in the due-date row (not just the icon) → the
      native calendar opens, legible in a dark VSCode theme.

## Estimate (actual)

Delivered in one session: `src/automation/` (4 modules) + 28 tests,
wiring into `kanbanWebviewPanel.ts`, 2 UI features + 10 tests,
namespace rename, docs. 137 tests total, ~65% overall coverage,
97% on `src/automation/`.
