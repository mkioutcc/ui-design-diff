import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'

export interface IframeRendererHandle {
  getDocument: () => Document | null
  getWindow: () => Window | null
  getIframe: () => HTMLIFrameElement | null
}

interface Props {
  html: string
  onLoad?: () => void
  style?: React.CSSProperties
  className?: string
}

const IframeRenderer = forwardRef<IframeRendererHandle, Props>(
  ({ html, onLoad, style, className }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useImperativeHandle(ref, () => ({
      getDocument: () => iframeRef.current?.contentDocument ?? null,
      getWindow: () => iframeRef.current?.contentWindow ?? null,
      getIframe: () => iframeRef.current,
    }))

    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const handleLoad = () => {
        onLoad?.()
      }

      iframe.addEventListener('load', handleLoad)

      // Write HTML into the iframe
      const doc = iframe.contentDocument
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }

      return () => {
        iframe.removeEventListener('load', handleLoad)
      }
    }, [html, onLoad])

    return (
      <iframe
        ref={iframeRef}
        className={className}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          ...style,
        }}
        sandbox="allow-same-origin"
        title="renderer"
      />
    )
  }
)

IframeRenderer.displayName = 'IframeRenderer'

export default IframeRenderer
