import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type KeyboardEvent } from 'react'
import type { GovElement } from '../data/elements'
import {
  formatSnapshotDate,
  gradeRank,
  resolveHierarchy,
  type HierarchyModel,
  type HierarchyNode,
} from '../data/hierarchyTree'
import './HierarchyView.css'

interface HierarchyViewProps {
  selectedElementId: string | null
}

type GradeFilter = 'all' | 'SCS3' | 'SCS2' | 'SCS1'

interface NodeEntry {
  kind: 'node'
  ref: string
  node: HierarchyNode
}

interface MoreEntry {
  kind: 'more'
  ref: string
  nodes: HierarchyNode[]
}

type Entry = NodeEntry | MoreEntry

const FILTERS: { id: GradeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'SCS3', label: 'SCS3' },
  { id: 'SCS2', label: 'SCS2' },
  { id: 'SCS1', label: 'SCS1' },
]

const GRADE_COLOURS: Record<string, string> = {
  'Permanent Secretary': '#003366',
  'Chief Executive': '#003366',
  'Director of Public Prosecutions': '#003366',
  'National Statistician': '#003366',
  SCS3: '#1a5276',
  SCS2: '#1e8449',
  SCS1: '#7d6608',
}

const OGL_URL = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'

function floorOf(filter: GradeFilter): number {
  if (filter === 'SCS3') return 3
  if (filter === 'SCS2') return 2
  return 1
}

function visibleChildren(node: HierarchyNode, filter: GradeFilter): HierarchyNode[] {
  const floor = floorOf(filter)
  return node.children.filter(child => gradeRank(child.grade) >= floor)
}

function childEntries(node: HierarchyNode, filter: GradeFilter): Entry[] {
  const kids = visibleChildren(node, filter)
  if (!node.isHead || kids.length === 0) {
    return kids.map(child => ({ kind: 'node', ref: child.ref, node: child }))
  }
  const top = Math.max(...kids.map(child => gradeRank(child.grade)))
  const primary = kids.filter(child => gradeRank(child.grade) === top)
  const rest = kids.filter(child => gradeRank(child.grade) < top)
  const entries: Entry[] = primary.map(child => ({ kind: 'node', ref: child.ref, node: child }))
  if (rest.length > 0) entries.push({ kind: 'more', ref: `more:${node.ref}`, nodes: rest })
  return entries
}

function entryChildren(entry: Entry, filter: GradeFilter): Entry[] {
  if (entry.kind === 'more') {
    return entry.nodes.map(node => ({ kind: 'node' as const, ref: node.ref, node }))
  }
  return childEntries(entry.node, filter)
}

function attrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function findNode(node: HierarchyNode, ref: string): HierarchyNode | null {
  if (node.ref === ref) return node
  for (const child of node.children) {
    const found = findNode(child, ref)
    if (found) return found
  }
  return null
}

function parentOf(node: HierarchyNode, ref: string): HierarchyNode | null {
  if (ref === `more:${node.ref}`) return node
  for (const child of node.children) {
    if (child.ref === ref) return node
    const found = parentOf(child, ref)
    if (found) return found
  }
  return null
}

function ancestorRefs(node: HierarchyNode, ref: string, path: string[] = []): string[] | null {
  const next = [...path, node.ref]
  if (node.ref === ref) return next
  for (const child of node.children) {
    const found = ancestorRefs(child, ref, next)
    if (found) return found
  }
  return null
}

function pathToOpen(tree: HierarchyNode, ref: string, filter: GradeFilter): string[] {
  const path = ancestorRefs(tree, ref) ?? [tree.ref]
  const open = new Set(path)
  const headKids = visibleChildren(tree, filter)
  if (headKids.length > 0) {
    const top = Math.max(...headKids.map(child => gradeRank(child.grade)))
    for (const id of path) {
      const node = findNode(tree, id)
      if (!node || node.ref === tree.ref) continue
      if (tree.children.some(child => child.ref === id) && gradeRank(node.grade) < top) {
        open.add(`more:${tree.ref}`)
      }
    }
  }
  return [...open]
}

function dropNode(expanded: Set<string>, node: HierarchyNode) {
  expanded.delete(node.ref)
  expanded.delete(`more:${node.ref}`)
  for (const child of node.children) dropNode(expanded, child)
}

function dropMore(expanded: Set<string>, parent: HierarchyNode, filter: GradeFilter) {
  expanded.delete(`more:${parent.ref}`)
  const kids = visibleChildren(parent, filter)
  if (kids.length === 0) return
  const top = Math.max(...kids.map(child => gradeRank(child.grade)))
  for (const child of kids) {
    if (gradeRank(child.grade) < top) dropNode(expanded, child)
  }
}

function closeSiblings(expanded: Set<string>, parent: HierarchyNode, except: string, filter: GradeFilter) {
  if (`more:${parent.ref}` !== except) dropMore(expanded, parent, filter)
  for (const child of parent.children) {
    if (child.ref !== except) dropNode(expanded, child)
  }
}

function centerOnHead(scroller: HTMLElement) {
  const card = scroller.querySelector<HTMLElement>('.hierarchy-card-head')
  if (!card) return
  const scrollerRect = scroller.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const delta = (cardRect.left + cardRect.width / 2) - (scrollerRect.left + scrollerRect.width / 2)
  scroller.scrollLeft += delta
  scroller.scrollTop = 0
}

// Child rows sit outside the sibling row, centred on the clicked card, so a
// wide lower level cannot push the cards above it apart.
function layoutLevel(level: HTMLElement) {
  const row = level.querySelector<HTMLElement>(':scope > .hierarchy-row')
  if (!row) return
  const belows = [...level.querySelectorAll<HTMLElement>(':scope > .hierarchy-below')]
  row.style.marginLeft = '0px'
  level.style.minWidth = ''
  for (const below of belows) below.style.marginLeft = '0px'
  if (belows.length === 0) return

  const rowRect = row.getBoundingClientRect()
  for (const below of belows) {
    const forRef = below.dataset.for
    if (!forRef) continue
    const card = row.querySelector<HTMLElement>(`[data-ref="${attrValue(forRef)}"]`)
    const childRow = below.querySelector<HTMLElement>(':scope > .hierarchy-level > .hierarchy-row')
    if (!card || !childRow) continue
    const cardRect = card.getBoundingClientRect()
    const childRect = childRow.getBoundingClientRect()
    const belowRect = below.getBoundingClientRect()
    const cardCenter = cardRect.left + cardRect.width / 2 - rowRect.left
    const childCenter = childRect.left + childRect.width / 2 - belowRect.left
    below.style.marginLeft = `${cardCenter - childCenter}px`
  }

  let right = rowRect.width
  const origin = row.getBoundingClientRect().left
  for (const below of belows) {
    const rect = below.getBoundingClientRect()
    right = Math.max(right, rect.right - origin)
    const forRef = below.dataset.for
    if (!forRef) continue
    const card = row.querySelector<HTMLElement>(`[data-ref="${attrValue(forRef)}"]`)
    if (!card) continue
    const cardRect = card.getBoundingClientRect()
    below.style.setProperty('--stem', `${cardRect.left + cardRect.width / 2 - rect.left - 0.75}px`)
  }
  if (right > rowRect.width + 1) level.style.minWidth = `${Math.ceil(right)}px`
}

function containChart(scroller: HTMLElement) {
  const shift = scroller.querySelector<HTMLElement>('.hierarchy-chart-shift')
  if (!shift) return
  const prev = parseFloat(shift.style.paddingLeft) || 0
  const scroll = scroller.scrollLeft
  shift.style.paddingLeft = '0px'
  const origin = shift.getBoundingClientRect().left
  let min = 0
  for (const node of shift.querySelectorAll<HTMLElement>('.hierarchy-row')) {
    const left = node.getBoundingClientRect().left - origin
    if (left < min) min = left
  }
  const pad = min < -0.5 ? Math.ceil(-min) : 0
  shift.style.paddingLeft = pad ? `${pad}px` : ''
  // Clearing the pad clamps scrollLeft. Put it back after the pad is restored.
  scroller.scrollLeft = scroll + (pad - prev)
}

function stopCardToggle(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation()
}

interface CardProps {
  node: HierarchyNode
  hasChildren: boolean
  open: boolean
  childCount: number
  clickable: boolean
  onActivate: () => void
}

function PostCard({ node, hasChildren, open, childCount, clickable, onActivate }: CardProps) {
  const colour = GRADE_COLOURS[node.grade] ?? '#003366'
  const activate = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('.hierarchy-function')) return
    onActivate()
  }
  return (
    <div
      className={[
        'hierarchy-card',
        node.isHead ? 'hierarchy-card-head' : '',
        clickable ? 'hierarchy-card-button' : '',
        open ? 'hierarchy-card-open' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--grade-colour': colour } as CSSProperties}
      role="treeitem"
      tabIndex={clickable || node.jobFunction ? 0 : undefined}
      aria-expanded={hasChildren ? open : undefined}
      onClick={clickable ? activate : undefined}
      onKeyDown={clickable ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onActivate()
        }
      } : undefined}
    >
      <div className="hierarchy-card-top">
        {hasChildren && (
          <span className={`hierarchy-chevron${open ? '' : ' hierarchy-chevron-collapsed'}`} aria-hidden="true">▾</span>
        )}
        <span className="hierarchy-grade">{node.grade}</span>
        {hasChildren && <span className="hierarchy-count">{childCount}</span>}
      </div>
      <span className={`hierarchy-name${node.nameRedacted ? ' hierarchy-redacted' : ''}`}>{node.name}</span>
      <span className={`hierarchy-title${node.titleRedacted ? ' hierarchy-redacted' : ''}`}>{node.title}</span>
      <span className="hierarchy-unit">{node.unit}</span>
      {node.jobFunction && (
        <span
          className="hierarchy-function"
          role="note"
          onClick={stopCardToggle}
          onMouseDown={stopCardToggle}
          onKeyDown={stopCardToggle}
        >
          {node.jobFunction}
        </span>
      )}
    </div>
  )
}

function moreGrade(nodes: HierarchyNode[]): { label: string; colour: string } {
  const grades = [...new Set(nodes.map(node => node.grade))]
  if (grades.length === 1) {
    const label = grades[0]
    return { label, colour: GRADE_COLOURS[label] ?? '#7d6608' }
  }
  const senior = [...nodes].sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade))[0]
  return { label: 'Posts', colour: GRADE_COLOURS[senior?.grade ?? ''] ?? '#003366' }
}

function MoreCard({ nodes, open, onActivate }: { nodes: HierarchyNode[]; open: boolean; onActivate: () => void }) {
  const grade = moreGrade(nodes)
  return (
    <div
      className={`hierarchy-card hierarchy-card-button hierarchy-scs1-card${open ? ' hierarchy-card-open' : ''}`}
      style={{ '--grade-colour': grade.colour } as CSSProperties}
      role="treeitem"
      tabIndex={0}
      aria-expanded={open}
      aria-label={open ? `Hide ${nodes.length} lower-grade posts` : `Show ${nodes.length} lower-grade posts`}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onActivate()
        }
      }}
    >
      <span className="hierarchy-card-top">
        <span className={`hierarchy-chevron${open ? '' : ' hierarchy-chevron-collapsed'}`} aria-hidden="true">▾</span>
        <span className="hierarchy-grade">{grade.label}</span>
        <span className="hierarchy-count">{nodes.length}</span>
      </span>
      <span className="hierarchy-scs1-label">{open ? 'Hide posts' : 'Show posts'}</span>
    </div>
  )
}

interface LevelProps {
  entries: Entry[]
  plain?: boolean
  filter: GradeFilter
  expanded: Set<string>
  onToggle: (ref: string) => void
}

function Level({ entries, plain, filter, expanded, onToggle }: LevelProps) {
  const levelRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (levelRef.current) layoutLevel(levelRef.current)
  })

  const rowClass = [
    'hierarchy-row',
    plain ? 'hierarchy-row-plain' : '',
    entries.length === 1 ? 'hierarchy-row-single' : '',
  ].filter(Boolean).join(' ')

  const openEntries = entries.filter(entry => expanded.has(entry.ref) && entryChildren(entry, filter).length > 0)

  return (
    <div className="hierarchy-level" ref={levelRef}>
      <div className={rowClass}>
        {entries.map(entry => {
          if (entry.kind === 'more') {
            return (
              <div key={entry.ref} className="hierarchy-slot" data-ref={entry.ref}>
                <MoreCard nodes={entry.nodes} open={expanded.has(entry.ref)} onActivate={() => onToggle(entry.ref)} />
              </div>
            )
          }
          const reports = visibleChildren(entry.node, filter)
          const nested = entryChildren(entry, filter)
          return (
            <div
              key={entry.ref}
              className={`hierarchy-slot${entry.node.isHead ? ' hierarchy-slot-head' : ''}`}
              data-ref={entry.ref}
            >
              <PostCard
                node={entry.node}
                hasChildren={nested.length > 0}
                open={expanded.has(entry.ref)}
                childCount={reports.length}
                clickable={nested.length > 0}
                onActivate={() => onToggle(entry.ref)}
              />
            </div>
          )
        })}
      </div>
      {openEntries.map(entry => (
        <div key={entry.ref} className="hierarchy-below" data-for={entry.ref}>
          <Level
            entries={entryChildren(entry, filter)}
            filter={filter}
            expanded={expanded}
            onToggle={onToggle}
          />
        </div>
      ))}
    </div>
  )
}

function WideBranch({
  node,
  filter,
  onOpen,
}: {
  node: HierarchyNode
  filter: GradeFilter
  onOpen: (ref: string) => void
}) {
  const kids = visibleChildren(node, filter)
  return (
    <li className="hierarchy-branch" data-ref={node.ref}>
      <PostCard
        node={node}
        hasChildren={kids.length > 0}
        open={kids.length > 0}
        childCount={kids.length}
        clickable
        onActivate={() => onOpen(node.ref)}
      />
      {kids.length > 0 && (
        <ul className="hierarchy-branches" role="group">
          {kids.map(child => (
            <WideBranch key={child.ref} node={child} filter={filter} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </li>
  )
}

function Ministers({ ministers }: { ministers: GovElement[] }) {
  if (ministers.length === 0) return null
  return (
    <div className="hierarchy-political">
      <p className="hierarchy-kicker">Ministers</p>
      <ul className="hierarchy-ministers">
        {ministers.map(minister => (
          <li
            key={minister.id}
            className={`hierarchy-minister${minister.subtype === 'cabinet-minister' ? ' hierarchy-minister-secretary' : ''}`}
          >
            <span className="hierarchy-minister-office">{minister.name}</span>
            {minister.currentHolder && (
              <span className="hierarchy-minister-holder">{minister.currentHolder}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function HierarchyTree({ model }: { model: HierarchyModel & { tree: HierarchyNode } }) {
  const tree = model.tree
  const scrollRef = useRef<HTMLDivElement>(null)
  const recenterRef = useRef(true)
  const pendingCenter = useRef(false)
  const openedRef = useRef<string | null>(null)
  const headAnchor = useRef<number | null>(null)
  const [filter, setFilter] = useState<GradeFilter>('all')
  const [expanded, setExpanded] = useState(() => new Set([tree.ref]))
  const [wide, setWide] = useState(false)

  if (recenterRef.current) headAnchor.current = null
  else if (scrollRef.current) {
    const head = scrollRef.current.querySelector<HTMLElement>('.hierarchy-card-head')
    headAnchor.current = head ? head.getBoundingClientRect().left : null
  }

  useLayoutEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    containChart(scroller)
    if (recenterRef.current) {
      pendingCenter.current = true
      recenterRef.current = false
      openedRef.current = null
    }
    if (pendingCenter.current) {
      centerOnHead(scroller)
      const frame = requestAnimationFrame(() => {
        if (scrollRef.current) centerOnHead(scrollRef.current)
        pendingCenter.current = false
      })
      return () => cancelAnimationFrame(frame)
    }
    const anchor = headAnchor.current
    const head = scroller.querySelector<HTMLElement>('.hierarchy-card-head')
    if (head && anchor != null) {
      scroller.scrollLeft += head.getBoundingClientRect().left - anchor
    }
    const opened = openedRef.current
    if (opened) {
      const card = scroller.querySelector<HTMLElement>(`[data-ref="${attrValue(opened)}"]`)
      card?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
      openedRef.current = null
    }
  })

  const chooseFilter = (next: GradeFilter) => {
    setFilter(next)
    setWide(false)
    setExpanded(new Set([tree.ref]))
    recenterRef.current = true
  }

  const expandAll = () => {
    setWide(true)
    recenterRef.current = true
  }

  const collapseAll = () => {
    setWide(false)
    setExpanded(new Set())
    recenterRef.current = true
  }

  const toggle = (ref: string) => {
    setWide(false)
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(ref)) {
        if (ref.startsWith('more:')) {
          const parent = findNode(tree, ref.slice('more:'.length))
          if (parent) dropMore(next, parent, filter)
          else next.delete(ref)
        } else {
          const node = findNode(tree, ref)
          if (node) dropNode(next, node)
          else next.delete(ref)
        }
        return next
      }
      const parent = parentOf(tree, ref)
      if (parent) closeSiblings(next, parent, ref, filter)
      next.add(ref)
      return next
    })
    openedRef.current = ref
  }

  const openPath = (ref: string) => {
    setWide(false)
    setExpanded(new Set(pathToOpen(tree, ref, filter)))
    openedRef.current = ref
  }

  const filteredRootEmpty = wide
    ? visibleChildren(tree, filter).length === 0
    : expanded.has(tree.ref) && childEntries(tree, filter).length === 0

  return (
    <>
      <div className="hierarchy-toolbar">
        <p className="hierarchy-dept">{model.departmentName}</p>
        <Ministers ministers={model.ministers} />
        {model.ministers.length === 0 && (
          <p className="hierarchy-non-ministerial">Non-ministerial department. The tree starts at the recorded civil service head.</p>
        )}
        <div className="hierarchy-controls">
          <div className="view-mode-group" role="group" aria-label="Grade filter">
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`view-toggle-btn${filter === item.id ? ' view-toggle-btn-active' : ''}`}
                aria-pressed={filter === item.id}
                onClick={() => chooseFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hierarchy-control-actions">
            <button type="button" className="view-toggle-btn" onClick={expandAll}>Expand all</button>
            <button type="button" className="view-toggle-btn" onClick={collapseAll}>Collapse all</button>
          </div>
        </div>
      </div>
      <div className="hierarchy-scroll" ref={scrollRef}>
        <div className={`hierarchy-chart${wide ? ' hierarchy-wide' : ''}`} role="tree" aria-label={`${model.departmentName} senior civil service`}>
          <div className="hierarchy-chart-shift">
            {wide ? (
              <ul className="hierarchy-branches hierarchy-branches-root">
                <WideBranch node={tree} filter={filter} onOpen={openPath} />
              </ul>
            ) : (
              <Level
                entries={[{ kind: 'node', ref: tree.ref, node: tree }]}
                plain
                filter={filter}
                expanded={expanded}
                onToggle={toggle}
              />
            )}
          </div>
        </div>
        {filteredRootEmpty && (
          <p className="hierarchy-filter-empty">
            No {filter === 'all' ? 'SCS1–SCS3' : filter} posts are published under this head.
          </p>
        )}
      </div>
    </>
  )
}

function Attribution({ model }: { model: HierarchyModel }) {
  return (
    <footer className="hierarchy-footer">
      {model.limitationFlag && <p className="hierarchy-limitation">{model.limitationFlag}</p>}
      {model.asAt && model.sourceUrl && (
        <p className="hierarchy-source-line">
          <a className="hierarchy-source" href={model.sourceUrl} target="_blank" rel="noopener noreferrer">
            Senior organogram data ↗
          </a>
          <span>As at {formatSnapshotDate(model.asAt)}</span>
        </p>
      )}
      <p className="hierarchy-ogl">
        Contains public sector information licensed under the{' '}
        <a href={OGL_URL} target="_blank" rel="noopener noreferrer">Open Government Licence v3.0</a>.
      </p>
    </footer>
  )
}

export default function HierarchyView({ selectedElementId }: HierarchyViewProps) {
  const model = useMemo(() => resolveHierarchy(selectedElementId), [selectedElementId])

  return (
    <div className="hierarchy-view">
      {model.kind === 'prompt' && (
        <div className="hierarchy-scroll">
          <div className="hierarchy-empty">
            <p className="hierarchy-empty-title">Select a ministerial department</p>
            <p>Its senior civil service is shown here, from the permanent secretary through SCS3, SCS2, and SCS1.</p>
          </div>
        </div>
      )}
      {model.kind === 'no-profile' && (
        <div className="hierarchy-scroll">
          <div className="hierarchy-empty">
            <p className="hierarchy-empty-title">{model.departmentName}</p>
            <p>No senior organogram has been published for this department in the app. The details panel still lists its ministers and parent bodies.</p>
          </div>
        </div>
      )}
      {model.kind === 'no-head' && (
        <div className="hierarchy-scroll">
          <div className="hierarchy-empty">
            <p className="hierarchy-empty-title">{model.departmentName}</p>
            <p>No permanent secretary is recorded for this department, so the senior posts are not attached to a second, invented head.</p>
          </div>
        </div>
      )}
      {model.kind === 'no-posts' && (
        <>
          <div className="hierarchy-toolbar">
            <p className="hierarchy-dept">{model.departmentName}</p>
            <Ministers ministers={model.ministers} />
          </div>
          <div className="hierarchy-scroll">
            <div className="hierarchy-empty">
              <p className="hierarchy-empty-title">No SCS1–SCS3 posts</p>
              <p>The published organogram for {model.departmentName} has no SCS1, SCS2, or SCS3 posts to show under the permanent secretary.</p>
            </div>
          </div>
        </>
      )}
      {model.kind === 'ready' && model.tree && (
        <HierarchyTree key={model.departmentId} model={{ ...model, tree: model.tree }} />
      )}
      <Attribution model={model} />
    </div>
  )
}
