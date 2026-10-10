import { useRef, useCallback } from 'react'
import './PaneResizer.css'

const MIN_PANE_WIDTH = 260
const MIN_CHART_WIDTH = 360
const MAX_PANE_FRACTION = 0.45 // matches the max-width cap on .details-panel in App.css
const KEY_STEP = 20

interface PaneResizerProps {
  /** Which edge of the pane the handle sits on (right for left-hand panes, left for right-hand panes) */
  edge: 'left' | 'right'
  /** CSS flex order of the pane — the handle shares it so it sits flush against the pane */
  order: number
  label: string
  onResize: (width: number) => void
  onReset: () => void
}

// Drag handle between a side pane and the chart. Rendered as a flex sibling of the pane
// (not inside it) because the pane is a scroll container. Must be placed immediately after
// the pane in the DOM for edge="right", and immediately before it for edge="left".
export default function PaneResizer({ edge, order, label, onResize, onReset }: PaneResizerProps) {
  const handleRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startWidth: number; maxWidth: number } | null>(null)

  const measure = useCallback(() => {
    const handle = handleRef.current
    const pane = (edge === 'right' ? handle?.previousElementSibling : handle?.nextElementSibling) as HTMLElement | null
    if (!handle || !pane) return null
    const paneWidth = pane.getBoundingClientRect().width
    const chart = handle.parentElement?.querySelector('.chart-container')
    const chartWidth = chart?.getBoundingClientRect().width ?? 0
    const maxWidth = Math.max(MIN_PANE_WIDTH, Math.min(
      paneWidth + chartWidth - MIN_CHART_WIDTH,
      window.innerWidth * MAX_PANE_FRACTION,
    ))
    return { paneWidth, maxWidth }
  }, [edge])

  const clamp = (w: number, max: number) => Math.round(Math.min(max, Math.max(MIN_PANE_WIDTH, w)))

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const m = measure()
    if (!m) return
    e.preventDefault()
    drag.current = { startX: e.clientX, startWidth: m.paneWidth, maxWidth: m.maxWidth }
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.classList.add('pane-resizing')
  }, [measure])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const delta = e.clientX - d.startX
    onResize(clamp(edge === 'right' ? d.startWidth + delta : d.startWidth - delta, d.maxWidth))
  }, [edge, onResize])

  const endDrag = useCallback(() => {
    drag.current = null
    document.body.classList.remove('pane-resizing')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onReset()
      return
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const m = measure()
    if (!m) return
    e.preventDefault()
    const grow = (e.key === 'ArrowRight') === (edge === 'right')
    onResize(clamp(m.paneWidth + (grow ? KEY_STEP : -KEY_STEP), m.maxWidth))
  }, [edge, measure, onResize, onReset])

  return (
    <div
      ref={handleRef}
      className={`pane-resize-handle pane-resize-handle-${edge}`}
      style={{ order }}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} (arrow keys to resize, Enter to reset)`}
      title="Drag to resize · double-click to reset"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
    />
  )
}
