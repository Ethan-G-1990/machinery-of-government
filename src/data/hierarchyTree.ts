// Builds the Hierarchy canvas from published senior organograms.
// SCS1–SCS4 posts come from organogramProfiles. Job/team function, where
// senior-organogram-posts.json has one, is joined by department id + post ref.
// The chart root is the senior post in the organogram, not the elements.ts
// office-holder. A published post is drawn once. People who report to the root
// stay under that post.

import postsExport from '../../senior-organogram-posts.json'
import { govElements, getConnectedElements, type GovElement } from './elements'
import { organogramProfiles, type OrgPost } from './organograms'

const SHOWN_GRADES = new Set(['SCS1', 'SCS2', 'SCS3', 'SCS4'])

const SENIORITY_BY_GRADE: Record<string, string> = {
  SCS4: 'Permanent Secretary',
  SCS3: 'Director General',
  SCS2: 'Director',
  SCS1: 'Deputy Director',
}

const HEAD_TITLE = /permanent secretary|perm sec|\bPUS\b|chief executive|director of public prosecutions|national statistician/i

const CHIEF_BY_DEPARTMENT: Record<string, string> = {
  cps: 'cps-dpp',
  hmland: 'hmland-ceo',
  hmrc: 'hmrc-ceo',
  orr: 'orr-ceo',
  uksa: 'uksa-head',
}

export interface HierarchyNode {
  ref: string
  name: string
  title: string
  unit: string
  grade: string
  seniority: string
  jobFunction?: string
  nameRedacted: boolean
  titleRedacted: boolean
  isHead?: boolean
  children: HierarchyNode[]
}

export interface HierarchyModel {
  kind: 'prompt' | 'no-profile' | 'no-head' | 'no-posts' | 'ready'
  departmentId?: string
  departmentName?: string
  asAt?: string
  sourceUrl?: string
  limitationFlag?: string
  tree?: HierarchyNode
  initiallyCollapsed: string[]
  ministers: GovElement[]
}

type ExportPost = { id?: string; jobFunction?: string }

const jobById = new Map<string, string>()
for (const post of ((postsExport as { posts?: ExportPost[] }).posts ?? [])) {
  const fn = post.jobFunction?.trim()
  if (post.id && fn) jobById.set(post.id, fn)
}

function lookupJobFunction(departmentId: string, ref: string): string | undefined {
  return jobById.get(`${departmentId}-${ref}`)
}

export function gradeRank(grade: string): number {
  if (grade === 'SCS1') return 1
  if (grade === 'SCS2') return 2
  if (grade === 'SCS3') return 3
  if (grade === 'SCS4') return 4
  return 0
}

function isRedacted(value: string): boolean {
  const trimmed = value.trim()
  return trimmed === '' || trimmed === 'REDACTED' || trimmed === 'N/D'
}

function displayField(value: string): { text: string; redacted: boolean } {
  if (isRedacted(value)) return { text: 'REDACTED', redacted: true }
  return { text: value.trim(), redacted: false }
}

function headElement(departmentId: string): GovElement | null {
  const perm = govElements[`${departmentId}-perm-sec`]
  if (perm) return perm
  const chiefId = CHIEF_BY_DEPARTMENT[departmentId]
  return chiefId ? govElements[chiefId] ?? null : null
}

export interface HierarchyDepartmentChoice {
  id: string
  name: string
  holder: string | null
}

export function listHierarchyDepartments(): HierarchyDepartmentChoice[] {
  const choices: HierarchyDepartmentChoice[] = []
  for (const id of Object.keys(organogramProfiles)) {
    const department = govElements[id]
    if (!department) continue
    const profile = organogramProfiles[id]
    const byRef = new Map<string, OrgPost>()
    for (const post of profile?.posts ?? []) {
      if (!byRef.has(post.ref)) byRef.set(post.ref, post)
    }
    const published = selectHeadPost(profile?.posts ?? [], byRef)
    const publishedName = published ? displayField(published.name) : null
    const head = headElement(id)
    const holder = publishedName && !publishedName.redacted
      ? publishedName.text
      : head ? (head.currentHolder?.trim() || head.name) : null
    choices.push({ id, name: department.name, holder })
  }
  choices.sort((a, b) => a.name.localeCompare(b.name, 'en-GB'))
  return choices
}

function isTopLevel(post: OrgPost, byRef: Map<string, OrgPost>): boolean {
  return !post.reportsTo || !byRef.has(post.reportsTo)
}

function selectHeadPost(posts: OrgPost[], byRef: Map<string, OrgPost>): OrgPost | null {
  const tops = posts.filter(post => SHOWN_GRADES.has(post.grade) && isTopLevel(post, byRef))
  if (tops.length === 0) return null
  const bestRank = Math.max(...tops.map(post => gradeRank(post.grade)))
  const best = tops.filter(post => gradeRank(post.grade) === bestRank)
  const primary = best.filter(post => HEAD_TITLE.test(post.title) && !/\b(second|interim)\b/i.test(post.title))
  const titled = best.filter(post => HEAD_TITLE.test(post.title))
  const pool = primary.length > 0 ? primary : titled.length > 0 ? titled : best
  return [...pool].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'))[0]
}

function comparePosts(a: OrgPost, b: OrgPost): number {
  const gradeDelta = gradeRank(b.grade) - gradeRank(a.grade)
  if (gradeDelta !== 0) return gradeDelta
  const aRedacted = isRedacted(a.name)
  const bRedacted = isRedacted(b.name)
  if (aRedacted !== bRedacted) return aRedacted ? 1 : -1
  return a.name.localeCompare(b.name)
}

function politicalMinisters(department: GovElement): GovElement[] {
  const connected = getConnectedElements(department.id)
  const isMinister = (el: GovElement) =>
    el.category === 'official' &&
    (el.subtype === 'cabinet-minister' || el.subtype === 'junior-minister')
  const seen = new Set<string>()
  const ministers: GovElement[] = []
  const ordered = [...connected.parents, ...connected.secondaryParents]
    .filter(isMinister)
    .sort((a, b) => {
      if (a.subtype === b.subtype) return 0
      return a.subtype === 'cabinet-minister' ? -1 : 1
    })
  for (const minister of ordered) {
    if (seen.has(minister.id)) continue
    seen.add(minister.id)
    ministers.push(minister)
  }
  return ministers
}

function departmentForSelection(selectedId: string): GovElement | null {
  const selected = govElements[selectedId]
  if (!selected) return null
  if (selected.category === 'department') return selected
  if (selected.category !== 'official') return null
  const headed = Object.keys(organogramProfiles)
    .map(id => govElements[id])
    .filter((el): el is GovElement => !!el && headElement(el.id)?.id === selectedId)
  return headed[0] ?? null
}

function buildTree(department: GovElement): HierarchyNode | null {
  const profile = organogramProfiles[department.id]
  const posts = profile?.posts ?? []
  const byRef = new Map<string, OrgPost>()
  for (const post of posts) {
    if (!byRef.has(post.ref)) byRef.set(post.ref, post)
  }
  const headPost = selectHeadPost(posts, byRef)
  if (!headPost) return null
  const headRef = headPost.ref

  const shownOnce: OrgPost[] = []
  const shownRefs = new Set<string>()
  for (const post of posts) {
    if (!SHOWN_GRADES.has(post.grade) || shownRefs.has(post.ref) || post.ref === headRef) continue
    shownRefs.add(post.ref)
    shownOnce.push(post)
  }

  function visibleParent(ref: string): string | null {
    const seen = new Set<string>()
    let current = byRef.get(ref)?.reportsTo ?? ''
    while (current && !seen.has(current)) {
      if (current === headRef) return null
      if (shownRefs.has(current)) return current
      seen.add(current)
      const parent = byRef.get(current)
      if (!parent) return null
      current = parent.reportsTo
    }
    return null
  }

  const childrenOf = new Map<string, OrgPost[]>()
  const roots: OrgPost[] = []
  for (const post of shownOnce) {
    const parent = visibleParent(post.ref)
    if (!parent) roots.push(post)
    else {
      const list = childrenOf.get(parent) ?? []
      list.push(post)
      childrenOf.set(parent, list)
    }
  }

  const toNode = (post: OrgPost, ancestors: Set<string>): HierarchyNode => {
    const name = displayField(post.name)
    const title = displayField(post.title)
    const unit = post.unit.trim()
    const kids = ancestors.has(post.ref) ? [] : (childrenOf.get(post.ref) ?? [])
    const nextAncestors = new Set(ancestors)
    nextAncestors.add(post.ref)
    return {
      ref: post.ref,
      name: name.text,
      title: title.text,
      unit: unit || 'Unit not published',
      grade: post.grade,
      seniority: SENIORITY_BY_GRADE[post.grade] ?? post.grade,
      jobFunction: lookupJobFunction(department.id, post.ref),
      nameRedacted: name.redacted,
      titleRedacted: title.redacted,
      children: [...kids].sort(comparePosts).map(child => toNode(child, nextAncestors)),
    }
  }

  const name = displayField(headPost.name)
  const title = displayField(headPost.title)
  return {
    ref: headPost.ref,
    name: name.text,
    title: title.text,
    unit: headPost.unit.trim() || department.name,
    grade: headPost.grade,
    seniority: SENIORITY_BY_GRADE[headPost.grade] ?? headPost.grade,
    jobFunction: lookupJobFunction(department.id, headPost.ref),
    nameRedacted: name.redacted,
    titleRedacted: title.redacted,
    isHead: true,
    children: roots.sort(comparePosts).map(post => toNode(post, new Set())),
  }
}

function collectInitialCollapsed(node: HierarchyNode, into: string[]) {
  const best = node.children.reduce((max, child) => Math.max(max, gradeRank(child.grade)), 0)
  if (node.children.length > 0 && best <= 1) into.push(node.ref)
  for (const child of node.children) collectInitialCollapsed(child, into)
}

export function resolveHierarchy(selectedId: string | null): HierarchyModel {
  const empty: HierarchyModel = { kind: 'prompt', initiallyCollapsed: [], ministers: [] }
  if (!selectedId) return empty

  const department = departmentForSelection(selectedId)
  if (!department) return empty

  const ministers = politicalMinisters(department)
  const profile = organogramProfiles[department.id]
  if (!profile) {
    return {
      kind: 'no-profile',
      departmentId: department.id,
      departmentName: department.name,
      initiallyCollapsed: [],
      ministers,
    }
  }

  const attribution = {
    departmentId: department.id,
    departmentName: department.name,
    asAt: profile.asAt,
    sourceUrl: profile.sourceUrl,
    limitationFlag: profile.limitationFlag,
    ministers,
  }

  const tree = buildTree(department)
  if (!tree) {
    return { kind: 'no-head', ...attribution, initiallyCollapsed: [] }
  }
  if (tree.children.length === 0) {
    return { kind: 'no-posts', ...attribution, tree, initiallyCollapsed: [] }
  }

  const initiallyCollapsed: string[] = []
  collectInitialCollapsed(tree, initiallyCollapsed)
  return { kind: 'ready', ...attribution, tree, initiallyCollapsed }
}

export function formatSnapshotDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`
}
