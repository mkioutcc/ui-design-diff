import { useState } from 'react'
import type { DiffEntry } from '../types/diff'

interface Props {
  entries: DiffEntry[]
}

const TYPE_META = {
  added: { color: '#22c55e', bg: '#052e16', label: 'Added', symbol: '+' },
  removed: { color: '#ef4444', bg: '#1c0a09', label: 'Removed', symbol: '-' },
  modified: { color: '#f59e0b', bg: '#1c1408', label: 'Modified', symbol: '~' },
  unchanged: { color: '#64748b', bg: 'transparent', label: 'Unchanged', symbol: '=' },
}

function StyleChangeRow({ prop, before, after }: { prop: string; before: string; after: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      padding: '2px 0',
      fontFamily: 'monospace',
      fontSize: '12px',
    }}>
      <span style={{ color: '#64748b', minWidth: '140px', flexShrink: 0 }}>{prop}:</span>
      <span style={{ color: '#ef4444', textDecoration: before ? 'line-through' : 'none', opacity: 0.8 }}>
        {before || '—'}
      </span>
      <span style={{ color: '#64748b' }}>→</span>
      <span style={{ color: '#22c55e' }}>{after || '—'}</span>
    </div>
  )
}

function EntryRow({ entry }: { entry: DiffEntry }) {
  const [expanded, setExpanded] = useState(true)
  const meta = TYPE_META[entry.type]
  const hasDetails = entry.styleChanges.length > 0
    || entry.attributeChanges.length > 0
    || entry.textChange != null

  return (
    <div style={{
      borderRadius: '6px',
      border: `1px solid ${meta.color}30`,
      overflow: 'hidden',
      background: '#0f172a',
    }}>
      <div
        onClick={() => hasDetails && setExpanded((p) => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          cursor: hasDetails ? 'pointer' : 'default',
          background: `${meta.color}10`,
          userSelect: 'none',
        }}
      >
        {/* Type badge */}
        <span style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 700,
          color: meta.color,
          background: `${meta.color}20`,
          padding: '2px 7px',
          borderRadius: '3px',
          minWidth: '64px',
          textAlign: 'center',
        }}>
          {meta.symbol} {meta.label}
        </span>

        {/* Selector */}
        <code style={{
          flex: 1,
          fontSize: '13px',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {entry.selector}
        </code>

        {/* Change count */}
        {hasDetails && (
          <span style={{
            fontSize: '11px',
            color: '#64748b',
            flexShrink: 0,
          }}>
            {entry.styleChanges.length + entry.attributeChanges.length + (entry.textChange ? 1 : 0)} changes
          </span>
        )}

        {/* Expand indicator */}
        {hasDetails && (
          <span style={{
            color: '#64748b',
            fontSize: '11px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s',
          }}>
            ▼
          </span>
        )}
      </div>

      {expanded && hasDetails && (
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${meta.color}20` }}>
          {entry.textChange && (
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontFamily: 'monospace' }}>
                text content:
              </div>
              <StyleChangeRow prop="content" before={entry.textChange.before} after={entry.textChange.after} />
            </div>
          )}

          {entry.attributeChanges.length > 0 && (
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontFamily: 'monospace' }}>
                attributes:
              </div>
              {entry.attributeChanges.map((ac, i) => (
                <StyleChangeRow key={i} prop={`@${ac.attr}`} before={ac.before} after={ac.after} />
              ))}
            </div>
          )}

          {entry.styleChanges.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontFamily: 'monospace' }}>
                computed styles:
              </div>
              {entry.styleChanges.map((sc, i) => (
                <StyleChangeRow key={i} prop={sc.property} before={sc.before} after={sc.after} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ChangeListView({ entries }: Props) {
  const [filter, setFilter] = useState<'all' | 'added' | 'removed' | 'modified'>('all')

  const filtered = entries.filter((e) => {
    if (filter === 'all') return e.type !== 'unchanged'
    return e.type === filter
  })

  const counts = {
    added: entries.filter((e) => e.type === 'added').length,
    removed: entries.filter((e) => e.type === 'removed').length,
    modified: entries.filter((e) => e.type === 'modified').length,
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Summary bar */}
      <div style={{
        background: '#0f172a',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
          {filtered.length} changes
        </span>

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {(['all', 'added', 'removed', 'modified'] as const).map((f) => {
            const active = filter === f
            const color = f === 'added' ? '#22c55e' : f === 'removed' ? '#ef4444' : f === 'modified' ? '#f59e0b' : '#94a3b8'
            const count = f === 'all' ? counts.added + counts.removed + counts.modified : counts[f]
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: active ? color : '#334155',
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : '#64748b',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span style={{
                    background: `${color}30`,
                    borderRadius: '10px',
                    padding: '0 5px',
                    fontSize: '10px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#334155',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginTop: '40px',
          }}>
            No changes to display
          </div>
        ) : (
          filtered.map((entry, idx) => (
            <EntryRow key={idx} entry={entry} />
          ))
        )}
      </div>
    </div>
  )
}
