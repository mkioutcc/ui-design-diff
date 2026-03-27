# UI Design Diff

A pure frontend tool that tells you **what changed in the UI**, not just what changed in the code.

Paste two versions of HTML/CSS (Before / After), and the tool will render both, diff the DOM tree and computed styles, then annotate exactly what moved, changed color, resized, or disappeared.

> git diff tells you what the code changed. This tells you what the screen changed.

---

## Features

- **DOM Tree Diff** - detects added, removed, moved, and attribute-changed elements using a fuzzy match strategy (id first, then tag + class + position)
- **Computed Style Diff** - renders inside sandboxed iframes and reads `getComputedStyle` to compare actual rendered styles: position, size, color, font, spacing, border
- **Three view modes**:
  - **Side-by-side** - left/right render with colored border annotations on changed elements
  - **Overlay** - semi-transparent overlay highlighting diff regions
  - **Change List** - structured list of every change (e.g. `.btn-primary: padding 8px → 12px`)
- **Color coding**: red = deleted, green = added, yellow/orange = modified
- **Hover tooltips** showing exact diff details per element
- **Demo examples** loaded on first visit so you see results immediately
- **Drag and drop** `.html` file support

---

## Tech Stack

- React + TypeScript + Vite
- CodeMirror (via `@uiw/react-codemirror`) for the code editors
- Pure frontend, no backend, no network requests
- iframe sandbox for safe HTML rendering

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The demo examples load automatically.

---

## Usage

1. Paste your **Before** HTML/CSS into the left editor
2. Paste your **After** HTML/CSS into the right editor
3. Click **Run Diff**
4. Switch between Side-by-side / Overlay / Change List views

Supports inline `<style>` tags and inline styles. External stylesheet imports are out of scope for this prototype.

---

## Project Structure

```
src/
  components/
    CodeEditor.tsx        # CodeMirror wrapper
    SideBySideView.tsx    # Side-by-side render + annotations
    OverlayView.tsx       # Overlay diff view
    ChangeListView.tsx    # Structured change list
    IframeRenderer.tsx    # Sandboxed iframe render
    DiffAnnotations.tsx   # Colored border overlays
  lib/
    domDiff.ts            # DOM tree diff algorithm
    demoExamples.ts       # Built-in Before/After demo pair
  types/
    diff.ts               # Shared TypeScript types
```

---

## Scope

This is a prototype for concept demonstration.

- No external CSS file imports (inline and `<style>` tags only)
- No framework component support (plain HTML/CSS only)
- No responsive/viewport testing
- No backend or data persistence
