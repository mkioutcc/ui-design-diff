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

const CHANGE_COLORS = {
  added: '#22c55e',
  removed: '#ef4444',
  modified: '#f59e0b',
  unchanged: 'transparent',
}

export default function SideBySideView({ beforeHtml, afterHtml, onDiffReady, diffEntries }: Props) {
  const beforeRef = useRef<IframeRendererHandle>(null)
  const afterRef = useRef<IframeRendererHandle>(null)
  const loadedRef = useRef({ before: false, after: false })
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)

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

  const handleAnnotationMouseEnter = (entry: DiffEntry, e: React.MouseEvent) => {
    const lines: string[] = []
    for (const sc of entry.styleChanges.slice(0, 10)) {
      lines.push(`${sc.property}: ${sc.before || '—'} → ${sc.after || '—'}`)
    }
    if (entry.textChange) {
      lines.push(`text: "${entry.textChange.before}" → "${entry.textChange.after}"`)
    }
    for (const ac of entry.attributeChanges.slice(0, 4)) {
      lines.push(`@${ac.attr}: ${ac.before || '—'} → ${ac.after || '—'}`)
    }
    if (lines.length > 0) {
      setTooltip({ x: e.clientX, y: e.clientY, content: lines.join('\n') })
    }
  }

  const renderAnnotations = (side: 'before' | 'after', iframeRef: React.RefObject<IframeRendererHandle | null>) => {
    const iframeEl = iframeRef.current?.getIframe()
    if (!iframeEl) return null

    const relevant = diffEntries.filter((e) => {
      if (side === 'before') return e.type === 'removed' || e.type === 'modified'
      return e.type === 'added' || e.type === 'modified'
    })

    return relevant.map((entry, idx) => {
      const rect = side === 'before' ? entry.beforeRect : entry.afterRect
      if (!rect || rect.width < 1 || rect.height < 1) return null
      const color = CHANGE_COLORS[entry.type]
      const label = entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : '~'

      return (
        <div
          key={idx}
          onMouseEnter={(e) => handleAnnotationMouseEnter(entry, e)}
          onMouseLeave={() => setTooltip(null)}
          style={{
            position: 'absolute',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            border: `2px solid ${color}`,
            background: `${color}18`,
            borderRadius: '3px',
            pointerEvents: 'auto',
            cursor: 'default',
            zIndex: 10,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              background: color,
              color: 'white',
              fontSize: '9px',
              fontFamily: 'monospace',
              padding: '1px 4px',
              borderRadius: '2px 0 2px 0',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '14px',
            }}
          >
            {label} {entry.selector}
          </span>
        </div>
      )
    })
  }

  return (
    <div style={{ display: 'flex', gap: '1px', height: '100%', background: '#1e293b' }}>
      {/* Before panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          background: '#0f172a',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#ef4444',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          Before
        </div>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <IframeRenderer
            ref={beforeRef}
            html={beforeHtml}
            onLoad={handleBeforeLoad}
            style={{ width: '100%', height: '100%' }}
          />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {renderAnnotations('before', beforeRef)}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', background: '#334155', flexShrink: 0 }} />

      {/* After panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          background: '#0f172a',
          padding: '6px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#22c55e',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          After
        </div>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <IframeRenderer
            ref={afterRef}
            html={afterHtml}
            onLoad={handleAfterLoad}
            style={{ width: '100%', height: '100%' }}
          />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {renderAnnotations('after', afterRef)}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y + 12,
            left: tooltip.x + 12,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            zIndex: 9999,
            maxWidth: '360px',
            whiteSpace: 'pre',
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
