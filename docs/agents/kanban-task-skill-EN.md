# Claude Code Skill: `agregar-tarea-kanban`

This project's board format (`mng/*.kanban.md`, see [Task Format
Reference](../../README.md#-task-format-reference) in the main
README) is plain Markdown, which makes it straightforward for an
external tool to edit a board without going through the extension UI.
`agregar-tarea-kanban` is one such tool: a [Claude
Code](https://claude.com/claude-code) skill, external to this
repository, that appends a new task card to any `*.kanban.md` board on
disk from a natural-language request (e.g. *"add to:my-project task:
fix the login bug"*).

It is not part of this extension's codebase or shipped `.vsix` — it
runs entirely on the machine of whoever has it installed, and only
touches files, the same as a human editing the board by hand. It is
documented here because it depends directly on this project's file
format contract, so a change to that contract (section headers, task
header syntax) is a change this skill needs to track too.

## Reference implementation

A generic, working copy of this skill (definition + script) lives in
this repo, under
[`docs/agents/examples/agregar-tarea-kanban/`](examples/agregar-tarea-kanban/):

| What | Path (relative to that folder) |
|---|---|
| Skill definition | `SKILL.md` |
| Script that does the work | `scripts/kanban-task.sh` |

Claude Code loads skills from a per-user skills directory (see the
[Claude Code
docs](https://docs.claude.com/en/docs/claude-code/overview) for where
that lives and how skills are installed); the copy in this repo is a
portable reference, not tied to any particular installation.

The skill itself is a thin layer: it parses the user's request, calls
the script below, and interprets its JSON output. All filesystem
search and editing logic lives in the script, not in the LLM prompt.

## How it works

### 1. `kanban-task.sh find <query>`

Searches a configured root directory (`$KANBAN_BOARDS_ROOT`, or the
current directory if unset — see the script's header comment) for
`mng/*.kanban.md` files, and matches the parent project's folder name
against `<query>`.

| Parameter | Type | Description |
|---|---|---|
| `query` | string (positional, required) | Approximate project name — can be a typo or a partial name. |

Matching happens in three tiers, and only the best non-empty tier is
returned:

1. **`exact`** — project folder name equals `query` (case-insensitive).
2. **`partial`** — one is a substring of the other.
3. **`fuzzy`** — token-overlap match (handles typos and missing
   words), used only if neither of the above found anything.

Output (stdout, JSON array):

```json
[
  {
    "project": "md-kanban-tracker",
    "root": "/path/to/md-kanban-tracker",
    "board": "/path/to/md-kanban-tracker/mng/md-kanban.kanban.md",
    "match": "exact"
  }
]
```

An empty result (`[]`) means no board matched at all.

### 2. `kanban-task.sh add-card <board> <section> <title>`

Appends a new task card (`### <title>`) to the end of `<section>` in
`<board>`, right before the next `## ` header (or at end of file if
`<section>` is the last one).

| Parameter | Type | Description |
|---|---|---|
| `board` | path (positional, required) | Path to the `.kanban.md` file to edit — normally the `board` field from a `find` result. |
| `section` | string (positional, required) | Target column. Matched case-insensitively against the board's existing `## ` headers (`Backlog`, `To Do`, `WIP`, `Done`, `Done Done`, or any custom column a given board defines). |
| `title` | string (positional, required) | Card title — becomes the `### <title>` line. The card is added bare (no `tags`/`priority`/other attributes). |

If `section` doesn't match any existing header, the script does
**not** create one — it fails (exit 1) and lists the real section
names on stderr, so the caller can retry with a corrected value.

Output (stdout, JSON object) on success:

```json
{
  "board": "/path/to/md-kanban-tracker/mng/md-kanban.kanban.md",
  "section": "Backlog",
  "title": "Fix the login bug"
}
```

## Skill-level behavior (not in the script)

The skill wraps the two script calls with one rule: it only writes to
a board once the target project is unambiguous.

- **Exactly one `exact` match** → proceeds straight to `add-card`, no
  confirmation needed.
- **Anything else** (zero matches, more than one, or the single match
  isn't `exact`) → shows the candidate(s) to the user and asks them to
  confirm before writing anything.

## Non-goals

- Doesn't create a new board — only edits an existing `*.kanban.md`.
- Doesn't create a new column/section — the board defines its own set;
  an unknown section name is reported as an error, not auto-created.
- Doesn't set `tags`, `priority`, `workload`, `due`, or any other
  [task attribute](../../README.md#attribute-values) — the card is
  added with a bare title only. Attributes still need to be added
  through the extension UI (or by hand) afterward.
