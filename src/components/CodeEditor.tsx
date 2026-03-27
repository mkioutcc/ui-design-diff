import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  value: string
  onChange: (value: string) => void
  label: string
  labelColor: string
  onFileDropped: (content: string) => void
}

export default function CodeEditor({ value, onChange, label, labelColor, onFileDropped }: Props) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onFileDropped(text)
    }
    reader.readAsText(file)
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '6px',
        border: '1px solid #1e293b',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{
        background: '#0f172a',
        padding: '6px 12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: labelColor,
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: labelColor,
          display: 'inline-block',
        }} />
        {label}
        <span style={{ marginLeft: 'auto', color: '#334155', fontSize: '11px' }}>
          drop .html to load
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <CodeMirror
          value={value}
          height="100%"
          extensions={[html()]}
          theme={oneDark}
          onChange={onChange}
          style={{ height: '100%', fontSize: '13px' }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            syntaxHighlighting: true,
            autocompletion: true,
          }}
        />
      </div>
    </div>
  )
}
