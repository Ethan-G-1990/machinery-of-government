import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import OrgChart from './components/OrgChart'
import FullView from './components/FullView'
import GravityView from './components/GravityView'
import ElementDetails from './components/ElementDetails'
import CategoryInfo from './components/CategoryInfo'
import TagInfo from './components/TagInfo'
import SearchPane from './components/SearchPane'
import InfoPane from './components/InfoPane'
import CategoriesPane from './components/CategoriesPane'
import { govElements } from './data/elements'
import { getElementColor } from './utils/colors'
import type { Jurisdiction } from './data/jurisdictions'
import { elementMatchesJurisdiction, jurisdictionInfo } from './data/jurisdictions'
import JurisdictionFilter from './components/JurisdictionFilter'
import PaneResizer from './components/PaneResizer'
import HierarchyView from './components/HierarchyView'
import './App.css'

type CanvasView = 'focus' | 'radial' | 'gravity' | 'hierarchy'

const CANVAS_VIEWS: { id: CanvasView; label: string; title: string }[] = [
  { id: 'focus', label: '⊡ Focus', title: 'Focus view' },
  { id: 'radial', label: '⊙ Radial', title: 'Radial view' },
  { id: 'gravity', label: '⊝ Gravity', title: 'Gravity view (experimental)' },
  { id: 'hierarchy', label: '▤ Hierarchy', title: 'Hierarchy view' },
]

type PaneKey = 'category' | 'element' | 'search' | 'info' | 'categories'
const PANE_WIDTHS_STORAGE_KEY = 'mog-pane-widths'

// Tiny SVG shape matching the Cytoscape node shape for each subtype
function SubtypeShape({ category, subtype }: { category: string; subtype: string }) {
  const color = getElementColor(category, subtype)
  const size = 14
  const c = size / 2  // 7

  let shape: React.ReactNode

  if (category === 'official' && subtype === 'prime-minister') {
    // Heptagon
    const r = c - 1
    const pts = Array.from({ length: 7 }, (_, i) => {
      const a = (Math.PI * (-0.5 + (2 * i) / 7))
      return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`
    }).join(' ')
    shape = <polygon points={pts} fill={color} />
  } else if (category === 'official' && subtype === 'cabinet-minister') {
    // Octagon
    const r = c - 1
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * (-0.5 + (2 * i) / 8))
      return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`
    }).join(' ')
    shape = <polygon points={pts} fill={color} />
  } else if (category === 'department' && (subtype === 'ministerial' || subtype === 'non-ministerial')) {
    // Rectangle
    shape = <rect x="1" y="2.5" width={size - 2} height={size - 5} fill={color} />
  } else if (category === 'department' && (subtype === 'agency' || subtype === 'division-directorate')) {
    // Rounded rectangle
    shape = <rect x="1" y="2.5" width={size - 2} height={size - 5} rx="3" fill={color} />
  } else if (category === 'body') {
    // Diamond
    shape = <polygon points={`${c},1 ${size - 1},${c} ${c},${size - 1} 1,${c}`} fill={color} />
  } else if (category === 'group') {
    // Pentagon
    const r = c - 1
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * (-0.5 + (2 * i) / 5))
      return `${(c + r * Math.cos(a)).toFixed(2)},${(c + r * Math.sin(a)).toFixed(2)}`
    }).join(' ')
    shape = <polygon points={pts} fill={color} />
  } else {
    // Ellipse (default for officials)
    shape = <ellipse cx={c} cy={c} rx={c - 1} ry={c - 1} fill={color} />
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {shape}
    </svg>
  )
}

function App() {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [elementPaneVisible, setElementPaneVisible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{ category: string; subtype: string } | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [viewMode, setViewMode] = useState<CanvasView>('radial')
  const [darkMode, setDarkMode] = useState(false)
  const [legendVisible, setLegendVisible] = useState(true)
  const [previewedElementId, setPreviewedElementId] = useState<string | null>(null)
  const [searchHighlightIds, setSearchHighlightIds] = useState<string[] | null>(null)
  const [jurisdictionFilter, setJurisdictionFilter] = useState<Jurisdiction | null>(null)
  const [jurisdictionPanelOpen, setJurisdictionPanelOpen] = useState(false)

  const jurisdictionHighlightIds = useMemo(() =>
    jurisdictionFilter
      ? Object.values(govElements)
          .filter(el => elementMatchesJurisdiction(el.jurisdictions, jurisdictionFilter))
          .map(el => el.id)
      : null
  , [jurisdictionFilter])

  // Mobile detection — only touch devices, not narrow desktop windows
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px) and (pointer: coarse)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // User-resized side pane widths (desktop only); absent key = CSS default width
  const [paneWidths, setPaneWidths] = useState<Partial<Record<PaneKey, number>>>(() => {
    try { return JSON.parse(localStorage.getItem(PANE_WIDTHS_STORAGE_KEY) ?? '{}') } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem(PANE_WIDTHS_STORAGE_KEY, JSON.stringify(paneWidths)) } catch { /* storage unavailable */ }
  }, [paneWidths])

  const paneStyle = (key: PaneKey) =>
    paneWidths[key] ? { '--pane-width': `${paneWidths[key]}px` } as React.CSSProperties : undefined

  const paneResizer = (key: PaneKey, edge: 'left' | 'right', order: number, label: string) => !isMobile && (
    <PaneResizer
      edge={edge}
      order={order}
      label={label}
      onResize={(w) => setPaneWidths(p => ({ ...p, [key]: w }))}
      onReset={() => setPaneWidths(p => { const next = { ...p }; delete next[key]; return next })}
    />
  )

  // Bottom sheet state: 'closed' | 'partial' | 'full'
  type SheetState = 'closed' | 'partial' | 'full'
  const [sheetState, setSheetState] = useState<SheetState>('closed')

  // Drag gesture state for bottom sheet
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const dragStartTranslate = useRef(0)
  const isDragging = useRef(false)

  // Mobile: only one pane may be open at a time — closing the others when a new one opens
  const closeOtherMobilePanes = useCallback(() => {
    setSearchOpen(false)
    setInfoOpen(false)
    setCategoriesOpen(false)
    setSelectedCategory(null)
    setSelectedTagId(null)
  }, [])

  const selectElement = useCallback((id: string, direct = false) => {
    if (isMobile && !direct) {
      // On mobile: just preview — chip shows the name, no chart update yet
      setPreviewedElementId(id)
    } else {
      setSelectedElementId(id)
      setPreviewedElementId(id)
      if (!isMobile) {
        setElementPaneVisible(true)
      } else {
        // On mobile, a direct selection (e.g. from search/categories) opens the pane full screen
        closeOtherMobilePanes()
        setElementPaneVisible(true)
        setSheetState('full')
      }
    }
  }, [isMobile, closeOtherMobilePanes])

  const deselectElement = useCallback(() => {
    setSelectedElementId(null)
    setElementPaneVisible(false)
    setPreviewedElementId(null)
  }, [])

  const closeElementPane = useCallback(() => {
    setElementPaneVisible(false)
    if (isMobile) setSheetState('closed')
    // selectedElementId is kept — chart stays focused on last element
  }, [isMobile])

  // Sheet height helpers
  const getTranslateForState = (state: SheetState): number => {
    if (!sheetRef.current) return 0
    const vh = window.innerHeight
    if (state === 'closed') return vh
    if (state === 'partial') return vh * 0.55   // show 45vh
    return vh * 0.10                             // show 90vh
  }

  // Drag handlers (attached to handle only)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!sheetRef.current) return
    isDragging.current = true
    dragStartY.current = e.clientY
    const currentTranslate = getTranslateForState(sheetState)
    dragStartTranslate.current = currentTranslate
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    // Disable transition during drag
    sheetRef.current.style.transition = 'none'
  }, [sheetState])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    const delta = e.clientY - dragStartY.current
    const newTranslate = Math.max(0, dragStartTranslate.current + delta)
    sheetRef.current.style.transform = `translateY(${newTranslate}px)`
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false
    sheetRef.current.style.transition = ''
    sheetRef.current.style.transform = ''

    const delta = e.clientY - dragStartY.current
    if (delta > 80) {
      // Dragged down — close if partial, go partial if full
      if (sheetState === 'full') setSheetState('partial')
      else closeElementPane()
    } else if (delta < -60 && sheetState === 'partial') {
      // Dragged up from partial — go full
      setSheetState('full')
    }
    // else snap back to current state (CSS transition handles it)
  }, [sheetState, closeElementPane])

  return (
    <div className={`app${darkMode ? ' app-dark' : ''}`}>
      <header className="app-header">
        <div className="app-header-text">
          <h1>Machinery of Government</h1>
          <p>Explore the organisation and relationships of HM Government · by <a href="https://x.com/Hrushworth" target="_blank" rel="noopener noreferrer">@hrushworth</a></p>
        </div>
        <div className="header-buttons">
          <button
            className="header-button"
            onClick={() => { setInfoOpen(o => !o); setSearchOpen(false); setCategoriesOpen(false); if (isMobile) closeElementPane() }}
            aria-label="Toggle info panel"
            aria-pressed={infoOpen}
          >
            ? Help
          </button>
          <button
            className="header-button"
            onClick={() => { setCategoriesOpen(o => !o); setSearchOpen(false); setInfoOpen(false); if (isMobile) closeElementPane() }}
            aria-label="Toggle categories"
            aria-pressed={categoriesOpen}
          >
            🗂️ Categories
          </button>
          <button
            className="header-button"
            onClick={() => { setSearchOpen(o => !o); setInfoOpen(false); setCategoriesOpen(false); if (isMobile) closeElementPane() }}
            aria-label="Toggle search"
            aria-pressed={searchOpen}
          >
            🔍 Search
          </button>
        </div>
      </header>

      <div className="app-container">
        {/* Each side pane is followed (left panes) or preceded (right panes) by its resize
            handle, sharing the pane's flex order so the handle sits on the chart-facing edge */}
        {selectedCategory && (
          <>
            <aside className="details-panel category-pane" style={paneStyle('category')}>
              <CategoryInfo
                category={selectedCategory.category}
                subtype={selectedCategory.subtype}
                onClose={() => setSelectedCategory(null)}
                onSelectElement={(id) => selectElement(id, true)}
              />
            </aside>
            {paneResizer('category', 'right', 1, 'category pane')}
          </>
        )}

        {selectedTagId && (
          <>
            <aside className="details-panel category-pane" style={paneStyle('category')}>
              <TagInfo
                tagId={selectedTagId}
                onClose={() => setSelectedTagId(null)}
                onSelectElement={(id) => selectElement(id, true)}
              />
            </aside>
            {paneResizer('category', 'right', 1, 'tag pane')}
          </>
        )}


        {/* Desktop element pane — hidden on mobile (bottom sheet used instead) */}
        {!isMobile && selectedElementId && elementPaneVisible && (
          <>
            <aside className="details-panel element-pane" style={paneStyle('element')}>
              <ElementDetails
                elementId={selectedElementId}
                onSelectElement={selectElement}
                onClose={closeElementPane}
                onOpenCategory={(category, subtype) => setSelectedCategory({ category, subtype })}
                onOpenTag={(tagId) => setSelectedTagId(tagId)}
              />
            </aside>
            {paneResizer('element', 'right', 2, 'details pane')}
          </>
        )}

        <div className="chart-container" style={{ position: 'relative' }}>
          {viewMode === 'focus' ? (
            <OrgChart
              onSelectElement={selectElement}
              selectedElementId={selectedElementId}
              previewedElementId={previewedElementId}
              darkMode={darkMode}
              isMobile={isMobile}
            />
          ) : viewMode === 'gravity' ? (
            <GravityView
              onSelectElement={selectElement}
              onDeselect={deselectElement}
              onReset={() => setJurisdictionFilter(null)}
              selectedElementId={selectedElementId}
              previewedElementId={previewedElementId}
              darkMode={darkMode}
              highlightIds={searchOpen ? searchHighlightIds : null}
              jurisdictionIds={jurisdictionHighlightIds}
              isMobile={isMobile}
            />
          ) : viewMode === 'hierarchy' ? (
            <HierarchyView selectedElementId={selectedElementId} onSelectElement={(id) => selectElement(id, true)} />
          ) : (
            <FullView
              onSelectElement={selectElement}
              onDeselect={deselectElement}
              onReset={() => setJurisdictionFilter(null)}
              selectedElementId={selectedElementId}
              previewedElementId={previewedElementId}
              darkMode={darkMode}
              highlightIds={searchOpen ? searchHighlightIds : null}
              jurisdictionIds={jurisdictionHighlightIds}
              isMobile={isMobile}
            />
          )}
          <div className="chart-overlay-buttons">
            <div className="view-mode-group" role="group" aria-label="Canvas view">
              {CANVAS_VIEWS.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  className={`view-toggle-btn${viewMode === mode.id ? ' view-toggle-btn-active' : ''}`}
                  aria-pressed={viewMode === mode.id}
                  title={mode.title}
                  onClick={() => setViewMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {viewMode !== 'hierarchy' && !isMobile && (
              <button
                className={`view-toggle-btn${legendVisible ? ' view-toggle-btn-active' : ''}`}
                onClick={() => setLegendVisible(v => !v)}
                title={legendVisible ? 'Hide legend' : 'Show legend'}
                aria-label={legendVisible ? 'Hide legend' : 'Show legend'}
              >
                ☰ Legend
              </button>
            )}
            <div style={{ position: 'relative' }}>
              <button
                className={`view-toggle-btn${jurisdictionFilter ? ' view-toggle-btn-active' : ''}`}
                onClick={() => setJurisdictionPanelOpen(o => !o)}
                title={jurisdictionFilter ? `Jurisdiction: ${jurisdictionInfo[jurisdictionFilter].label}` : 'Filter by jurisdiction'}
                aria-label="Filter by jurisdiction"
              >
                🌍{jurisdictionFilter ? ` ${jurisdictionInfo[jurisdictionFilter].shortLabel}` : ' Territory'}
              </button>
              {jurisdictionPanelOpen && (
                <JurisdictionFilter
                  active={jurisdictionFilter}
                  onChange={setJurisdictionFilter}
                  onClose={() => setJurisdictionPanelOpen(false)}
                  darkMode={darkMode}
                />
              )}
            </div>
            <button
              className="view-toggle-btn"
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀' : '☾'}
            </button>
          </div>
          {viewMode !== 'hierarchy' && !isMobile && legendVisible && (
            <div className="legend">
              <div className="legend-section legend-section-two-col">
                <h4>Officials</h4>
                {/* Col 1: ministerial hierarchy */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'official', subtype: 'prime-minister' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'official', subtype: 'prime-minister' })}>
                  <div className="legend-shape heptagon"><div className="shape-inner" style={{ backgroundColor: '#5c0000' }}><div className="shape-inner" style={{ backgroundColor: '#c97070', transform: 'scale(0.78)' }}></div></div></div>
                  <span>Prime Minister</span>
                </div>
                {/* Col 2 row 1 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'official', subtype: 'civil-servant' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'official', subtype: 'civil-servant' })}>
                  <div className="legend-shape circle" style={{ backgroundColor: '#a9d8f5', borderColor: '#2980b9' }}></div>
                  <span>Civil Servant</span>
                </div>
                {/* Col 1 row 2 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'official', subtype: 'cabinet-minister' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'official', subtype: 'cabinet-minister' })}>
                  <div className="legend-shape octagon"><div className="shape-inner" style={{ backgroundColor: '#922b21' }}><div className="shape-inner" style={{ backgroundColor: '#e8a09a', transform: 'scale(0.78)' }}></div></div></div>
                  <span>Cabinet Minister</span>
                </div>
                {/* Col 2 row 2 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'official', subtype: 'independent' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'official', subtype: 'independent' })}>
                  <div className="legend-shape circle" style={{ backgroundColor: '#a9d8ab', borderColor: '#229954' }}></div>
                  <span>Independent Official</span>
                </div>
                {/* Col 1 row 3 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'official', subtype: 'junior-minister' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'official', subtype: 'junior-minister' })}>
                  <div className="legend-shape circle" style={{ backgroundColor: '#fadbd8', borderColor: '#cd6155' }}></div>
                  <span>Junior Minister</span>
                </div>
              </div>

              <div className="legend-section">
                <h4>Departments</h4>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'department', subtype: 'ministerial' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'department', subtype: 'ministerial' })}>
                  <div className="legend-shape square" style={{ backgroundColor: '#f4a6a0', borderColor: '#e74c3c' }}></div>
                  <span>Ministerial Dept</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'department', subtype: 'division-directorate' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'department', subtype: 'division-directorate' })}>
                  <div className="legend-shape rounded-square" style={{ backgroundColor: '#f4a6a0', borderColor: '#e74c3c' }}></div>
                  <span>Division/Directorate</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'department', subtype: 'non-ministerial' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'department', subtype: 'non-ministerial' })}>
                  <div className="legend-shape square" style={{ backgroundColor: '#a9d8f5', borderColor: '#2980b9' }}></div>
                  <span>Non-Ministerial</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'department', subtype: 'agency' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'department', subtype: 'agency' })}>
                  <div className="legend-shape rounded-square" style={{ backgroundColor: '#d7b8e8', borderColor: '#7d3c98' }}></div>
                  <span>Executive Agency</span>
                </div>
              </div>

              <div className="legend-section legend-section-two-col">
                <h4>Public Bodies</h4>
                {/* Row 1 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'executive-ndpb' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'executive-ndpb' })}>
                  <div className="legend-shape diamond"><div className="diamond-inner" style={{ backgroundColor: '#a9d8ab', borderColor: '#229954' }}></div></div>
                  <span>Executive NDPB</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'public-corporation' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'public-corporation' })}>
                  <svg className="legend-shape" width="18" height="14" viewBox="0 0 18 14"><polygon points="3,13 18,13 15,1 0,1" fill="#fad7a0" stroke="#e67e22" strokeWidth="1.5"/></svg>
                  <span>Public Corporation</span>
                </div>
                {/* Row 2 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'advisory-ndpb' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'advisory-ndpb' })}>
                  <div className="legend-shape diamond"><div className="diamond-inner" style={{ backgroundColor: '#fef5d4', borderColor: '#f1c40f' }}></div></div>
                  <span>Advisory NDPB</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'royal-charter-body' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'royal-charter-body' })}>
                  <svg className="legend-shape" width="18" height="14" viewBox="0 0 18 14"><polygon points="3,13 18,13 15,1 0,1" fill="#d7b8e8" stroke="#8e44ad" strokeWidth="1.5"/></svg>
                  <span>Royal Charter Body</span>
                </div>
                {/* Row 3 */}
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'tribunal' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'tribunal' })}>
                  <div className="legend-shape diamond"><div className="diamond-inner" style={{ backgroundColor: '#f5cba7', borderColor: '#d35400' }}></div></div>
                  <span>Tribunal</span>
                </div>
                <div className="legend-item" onClick={() => setSelectedCategory({ category: 'body', subtype: 'other' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'body', subtype: 'other' })}>
                  <svg className="legend-shape" width="18" height="14" viewBox="0 0 18 14"><polygon points="3,13 18,13 15,1 0,1" fill="#dae0e0" stroke="#7f8c8d" strokeWidth="1.5"/></svg>
                  <span>Other Body</span>
                </div>
              </div>

              {viewMode === 'focus' && (
                <div className="legend-section">
                  <h4>Groups</h4>
                  <div className="legend-item" onClick={() => setSelectedCategory({ category: 'group', subtype: 'cabinet' })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory({ category: 'group', subtype: 'cabinet' })}>
                    <div className="legend-shape square" style={{ backgroundColor: '#e8a09a', borderColor: '#922b21' }}></div>
                    <span>Cabinet</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {searchOpen && (
          <>
            {paneResizer('search', 'left', 4, 'search pane')}
            <aside className="details-panel search-panel" style={paneStyle('search')}>
              <SearchPane
                onSelectElement={selectElement}
                onClose={() => { setSearchOpen(false); setSearchHighlightIds(null) }}
                onResultsChange={setSearchHighlightIds}
              />
            </aside>
          </>
        )}

        {infoOpen && (
          <>
            {paneResizer('info', 'left', 5, 'help pane')}
            <aside className="details-panel info-panel" style={paneStyle('info')}>
              <InfoPane onClose={() => setInfoOpen(false)} />
            </aside>
          </>
        )}

        {categoriesOpen && (
          <>
            {paneResizer('categories', 'left', 4, 'categories pane')}
            <aside className="details-panel search-panel" style={paneStyle('categories')}>
              <CategoriesPane
                onOpenCategory={(category, subtype) => {
                  setSelectedCategory({ category, subtype })
                  setCategoriesOpen(false)
                }}
                onOpenTag={(tagId) => {
                  setSelectedTagId(tagId)
                  setCategoriesOpen(false)
                }}
                onClose={() => setCategoriesOpen(false)}
                isMobile={isMobile}
              />
            </aside>
          </>
        )}
      </div>

      {/* Mobile bottom sheet — rendered outside app-container to avoid overflow:hidden clipping */}
      {isMobile && selectedElementId && (
        <>
          {sheetState !== 'closed' && (
            <div
              className="bottom-sheet-backdrop"
              onClick={closeElementPane}
              aria-hidden="true"
            />
          )}
          <div
            className="bottom-sheet"
            data-state={sheetState}
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Element details"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              className="bottom-sheet-handle"
              onClick={() => {
                if (sheetState === 'closed') setSheetState('partial')
                else if (sheetState === 'partial') setSheetState('full')
              }}
              aria-label={sheetState === 'partial' ? 'Expand panel' : 'Collapse panel'}
              role="button"
              tabIndex={0}
            />
            <div className="bottom-sheet-content">
              <ElementDetails
                elementId={selectedElementId}
                onSelectElement={(id) => selectElement(id, true)}
                onClose={closeElementPane}
                onOpenCategory={(category, subtype) => setSelectedCategory({ category, subtype })}
                onOpenTag={(tagId) => setSelectedTagId(tagId)}
                isMobile={isMobile}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile selection chip — shown when an element is previewed/selected and sheet is closed */}
      {isMobile && previewedElementId && sheetState === 'closed' && govElements[previewedElementId] && (() => {
        const el = govElements[previewedElementId]
        const subtitle = el.role ?? el.subtype.split('-').map((w: string) => w.toUpperCase() === 'NDPB' ? 'NDPB' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        const isSelected = previewedElementId === selectedElementId
        return (
          <div className={`mobile-selection-chip${darkMode ? ' mobile-selection-chip-dark' : ''}`}>
            <div className="mobile-selection-chip-text">
              <span className="mobile-selection-chip-name">{el.name}</span>
              <span className="mobile-selection-chip-sub">
                <SubtypeShape category={el.category} subtype={el.subtype} />
                {subtitle}
              </span>
            </div>
            {isSelected ? (
              <button
                className="mobile-selection-chip-btn"
                onClick={() => { closeOtherMobilePanes(); setElementPaneVisible(true); setSheetState('full') }}
                aria-label="View details"
              >
                Details →
              </button>
            ) : (
              <button
                className="mobile-selection-chip-btn"
                onClick={() => { closeOtherMobilePanes(); setSelectedElementId(previewedElementId); setElementPaneVisible(true); setSheetState('full') }}
                aria-label="Select element"
              >
                Select
              </button>
            )}
          </div>
        )
      })()}

      {/* Mobile bottom nav bar */}
      {isMobile && (
        <nav className="mobile-bottom-nav" aria-label="Main navigation">
          {selectedElementId && (
            <button
              className={`mobile-nav-tab${elementPaneVisible && sheetState !== 'closed' ? ' mobile-nav-tab-active' : ''}`}
              onClick={() => {
                if (sheetState === 'closed') {
                  closeOtherMobilePanes()
                  setElementPaneVisible(true)
                  setSheetState('partial')
                } else {
                  closeElementPane()
                }
              }}
              aria-label="Selected element"
            >
              <span className="mobile-nav-icon">📋</span>
              <span className="mobile-nav-label">Details</span>
            </button>
          )}
          <button
            className={`mobile-nav-tab${searchOpen ? ' mobile-nav-tab-active' : ''}`}
            onClick={() => { setSearchOpen(o => !o); setInfoOpen(false); setCategoriesOpen(false); closeElementPane() }}
            aria-label="Search"
          >
            <span className="mobile-nav-icon">🔍</span>
            <span className="mobile-nav-label">Search</span>
          </button>
          <button
            className={`mobile-nav-tab${categoriesOpen ? ' mobile-nav-tab-active' : ''}`}
            onClick={() => { setCategoriesOpen(o => !o); setSearchOpen(false); setInfoOpen(false); closeElementPane() }}
            aria-label="Categories"
          >
            <span className="mobile-nav-icon">🗂️</span>
            <span className="mobile-nav-label">Categories</span>
          </button>
          <button
            className={`mobile-nav-tab${infoOpen ? ' mobile-nav-tab-active' : ''}`}
            onClick={() => { setInfoOpen(o => !o); setSearchOpen(false); setCategoriesOpen(false); closeElementPane() }}
            aria-label="Help"
          >
            <span className="mobile-nav-icon">❓</span>
            <span className="mobile-nav-label">Help</span>
          </button>
        </nav>
      )}
    </div>
  )
}

export default App
