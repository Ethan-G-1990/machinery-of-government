import { useMemo, useState, type CSSProperties } from 'react'
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

function seniorChildren(node: HierarchyNode, floor: number): HierarchyNode[] {
  return node.children.filter(child => {
    const rank = gradeRank(child.grade)
    return rank >= floor && rank > 1
  })
}

function scs1Children(node: HierarchyNode, floor: number): HierarchyNode[] {
  if (floor > 1) return []
  return node.children.filter(child => child.grade === 'SCS1')
}

function refsWithChildren(node: HierarchyNode, into: string[]) {
  if (node.children.length > 0) into.push(node.ref)
  for (const child of node.children) refsWithChildren(child, into)
}

interface NodeProps {
  node: HierarchyNode
  filter: GradeFilter
  collapsed: Set<string>
  scs1Open: Set<string>
  onToggle: (ref: string) => void
  onToggleScs1: (ref: string) => void
}

function HierarchyNodeView({ node, filter, collapsed, scs1Open, onToggle, onToggleScs1 }: NodeProps) {
  const floor = floorOf(filter)
  const senior = seniorChildren(node, floor)
  const juniors = scs1Children(node, floor)
  const isCollapsed = collapsed.has(node.ref)
  const hasChildren = senior.length + juniors.length > 0
  const showJuniors = !isCollapsed && juniors.length > 0 && (filter === 'SCS1' || scs1Open.has(node.ref) || senior.length === 0)
  const showJuniorGroup = !isCollapsed && juniors.length > 0 && senior.length > 0 && filter !== 'SCS1'
  const colour = GRADE_COLOURS[node.grade] ?? '#003366'
  const childCount = senior.length + juniors.length

  return (
    <li className="hierarchy-node" role="treeitem" aria-expanded={hasChildren ? !isCollapsed : undefined}>
      <div className={`hierarchy-post${node.isHead ? ' hierarchy-post-head' : ''}`}>
        {hasChildren ? (
          <button
            type="button"
            className="hierarchy-toggle"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? `Expand ${node.name}` : `Collapse ${node.name}`}
            onClick={() => onToggle(node.ref)}
          >
            <span className={`hierarchy-chevron${isCollapsed ? ' hierarchy-chevron-collapsed' : ''}`} aria-hidden="true">▾</span>
          </button>
        ) : (
          <span className="hierarchy-toggle-spacer" aria-hidden="true" />
        )}
        <div className="hierarchy-post-main" tabIndex={node.jobFunction ? 0 : undefined}>
          <div className="hierarchy-post-line">
            <span className="hierarchy-grade" style={{ '--grade-colour': colour } as CSSProperties}>
              {node.grade}
            </span>
            <span className={`hierarchy-name${node.nameRedacted ? ' hierarchy-redacted' : ''}`}>{node.name}</span>
            {hasChildren && <span className="hierarchy-count">{childCount}</span>}
          </div>
          <span className={`hierarchy-title${node.titleRedacted ? ' hierarchy-redacted' : ''}`}>{node.title}</span>
          <span className="hierarchy-unit">{node.unit}</span>
          {node.jobFunction && (
            <span className="hierarchy-function" role="note">{node.jobFunction}</span>
          )}
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <ul className="hierarchy-children" role="group">
          {senior.map(child => (
            <HierarchyNodeView
              key={child.ref}
              node={child}
              filter={filter}
              collapsed={collapsed}
              scs1Open={scs1Open}
              onToggle={onToggle}
              onToggleScs1={onToggleScs1}
            />
          ))}
          {showJuniorGroup && (
            <li className="hierarchy-node" role="treeitem" aria-expanded={showJuniors}>
              <button
                type="button"
                className="hierarchy-scs1-group"
                aria-expanded={showJuniors}
                onClick={() => onToggleScs1(node.ref)}
              >
                <span className={`hierarchy-chevron${showJuniors ? '' : ' hierarchy-chevron-collapsed'}`} aria-hidden="true">▾</span>
                <span className="hierarchy-grade" style={{ '--grade-colour': GRADE_COLOURS.SCS1 } as CSSProperties}>SCS1</span>
                <span className="hierarchy-scs1-label">{showJuniors ? 'Hide posts' : 'Show posts'}</span>
                <span className="hierarchy-count">{juniors.length}</span>
              </button>
              {showJuniors && (
                <ul className="hierarchy-children" role="group">
                  {juniors.map(child => (
                    <HierarchyNodeView
                      key={child.ref}
                      node={child}
                      filter={filter}
                      collapsed={collapsed}
                      scs1Open={scs1Open}
                      onToggle={onToggle}
                      onToggleScs1={onToggleScs1}
                    />
                  ))}
                </ul>
              )}
            </li>
          )}
          {!showJuniorGroup && showJuniors && juniors.map(child => (
            <HierarchyNodeView
              key={child.ref}
              node={child}
              filter={filter}
              collapsed={collapsed}
              scs1Open={scs1Open}
              onToggle={onToggle}
              onToggleScs1={onToggleScs1}
            />
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

function HierarchyTree({ model }: { model: HierarchyModel }) {
  const tree = model.tree
  const [filter, setFilter] = useState<GradeFilter>('all')
  const [collapsed, setCollapsed] = useState(() => new Set(model.initiallyCollapsed))
  const [scs1Open, setScs1Open] = useState<Set<string>>(() => new Set())

  if (!tree) return null

  const chooseFilter = (next: GradeFilter) => {
    setFilter(next)
    if (next === 'SCS1') {
      setCollapsed(new Set())
    } else if (next === 'all') {
      setCollapsed(new Set(model.initiallyCollapsed))
      setScs1Open(new Set())
    }
  }

  const expandAll = () => {
    const refs: string[] = []
    refsWithChildren(tree, refs)
    setCollapsed(new Set())
    setScs1Open(new Set(refs))
  }

  const collapseAll = () => {
    const refs: string[] = []
    refsWithChildren(tree, refs)
    setCollapsed(new Set(refs))
    setScs1Open(new Set())
  }

  const toggle = (ref: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(ref)) next.delete(ref)
      else next.add(ref)
      return next
    })
  }

  const toggleScs1 = (ref: string) => {
    setScs1Open(prev => {
      const next = new Set(prev)
      if (next.has(ref)) next.delete(ref)
      else next.add(ref)
      return next
    })
  }

  const filteredRootEmpty = seniorChildren(tree, floorOf(filter)).length === 0
    && scs1Children(tree, floorOf(filter)).length === 0

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
      <div className="hierarchy-scroll">
        <ul className="hierarchy-tree" role="tree" aria-label={`${model.departmentName} senior civil service`}>
          <HierarchyNodeView
            node={tree}
            filter={filter}
            collapsed={collapsed}
            scs1Open={scs1Open}
            onToggle={toggle}
            onToggleScs1={toggleScs1}
          />
        </ul>
        {filteredRootEmpty && !collapsed.has(tree.ref) && (
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
        <HierarchyTree key={model.departmentId} model={model} />
      )}
      <Attribution model={model} />
    </div>
  )
}
