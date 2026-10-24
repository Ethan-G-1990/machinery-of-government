import { useMemo, useState } from 'react'
import type { OrgPost, OrgProfile } from '../data/organograms'
import './OrgTab.css'

interface OrgTabProps {
  orgProfile: OrgProfile
}

interface TreeNode {
  post: OrgPost
  children: TreeNode[]
  depth: number
}

const GRADE_COLOURS: Record<string, string> = {
  SCS4: '#922b21',
  SCS3: '#1a5276',
  SCS2: '#1e8449',
  SCS1: '#7d6608',
}

const GRADE_LABELS: Record<string, string> = {
  SCS4: 'SCS4',
  SCS3: 'SCS3',
  SCS2: 'SCS2',
  SCS1: 'SCS1',
}

function buildTree(posts: OrgPost[]): TreeNode[] {
  const byRef = new Map<string, OrgPost>()
  for (const p of posts) byRef.set(p.ref, p)

  const childrenOf = new Map<string, OrgPost[]>()
  const roots: OrgPost[] = []

  for (const p of posts) {
    if (!p.reportsTo || !byRef.has(p.reportsTo)) {
      roots.push(p)
    } else {
      const list = childrenOf.get(p.reportsTo) ?? []
      list.push(p)
      childrenOf.set(p.reportsTo, list)
    }
  }

  // Sort children: by grade desc (SCS4 first), then by name
  const gradeOrder: Record<string, number> = { SCS4: 0, SCS3: 1, SCS2: 2, SCS1: 3 }
  const sortPosts = (arr: OrgPost[]) =>
    [...arr].sort((a, b) => {
      const gd = (gradeOrder[a.grade] ?? 9) - (gradeOrder[b.grade] ?? 9)
      if (gd !== 0) return gd
      if (a.name === 'REDACTED' && b.name !== 'REDACTED') return 1
      if (b.name === 'REDACTED' && a.name !== 'REDACTED') return -1
      return a.name.localeCompare(b.name)
    })

  const buildNode = (post: OrgPost, depth: number): TreeNode => ({
    post,
    depth,
    children: sortPosts(childrenOf.get(post.ref) ?? []).map(c => buildNode(c, depth + 1)),
  })

  return sortPosts(roots).map(r => buildNode(r, 0))
}

// Collect refs of all nodes that have children (to decide whether to show expand toggle)
function hasChildren(node: TreeNode): boolean {
  return node.children.length > 0
}

// Collect initial collapsed set: collapse all SCS2 and SCS1 nodes (show only SCS4/SCS3 by default)
function getInitialCollapsed(nodes: TreeNode[]): Set<string> {
  const collapsed = new Set<string>()
  const visit = (node: TreeNode) => {
    // Collapse nodes whose children are all SCS1/SCS2
    if (node.children.length > 0) {
      const maxChildGrade = node.children.reduce((min, c) => {
        const gn: Record<string, number> = { SCS4: 0, SCS3: 1, SCS2: 2, SCS1: 3 }
        return Math.min(min, gn[c.post.grade] ?? 9)
      }, 9)
      // Collapse if best child grade is SCS2 or below
      if (maxChildGrade >= 2) {
        collapsed.add(node.post.ref)
      }
    }
    for (const child of node.children) visit(child)
  }
  for (const node of nodes) visit(node)
  return collapsed
}

function isRedacted(value: string) {
  return value === 'REDACTED' || value === 'N/D'
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`
}

interface NodeProps {
  node: TreeNode
  collapsed: Set<string>
  onToggle: (ref: string) => void
  parentUnit: string
}

function OrgNode({ node, collapsed, onToggle, parentUnit }: NodeProps) {
  const { post, children } = node
  const isCollapsed = collapsed.has(post.ref)
  const showToggle = hasChildren(node)
  const colour = GRADE_COLOURS[post.grade] ?? '#555'
  const nameRedacted = isRedacted(post.name)
  const titleRedacted = isRedacted(post.title)
  const showUnit = post.unit && post.unit !== parentUnit

  return (
    <li className="org-node">
      <div
        className={`org-post${showToggle ? ' org-post-expandable' : ''}`}
        onClick={() => showToggle && onToggle(post.ref)}
        role={showToggle ? 'button' : undefined}
        aria-expanded={showToggle ? !isCollapsed : undefined}
        tabIndex={showToggle ? 0 : undefined}
        onKeyDown={showToggle ? (e) => e.key === 'Enter' && onToggle(post.ref) : undefined}
      >
        <div className="org-post-left">
          {showToggle && (
            <span className={`org-toggle${isCollapsed ? ' org-toggle-collapsed' : ''}`} aria-hidden="true">
              ▾
            </span>
          )}
          {!showToggle && <span className="org-toggle-spacer" aria-hidden="true" />}
          <span
            className="org-grade-badge"
            style={{ '--grade-colour': colour } as React.CSSProperties}
          >
            {GRADE_LABELS[post.grade] ?? post.grade}
          </span>
        </div>

        <div className="org-post-body">
          <span className={`org-name${nameRedacted ? ' org-name-redacted' : ''}`}>
            {nameRedacted ? 'Redacted' : post.name}
          </span>
          {!titleRedacted && (
            <span className="org-title">{post.title}</span>
          )}
          {showUnit && (
            <span className="org-unit">{post.unit}</span>
          )}
        </div>

        {showToggle && (
          <span className="org-child-count" aria-hidden="true">
            {children.length}
          </span>
        )}
      </div>

      {showToggle && !isCollapsed && children.length > 0 && (
        <ul className="org-children">
          {children.map(child => (
            <OrgNode
              key={child.post.ref}
              node={child}
              collapsed={collapsed}
              onToggle={onToggle}
              parentUnit={post.unit}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function OrgTab({ orgProfile }: OrgTabProps) {
  const tree = useMemo(() => buildTree(orgProfile.posts), [orgProfile.posts])
  const [collapsed, setCollapsed] = useState<Set<string>>(() => getInitialCollapsed(tree))

  const toggle = (ref: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(ref) ? next.delete(ref) : next.add(ref)
      return next
    })
  }

  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => setCollapsed(getInitialCollapsed(tree))

  if (orgProfile.posts.length === 0) {
    return (
      <div className="tab-empty">
        <p>No organogram data available for this organisation.</p>
      </div>
    )
  }

  return (
    <div className="org-tab">
      <div className="org-controls">
        <button className="org-control-btn" onClick={expandAll}>Expand all</button>
        <button className="org-control-btn" onClick={collapseAll}>Collapse</button>
      </div>

      <ul className="org-tree">
        {tree.map(node => (
          <OrgNode
            key={node.post.ref}
            node={node}
            collapsed={collapsed}
            onToggle={toggle}
            parentUnit=""
          />
        ))}
      </ul>

      <div className="org-footer">
        {orgProfile.limitationFlag && (
          <p className="org-limitation">{orgProfile.limitationFlag}</p>
        )}
        <a
          href={orgProfile.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          Senior organogram data ↗
        </a>
        <span className="org-footer-date">
          As at {formatDate(orgProfile.asAt)}
        </span>
      </div>
    </div>
  )
}
