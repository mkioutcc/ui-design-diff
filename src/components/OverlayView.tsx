import { useRef, useCallback, useState } from 'react'
import IframeRenderer, { type IframeRendererHandle } from './IframeRenderer'
import { diffDocuments } from '../lib/domDiff'
import type { DiffEntry } from '../types/diff'

interface Props {
  beforeHtml: string
  afterHtml: string
  onDiffReady: (entries: DiffEntry[]) => void
  diffEntries: DiffEntry[]
}

export default function OverlayView({ beforeHtml, afterHtml, onDiffReady, diffEntries }: Props) {
  const beforeRef = useRef<IframeRendererHandle>(null)
  const afterRef = useRef<IframeRendererHandle>(null)
  const loadedRef = useRef({ before: false, after: false })
  const [opacity, setOpacity] = useState(0.5)
  const [showOverlay, setShowOverlay] = useState<'after' | 'diff'>('diff')

  const runDiff = useCallback(() => {
    const beforeDoc = beforeRef.current?.getDocument()
    const afterDoc = afterRef.current?.getDocument()
    const beforeWin = beforeRef.current?.getWindow()
    const afterWin = afterRef.current?.getWindow()
    if (!beforeDoc || !afterDoc || !beforeWin || !afterWin) return
    const entries = diffDocuments(beforeDoc, afterDoc, beforeWin, afterWin)
    onDiffReady(entries)
  }, [onDiffReady])

  const handleBeforeLoad = useCallback(() => {
    loadedRef.current.before = true
    if (loadedRef.current.after) runDiff()
  }, [runDiff])

  const handleAfterLoad = useCallback(() => {
    loadedRef.current.after = true
    if (loadedRef.current.before) runDiff()
  }, [runDiff])

  const renderDiffRects = () => {
    return diffEntries.map((entry, idx) => {
      const rect = entry.afterRect || entry.beforeRect
      if (!rect || rect.width < 1 || rect.height < 1) return null

      const colors: Record<string, string> = {
        added: 'rgba(34,197,94,0.35)',
        removed: 'rgba(239,68,68,0.35)',
        modified: 'rgba(245,158,11,0.28)',
        unchanged: 'transparent',
      }
      const color = colors[entry.type]
      if (color === 'transparent') return null

      return (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: color,
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        />
      )
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{
        background: '#0f172a',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #1e293b',
        fontSize: '13px',
        color: '#94a3b8',
      }}>
        <span>Overlay mode:</span>
        <button
          onClick={() => setShowOverlay('after')}
          style={{
            padding: '3px 10px',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: showOverlay === 'after' ? '#6366f1' : '#334155',
            background: showOverlay === 'after' ? '#1e1b4b' : 'transparent',
            color: showOverlay === 'after' ? '#a5b4fc' : '#64748b',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          After over Before
        </button>
        <button
          onClick={() => setShowOverlay('diff')}
          style={{
            padding: '3px 10px',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: showOverlay === 'diff' ? '#6366f1' : '#334155',
            background: showOverlay === 'diff' ? '#1e1b4b' : 'transparent',
            color: showOverlay === 'diff' ? '#a5b4fc' : '#64748b',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Diff Highlight
        </button>
        {showOverlay === 'after' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span>Opacity: {Math.round(opacity * 100)}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              style={{ width: '80px', accentColor: '#6366f1' }}
            />
          </label>
        )}
      </div>

      {/* Viewer - both iframes always mounted, visibility toggled via z-index/opacity */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Before iframe - always visible as the base */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <IframeRenderer
            ref={beforeRef}
            html={beforeHtml}
            onLoad={handleBeforeLoad}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* After iframe - invisible for sizing/diff, shown at opacity in 'after' mode */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          opacity: showOverlay === 'after' ? opacity : 0,
          pointerEvents: showOverlay === 'after' ? 'auto' : 'none',
        }}>
          <IframeRenderer
            ref={afterRef}
            html={afterHtml}
            onLoad={handleAfterLoad}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Diff highlight rects - above the before iframe, only in diff mode */}
        {showOverlay === 'diff' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
            {renderDiffRects()}
          </div>
        )}

        {/* Legend */}
        {showOverlay === 'diff' && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 4,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 12, background: 'rgba(34,197,94,0.5)', borderRadius: 2 }} />
              Added
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 12, background: 'rgba(239,68,68,0.5)', borderRadius: 2 }} />
              Removed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 12, background: 'rgba(245,158,11,0.4)', borderRadius: 2 }} />
              Modified
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
