# md-kanban-tracker

<div align="center">

![Kanban.md Logo](./imgs/logo.png)

**A Markdown Kanban board with built-in WIP tracking — no external scripts, no watchers**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/luismulato/md-kanban-tracker)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-green.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [Changelog](CHANGELOG.md) • [Español](README.es.md)

</div>

---

## 🍴 About this fork

**md-kanban-tracker** is a fork of [kanban.md](https://github.com/wguilherme/kanban.md) by Withney Guilherme, licensed MIT (kept as-is — see [`LICENSE.txt`](LICENSE.txt)). It adds board-level automation (single active WIP task, daily Done archiving, a WIP-synced timer) directly in the extension backend, plus inline title editing and a more discoverable due-date picker. It is not affiliated with or endorsed by the original project; all credit for the original architecture and design goes to its author.

## 📖 Overview

**md-kanban-tracker** is a VSCode extension that brings the power of Kanban boards directly into your Markdown workflow, with automatic WIP/time tracking built in. Manage tasks, track progress, and organize projects using plain Markdown files with a beautiful, interactive drag-and-drop interface — no external scripts or file watchers needed to keep WIP limits and time logs honest.

Built with modern technologies (React 19, TypeScript 5.9, Vite 7) and designed to respect your VSCode theme, md-kanban-tracker seamlessly integrates with your development environment.

![Kanban Board Demo](./imgs/image.png)

---

## ✨ Features

### ⏱️ Board Automation (new in this fork)

- **Single WIP task**: dragging a second task into the `WIP` column automatically sends the previous occupant to the top of `To Do` — no more than one thing "in progress" at a time.
- **Daily Done archiving**: the first time a task enters `WIP` each day, everything sitting in `Done` moves to the end of `Done Done`, so `Done` only ever shows what was finished today.
- **WIP-synced timer**: moving a task into WIP starts a timer for it automatically; moving it out stops the timer and appends a line to a per-board `.timelog.md` file. Switching focus (one task leaves WIP, another enters) stops the old timer and starts the new one in a single step. A manually-started timer for something that isn't in WIP is never touched by this.
- **Companion folder**: the first time you open a `.kanban.md` file, a `md-kanban-tracker/` folder appears next to it with the timelog, a usage guide, and a short readme — all generated automatically, nothing to set up.
- **Skeleton on first open**: opening an empty `.kanban.md` seeds it with the five standard columns (`Backlog`, `To Do`, `WIP`, `Done`, `Done Done`) and one starter card in `To Do`, so you never land on a blank panel.

### 🎯 Core Functionality

- **📋 Markdown-First Approach**: Your data lives in `.kanban.md` files - no databases, no proprietary formats
- **🔄 Real-Time Bidirectional Sync**: Changes in the Kanban view instantly update the Markdown file and vice versa
- **🎨 Theme-Aware UI**: Automatically adapts to your VSCode theme (Dracula, One Dark Pro, etc.)
- **⚡ Smooth Drag & Drop**: Built with [@dnd-kit](https://dndkit.com/) for fluid, responsive interactions
- **🗂️ Sidebar Integration**: Dedicated Activity Bar icon with TreeView showing all kanban boards in your workspace

### 📝 Rich Task Management

- **Priority Levels**: Three levels displayed as colored left border on cards (Trello-style)
  - High: red border
  - Medium: yellow border
  - Low: green border
- **Workload Tracking**: Four intensity levels with diamond icons
  - Easy (◇), Normal (◈), Hard (◆), Extreme (◆◆)
- **Editable Task Modal**: Click any task to open a modal where you can:
  - Click the title to rename it in place — `Enter` saves, `Esc` discards the edit and restores the original title
  - Click badges to cycle through priority/workload values
  - Add, remove, and edit subtasks inline
  - Edit description with save-on-blur
  - Set due dates — click anywhere in the due-date row to open the native calendar picker, not just the small icon
  - Unsaved changes indicator (●) shown in header
- **Step-by-Step Tasks**: Checkbox-based subtasks using `- [ ] step` format
- **Tag System**: Multiple tagging formats supported:
  - Inline: `#tag1 #tag2`
  - Array: `[tag1, tag2, tag3]`
- **Due Dates**: Track deadlines with `due:YYYY-MM-DD`
- **Task Descriptions**: Multi-line descriptions with Markdown code block support
- **Expand/Collapse**: Tasks collapsed by default for clean view

### 🔧 Advanced Features

- **Archive Support**: Move completed columns to archive state
- **Column Management**: Hide/show, reorder columns via drag & drop
- **Per-column quick add**: each column shows its task count next to the title (Notion-style) and reveals a "+ Add card" button on hover — clicking it (or the column's empty area) opens the new-note editor
- **Tag Filtering**: Filter tasks by one or multiple tags (comma-separated)
- **Multiple Sort Options**: Sort by name, due date, priority, workload
- **File Switcher**: Toggle automatic file switching behavior
- **Quick Board Creation**: One-click creation with pre-filled templates
- **Auto-Refresh**: Sidebar updates when `.kanban.md` files change
- **Configurable Task Format**: Choose between header (`###`) or list (`-`) format

### 🏗️ Technical Highlights

- **Modern Architecture**:
  - React 19 with functional components and hooks
  - Zustand for centralized state management
  - TypeScript 5.9 with strict mode
  - Vite 7 for lightning-fast builds
  - TailwindCSS 3 for utility-first styling
- **Flicker-Free Drag & Drop**:
  - Fingerprint-based content comparison (NormalizedDocument pattern)
  - Promise queue for serialized save operations
  - Optimistic UI updates with backend sync protection
  - Deferred save pattern - changes saved when modal closes
- **Performance Optimizations**:
  - Memoized components (`React.memo`) to prevent unnecessary re-renders
  - Single HTML build per panel lifecycle
  - Ref-based state tracking for message handlers
- **Collision Detection**: `pointerWithin` as the primary strategy, falling back to `closestCorners` — fixes dropping onto columns with zero tasks, which `closestCorners` alone can miss
- **Cross-Column Preview**: Real-time visual feedback when dragging tasks between columns

---

## 🚀 Installation

This fork is not published to the VSCode Marketplace — install it from a `.vsix` build.

### From a prebuilt `.vsix`

```bash
code --install-extension md-kanban-tracker-0.1.0.vsix
```

### Building your own `.vsix`

```bash
git clone https://github.com/luismulato/md-kanban-tracker.git
cd md-kanban-tracker
npm install
npx @vscode/vsce package --no-dependencies
code --install-extension md-kanban-tracker-0.1.0.vsix
```

### Requirements

- **VSCode**: 1.74.0 or higher
- **Node.js**: 22+ (for development)

---

## 💡 Usage

### Quick Start

#### 1️⃣ Create a Kanban Board

**Option A: From Sidebar** (Recommended)

1. Click the Kanban icon in the Activity Bar (left sidebar)
2. Click the **➕ New Kanban Board** button
3. Enter a name (e.g., `sprint-planning`)
4. Board opens automatically with example tasks

**Option B: Manual Creation**

Create a file with `.kanban.md` extension:

```markdown
# Project Sprint

## To Do

### Design User Interface
#design #ui #frontend
**Priority:** High
**Workload:** Hard
**Due:** 2024-12-01

Design user login and registration pages, including:
- Responsive layout design
- Brand color application
- User experience optimization

- [ ] Create wireframes
- [ ] Design mockups
- [ ] Get stakeholder approval

### Write API Documentation
#documentation #backend
**Priority:** Medium
**Workload:** Normal

Write complete REST API documentation using OpenAPI 3.0 specification.

## In Progress

### Implement Authentication
#security #backend
**Priority:** High
**Workload:** Extreme

- [x] Setup JWT tokens
- [ ] Add OAuth providers
- [ ] Write security tests

## Done

### Project Setup
#setup
**Priority:** Low
**Workload:** Easy

Initial repository setup complete!
```

#### 2️⃣ Open Kanban View

Choose any method:

- **Method 1**: Click a board in the sidebar
- **Method 2**: Right-click `.kanban.md` file → **"Kanban"**
- **Method 3**: Command Palette (`Ctrl/Cmd+Shift+P`) → **"md-kanban-tracker: Kanban"**

#### 3️⃣ Manage Tasks

**Moving Tasks**
- Drag any task card to another column
- Changes save automatically to the Markdown file

**Filtering & Sorting**
- Enter tags in the filter box: `design,urgent`
- Use sort dropdown: Name, Due Date, Priority, Workload
- Click "Clear Filters" to reset

**Task Operations**
- **Expand**: Click task to view full details
- **Edit**: Click "Edit" button on task card
- **Delete**: Click "Delete" button
- **Add**: Click "+ Add Task" at column bottom

**Column Operations**
- **Hide**: Click eye icon on column title
- **Reorder**: Drag column header to new position
- **Archive**: Mark columns as archived

---

## 🎨 Task Format Reference

### Supported Formats

**Modern Structured Format** (Recommended)

```markdown
### Task Title
- tags: [tag1, tag2, tag3]
- priority: high
- workload: Hard
- due: 2024-12-31
- defaultExpanded: true
- steps:
    - [x] Step 1
    - [ ] Step 2
  ```md
  Detailed description with **Markdown** support.
  Can include code blocks, lists, etc.
  ```
```

**Classic Inline Format** (Also Supported)

```markdown
### Task Title
#tag1 #tag2
**Priority:** High
**Workload:** Hard
**Due:** 2024-12-31

Task description here

- [ ] Step 1
- [x] Step 2
```

### Attribute Values

| Attribute | Values | Example |
|-----------|--------|---------|
| `priority` | `high`, `medium`, `low` | `priority: high` |
| `workload` | `Easy`, `Normal`, `Hard`, `Extreme` | `workload: Hard` |
| `due` | `YYYY-MM-DD` | `due: 2024-12-31` |
| `defaultExpanded` | `true`, `false` | `defaultExpanded: true` |
| `tags` | Array or hashtags | `[ui, design]` or `#ui #design` |
| `type` | `epic`, `story`, `task`, `spike`, `bug` | `type: bug` |
| `owner` | free string (defaults to `Luis`) | `owner: Claude` |
| `origin` | free string — provenance marker for a card promoted from another board | `origin: luis.jobs/anfora` |

`owner` and `origin` are markdown-only (no UI to set them yet). `origin` is
meant for aggregator boards such as a weekly planner: it records the
`<domain>/<project>` a card was pulled from. On a project's own board you
leave it unset — the origin is implicitly that project.

---

## ⚙️ Configuration

### Settings

Access via `File > Preferences > Settings` → Search "md-kanban-tracker"

#### `md-kanban-tracker.taskHeader`

Choose task format in Markdown files:

- **`"title"`** (default): Tasks use `### Header` format
- **`"list"`**: Tasks use `- List item` format

```json
{
  "md-kanban-tracker.taskHeader": "title"
}
```

### Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `md-kanban-tracker: Kanban` | - | Open Kanban view for current file |
| `md-kanban-tracker: New Kanban Board` | - | Create new kanban file |
| `md-kanban-tracker: Refresh` | - | Refresh sidebar board list |
| `md-kanban-tracker: Enable/Disable File Switcher` | - | Toggle automatic file switching |

---

## 🏗️ Development

### Prerequisites

```bash
node --version  # Should be 22+
npm --version
```

### Setup

```bash
# Clone repository
git clone https://github.com/luismulato/md-kanban-tracker.git
cd md-kanban-tracker

# Install dependencies
npm install

# Build extension + webview
npm run build
```

### Development Workflow

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Type checking
npm run check-types

# Linting
npm run lint

# Run tests
npm test
```

### Project Structure

```
markdown-kanban/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── kanbanWebviewPanel.ts     # Webview lifecycle manager
│   ├── webview/                  # React application
│   │   ├── App.tsx               # Main React app
│   │   ├── components/
│   │   │   ├── KanbanBoard/      # Board + drag-drop components
│   │   │   ├── TaskModal.tsx     # Task detail modal
│   │   │   └── atoms/            # Atomic design: Button, Badge, etc.
│   │   ├── stores/               # Zustand state management
│   │   │   └── kanbanStore.ts    # Centralized board state
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # TypeScript definitions
├── dist/                         # Build output
│   ├── extension.js              # Bundled extension
│   └── webview/                  # Bundled React app
├── vite.config.ts                # Vite config for extension
├── vite.webview.config.ts        # Vite config for webview
├── tailwind.config.js            # TailwindCSS with VSCode theme vars
└── tsconfig.json                 # TypeScript configuration
```

### Build System

This project uses **Vite 7** with dual configurations:

- **Extension**: Node.js SSR build (`vite.config.ts`)
- **Webview**: Browser SPA build (`vite.webview.config.ts`)

### Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.9.3 | Type-safe development |
| React | 19.2.0 | UI framework |
| Zustand | 5.0.5 | State management |
| Vite | 7.2.4 | Build tool |
| TailwindCSS | 3.4.18 | Styling |
| @dnd-kit | 6.3.1 | Drag & drop |
| VSCode API | 1.106.1 | Extension integration |

---

## 🤝 Contributing

We welcome contributions! Whether it's bug reports, feature requests, or pull requests, your input helps make md-kanban-tracker better.

### How to Contribute

1. **Fork the repository**
   ```bash
   gh repo fork luismulato/md-kanban-tracker
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, typed TypeScript code
   - Follow the Atomic Design pattern for components
   - Add tests if applicable
   - Update documentation

4. **Test thoroughly**
   ```bash
   npm run check-types
   npm run lint
   npm run build
   # Manual testing in VSCode
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add task duplication feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   gh pr create
   ```

### Contribution Guidelines

- **Code Style**: Follow existing patterns, use TypeScript strict mode
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `refactor:` Code refactoring
  - `chore:` Build/tooling changes
- **Testing**: Ensure no regressions before submitting
- **Documentation**: Update README/CHANGELOG for user-facing changes

### Development Tips

- Use **React DevTools** for debugging webview components
- Check `Output > md-kanban-tracker` for extension logs
- Test with multiple VSCode themes to ensure UI compatibility
- Verify `.kanban.md` file sync works bidirectionally

### Areas for Contribution

- 📱 Mobile/responsive improvements
- 🎨 Additional theme customization options
- 🔍 Advanced search/filter capabilities
- 📊 Task analytics and reporting
- 🌐 i18n/localization support
- 🧪 Test coverage expansion
- 📝 Documentation improvements

---

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/luismulato/md-kanban-tracker/issues/new) with:

- **VSCode version**: `Help > About`
- **Extension version**: Check extensions panel
- **OS**: Windows/macOS/Linux + version
- **Steps to reproduce**: Detailed repro steps
- **Expected vs actual behavior**
- **Screenshots/GIFs**: If applicable
- **Sample `.kanban.md` file**: If relevant

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/luismulato/md-kanban-tracker/issues)
- **Not affiliated with the marketplace listing** of the original `kanban.md` — this fork is not published to the VSCode Marketplace, install it locally from a `.vsix` (see Installation).

---

## 📜 License

This project is licensed under the **MIT License** — see [`LICENSE.txt`](LICENSE.txt). It's a fork of [wguilherme/kanban.md](https://github.com/wguilherme/kanban.md), also MIT — the original license and copyright notice are kept as-is.

---

## 🙏 Acknowledgments

- Forked from [kanban.md](https://github.com/wguilherme/kanban.md) by Withney Guilherme — all credit for the original architecture, design, and the bulk of the codebase goes there.
- Built with [VSCode Extension API](https://code.visualstudio.com/api)
- Drag & drop powered by [@dnd-kit](https://dndkit.com/)
- UI components follow [Atomic Design](https://atomicdesign.bradfrost.com/) principles

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/luismulato/md-kanban-tracker?style=social)
![GitHub issues](https://img.shields.io/github/issues/luismulato/md-kanban-tracker)

---

<div align="center">

**Made with ❤️ by the open source community**

[⬆ Back to top](#md-kanban-tracker)

</div>
