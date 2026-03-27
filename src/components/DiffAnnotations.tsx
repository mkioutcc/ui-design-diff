import type { DiffEntry } from '../types/diff'

interface Props {
  entries: DiffEntry[]
  iframeEl: HTMLIFrameElement | null
  side: 'before' | 'after'
}

const CHANGE_COLORS = {
  added: { border: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: '#16a34a' },
  removed: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '#dc2626' },
  modified: { border: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: '#d97706' },
  unchanged: { border: 'transparent', bg: 'transparent', label: 'transparent' },
}

export default function DiffAnnotations({ entries, iframeEl, side }: Props) {
  if (!iframeEl) return null

  const iframeRect = iframeEl.getBoundingClientRect()

  // Filter entries relevant to this side
  const relevant = entries.filter((e) => {
    if (side === 'before') return e.type === 'removed' || e.type === 'modified'
    return e.type === 'added' || e.type === 'modified'
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {relevant.map((entry, idx) => {
        const rect = side === 'before' ? entry.beforeRect : entry.afterRect
        if (!rect) return null

        const colors = CHANGE_COLORS[entry.type]
        const iframeContentOffset = iframeEl.contentDocument?.documentElement.scrollTop ?? 0

        // Rect is relative to iframe's viewport, we need it relative to the container
        const top = rect.top
        const left = rect.left
        const width = rect.width
        const height = rect.height

        if (width < 1 || height < 1) return null

        return (
          <div
            key={idx}
            title={buildTooltip(entry)}
            style={{
              position: 'absolute',
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              border: `2px solid ${colors.border}`,
              background: colors.bg,
              borderRadius: '2px',
              pointerEvents: 'auto',
              cursor: 'default',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-18px',
                left: '-1px',
                background: colors.border,
                color: 'white',
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '1px 5px',
                borderRadius: '2px 2px 0 0',
                whiteSpace: 'nowrap',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : '~'}{' '}
              {entry.selector}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function buildTooltip(entry: DiffEntry): string {
  const lines: string[] = [`[${entry.type.toUpperCase()}] ${entry.selector}`]
  for (const sc of entry.styleChanges.slice(0, 8)) {
    lines.push(`  ${sc.property}: ${sc.before} → ${sc.after}`)
  }
  if (entry.textChange) {
    lines.push(`  text: "${entry.textChange.before}" → "${entry.textChange.after}"`)
  }
  for (const ac of entry.attributeChanges.slice(0, 4)) {
    lines.push(`  @${ac.attr}: ${ac.before} → ${ac.after}`)
  }
  return lines.join('\n')
}
