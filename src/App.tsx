import { useState, useCallback } from 'react'
import CodeEditor from './components/CodeEditor'
import SideBySideView from './components/SideBySideView'
import OverlayView from './components/OverlayView'
import ChangeListView from './components/ChangeListView'
import { DEMO_BEFORE, DEMO_AFTER } from './lib/demoExamples'
import type { DiffEntry, ViewMode } from './types/diff'
import './App.css'

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'side-by-side', label: 'Side by Side' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'change-list', label: 'Change List' },
]

// Key to force re-render of view panels when HTML changes
let renderKey = 0

export default function App() {
  const [beforeHtml, setBeforeHtml] = useState(DEMO_BEFORE)
  const [afterHtml, setAfterHtml] = useState(DEMO_AFTER)
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [diffEntries, setDiffEntries] = useState<DiffEntry[]>([])
  const [panelKey, setPanelKey] = useState(0)
  const [editorCollapsed, setEditorCollapsed] = useState(false)

  const handleDiffReady = useCallback((entries: DiffEntry[]) => {
    setDiffEntries(entries)
  }, [])

  const handleRunDiff = () => {
    renderKey++
    setPanelKey(renderKey)
  }

  const changeCounts = {
    added: diffEntries.filter((e) => e.type === 'added').length,
    removed: diffEntries.filter((e) => e.type === 'removed').length,
    modified: diffEntries.filter((e) => e.type === 'modified').length,
  }
  const totalChanges = changeCounts.added + changeCounts.removed + changeCounts.modified

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">
            <span style={{ color: '#6366f1' }}>UI</span>
            <span style={{ color: '#334155' }}>/</span>
            <span style={{ color: '#22c55e' }}>diff</span>
          </span>
          <span className="app-tagline">Visual UI change detection</span>
        </div>

        {/* Change summary */}
        {totalChanges > 0 && (
          <div className="change-summary">
            {changeCounts.added > 0 && (
              <span className="change-pill added">+{changeCounts.added} added</span>
            )}
            {changeCounts.removed > 0 && (
              <span className="change-pill removed">-{changeCounts.removed} removed</span>
            )}
            {changeCounts.modified > 0 && (
              <span className="change-pill modified">~{changeCounts.modified} modified</span>
            )}
          </div>
        )}

        {/* View mode tabs */}
        <div className="view-tabs">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`view-tab ${viewMode === mode.id ? 'active' : ''}`}
              onClick={() => setViewMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </header>

      {/* Editor section */}
      <div className={`editor-section ${editorCollapsed ? 'collapsed' : ''}`}>
        <div className="editor-row">
          <CodeEditor
            value={beforeHtml}
            onChange={setBeforeHtml}
            label="Before"
            labelColor="#ef4444"
            onFileDropped={setBeforeHtml}
          />
          <div className="editor-actions">
            <button
              className="run-diff-btn"
              onClick={handleRunDiff}
              title="Run Diff (compares current editor contents)"
            >
              <span className="run-diff-icon">⟳</span>
              <span>Run Diff</span>
            </button>
            <button
              className="collapse-btn"
              onClick={() => setEditorCollapsed((p) => !p)}
              title={editorCollapsed ? 'Expand editor' : 'Collapse editor'}
            >
              {editorCollapsed ? '▼' : '▲'}
            </button>
          </div>
          <CodeEditor
            value={afterHtml}
            onChange={setAfterHtml}
            label="After"
            labelColor="#22c55e"
            onFileDropped={setAfterHtml}
          />
        </div>
      </div>

      {/* Results section */}
      <div className="results-section">
        {viewMode === 'side-by-side' && (
          <SideBySideView
            key={`sbs-${panelKey}`}
            beforeHtml={beforeHtml}
            afterHtml={afterHtml}
            onDiffReady={handleDiffReady}
            diffEntries={diffEntries}
          />
        )}
        {viewMode === 'overlay' && (
          <OverlayView
            key={`ov-${panelKey}`}
            beforeHtml={beforeHtml}
            afterHtml={afterHtml}
            onDiffReady={handleDiffReady}
            diffEntries={diffEntries}
          />
        )}
        {viewMode === 'change-list' && (
          <ChangeListView entries={diffEntries} />
        )}
      </div>
    </div>
  )
}
