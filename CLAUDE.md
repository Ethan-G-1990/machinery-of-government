# CLAUDE.md — Developer Reference

This file is for Claude Code. It captures project conventions, architecture, and recurring patterns to avoid re-deriving them each session.

---

## Project overview

A React + TypeScript + Vite single-page app for exploring the structure of UK central government. Deployed via Cloudflare Pages. Data is static — no backend.

---

## Tech stack

- **React 18** with functional components and hooks only
- **TypeScript** (strict mode)
- **Vite** for build (`npm run build`, `npm run dev`)
- **Cytoscape.js** for graph visualisations (`src/components/FullView.tsx`, `src/components/GravityView.tsx`)
- **cytoscape-cola** for force-directed layout (GravityView) — types declared in `src/cytoscape-cola.d.ts`
- **Recharts** for budget/staffing charts

---

## Key data files (`src/data/`)

| File | Purpose |
|------|---------|
| `elements.ts` | All ~500+ gov elements (departments, bodies, officials). Central source of truth. |
| `jurisdictions.ts` | `Jurisdiction` type, `jurisdictionInfo`, `JURISDICTION_COVERS`, `elementMatchesJurisdiction()` |
| `professions.ts` | `professionProfiles` — regulated professions per element (for professional regulators) |
| `powers.ts` | Powers/functions per element |
| `budgets.ts` + `budgets-oscar.json` | Budget data |
| `staffing.ts` | Headcount data |

### `elements.ts` structure

Each element has:
```ts
{
  id: string
  name: string
  category: 'official' | 'department' | 'body' | 'group'
  subtype: string          // e.g. 'ministerial', 'executive-ndpb', 'cabinet-minister'
  parentIds: string[]
  secondaryParentIds?: string[]
  jurisdictions?: Jurisdiction[]   // defaults to ['uk'] if absent
  tags?: string[]          // e.g. 'professional-regulator', 'statutory-regulator'
  role?: string            // human-readable role title
  description?: string
}
```

Categories and their Cytoscape shapes:
- `official` → ellipse (pm=heptagon, cabinet-minister=octagon)
- `department` → rectangle (agency/division-directorate=roundrectangle)
- `body` → diamond
- `group` → not rendered in FullView/GravityView (skipped with `el.category === 'group'`)

---

## Views (`src/App.tsx` → `viewMode`)

Three views cycling via a single toggle button (shows **current** view name):

| viewMode | Component | Description |
|----------|-----------|-------------|
| `'radial'` | `FullView` | Concentric rings, preset layout, ring rotation on selection |
| `'gravity'` | `GravityView` | cytoscape-cola force layout, hierarchical flow (y-axis) |
| `'focus'` | `OrgChart` | Traditional org chart (hierarchical tree) |

Toggle cycles: focus → radial → gravity → focus.

---

## Jurisdiction system

- `jurisdictions?: Jurisdiction[]` on each element (default = `['uk']` if absent)
- Filter stored in `App.tsx` as `jurisdictionFilter: Jurisdiction | null`
- `jurisdictionHighlightIds` is a **memoised** array of matching element IDs (important — must stay stable reference)
- When filter is active in FullView/GravityView: non-matching nodes are **physically removed** from the Cytoscape graph (not just faded), layout is recomputed
- `JURISDICTION_COVERS` encodes hierarchy: filtering for `england` also shows `uk`, `gb`, `england-wales` elements
- Filter menu: "Any / All UK" = null (default); indented by `(JURISDICTION_COVERS[j].length - 1) * 12` px

---

## FullView architecture (`src/components/FullView.tsx`)

- Nodes placed on concentric rings; ring assignment via `computeTiers(includedIds?)` + `buildPositions(tiers)`
- Module-level `tierMap`, `nodePositions`, `baseNodeAngles`, `ringData` for the full (unfiltered) graph
- When jurisdiction filter active: recomputes filtered versions, stores in `currentTierMapRef` / `currentRingDataRef` / `currentNodeAnglesRef`
- Ring rotation on selection: `rotateToSelection` → `computeRotatedPositions` → `animateRingRotation` (requestAnimationFrame arc interpolation)
- Node animation: **single-object form** `n.animate({ position, duration, easing } as any)` — two-argument form doesn't work reliably
- After `cy.add()` (re-adding removed nodes), always use `setTimeout(fn, 0)` before animating — Cytoscape needs a tick to register re-added nodes
- Two separate jurisdiction effects: (1) deselect effect `[jurisdictionIds, selectedElementId, onDeselect]`, (2) graph-restructure effect `[jurisdictionIds]` only — keeping them separate prevents spurious re-runs overwriting `removedElementsRef`

## GravityView architecture (`src/components/GravityView.tsx`)

- Same props as FullView; same node/edge building (no `position` property — Cola assigns positions)
- Cola layout: `infinite: false` (runs to convergence then stops), `flow: { axis: 'y', minSeparation: 60 }`
- Edge lengths weighted by tier difference: `80 + |srcTier - tgtTier| * 20`
- No ring rotation; `layoutRef` holds current Cola layout instance
- Jurisdiction filter: stop layout → restore removed nodes → remove non-matching → re-run Cola
- CSS class prefixes: `gv-previewed`, `gv-selected` (vs `fv-` in FullView)

---

## Component conventions

- Every component has a matching `.css` file; CSS class names prefixed with component slug (e.g. `full-view-`, `gravity-view-`, `jurisdiction-`)
- `darkMode` prop propagates top-down from App; dark variant via CSS class on wrapper (e.g. `full-view-dark`)
- Mobile detection: `window.matchMedia('(max-width: 768px) and (pointer: coarse)')` — touch devices only, not narrow desktop
- Memoisation: functions passed as props to Cytoscape views should be `useCallback`; arrays that are dependency-compared should be `useMemo`
- `applyHighlightFilter` + `highlightNode` are `useCallback` in both graph views — stable refs needed for Cytoscape event handlers

---

## Cross-cutting architecture

### Panels and header (`App.tsx` / `App.css`)

Five panels share a flex row via CSS `order`: `category-pane` (1, CategoryInfo/TagInfo), `element-pane` (2, ElementDetails), `chart-container` (3, chart + view toggle), `search-panel` (4, SearchPane), `info-panel` (5, InfoPane/CategoriesPane). The view toggle sits absolutely inside `.chart-container`, not inside any chart component. On desktop (>1024px) each side pane has a `PaneResizer` drag handle rendered as a flex sibling sharing the pane's `order` (after left panes, before right panes, since panes are scroll containers); widths live in `paneWidths` state (persisted to `localStorage` key `mog-pane-widths`) and apply via the `--pane-width` CSS variable. Double-click/Enter resets. Header buttons (Dark, Help, Categories, Search) are mutually exclusive. No Redux/React Query: state lives in `App.tsx` and component `useState`.

### Dark mode

`darkMode` boolean on `App`; `.app-dark` class on the root `.app` div defines `--dm-*` custom properties (`--dm-bg`, `--dm-bg-subtle`, `--dm-border`, `--dm-text`, `--dm-link`, …). Pane dark overrides are written centrally in `App.css` under `.app-dark .classname` — don't scatter them in component CSS. Chart components take a `darkMode` prop for the Cytoscape stylesheet. Focus-view (OrgChart) node labels stay `#333` in both modes because node fills don't change.

### Element data

`elements.ts` is a `Record<string, GovElement>`; IDs are unique kebab-case. There is **no `childIds`** field — children are computed at load via `getChildIds`, `getSecondaryChildIds`, `getConnectedElements`; only set `parentIds` (and optionally `secondaryParentIds`). `secondaryParentIds` renders as dashed edges labelled "also leads"/"also sponsors" (used for junior ministers leading departments alongside the Secretary of State).

### FullView tiers and hover

Tier 0 PM; 1 Cabinet ministers; 2 junior ministers; 3 ministerial/non-ministerial departments; 4 agencies + division-directorates; 5+ BFS distance from any tier 1–4 node. Ring radii 180/330/520/720/940/1160/… px. Labels hidden by default; hover highlights the node, its full ancestor chain and direct children, dimming the rest to 12%. Hover is suppressed while `searchActiveRef.current` is true.

### Search → graph highlight

`SearchPane` emits `onResultsChange(ids)`; `App` stores it as `searchHighlightIds` and passes it as `highlightIds` to the graph views (only while `searchOpen`). On non-null, non-matching nodes are dimmed, matches get labels and edges are hidden. `searchActiveRef` is a ref (not state) so handlers registered at mount avoid stale closures.

### Budget and staff data

- `budgets-oscar.json` is generated by `scripts/extract-oscar.mjs` from HM Treasury OSCAR xlsx — never hand-edit. Figures are £ thousands; don't convert. `BODY_LABEL_TO_ELEMENT` in the script gives body lines an `elementId` for pie-click navigation.
- `staffing.ts` is per-element history (`StaffProfile[]` with `year`, `grades`, `orgs[]`, `professions`). Latest data: Civil Service Statistics 2026 (31 March 2026), with 2024-25 retained. Figures are rounded to nearest 5; cells <5 are suppressed (shown as 0). `orgId` in `orgs[]` must match an element ID or be `''`. Sub-org profiles are not duplicated: `getStaffProfile(elementId)` searches parent `orgs[]` at runtime.
- `powers.ts` profile keys must match element IDs exactly (`'pm'`, `'treasury'`, not `'hm-treasury'`).

### Mobile

Header buttons are hidden and replaced by a fixed bottom nav (Help, Categories, Search, dark toggle, view toggle, Details when selected). The element pane is a draggable bottom sheet (`closed` | `partial` | `full`). Cytoscape handles touch pan/zoom.

### Tab bar and charts

- `ElementDetails.tsx` tab bar is sticky at the top of the scrolling pane (bleeds into side padding via `--pane-pad-x`); tabs are equal-width (`flex: 1 1 0`) with the count stacked under the label so they never overflow; arrow/Home/End keys switch tabs (roving `tabIndex`); `selectTab` scrolls back to the tab content top if the bar is pinned. Active indicator is `box-shadow: inset 0 -2px 0` (no layout shift); height `3rem`; Budget and Staff tabs are hidden for `category === 'official'` (`currentTab` falls back to Info).
- `BudgetTab`/`StaffTab` pies use Recharts `<Pie data={activePieData}>` with swapped data (no remount) for transitions. Click handler: `onClick={(data: any) => data?.elementId && onSelectElement?.(data.elementId)}` — `PieSectorDataItem` doesn't match the real payload, so keep `any`. Staff pie collapses entries under 2% into a grey "Other" slice; the legend still lists them.

### Style

Component CSS is co-located. Breakpoints in `App.css`: panel width 350px → 420px at 1600px → 480px at 1920px. UK Gov blue `#003366`/`#004d99` header; element colours in `utils/colors.ts`. Existing class patterns: `.budget-section-label`, `.tab-button`, `.breakdown-btn`, `.bbt-*`, `.sot-*`.

---

## Project skills (`.claude/skills/`)

Use these for data work rather than ad-hoc edits:

- `manage-elements` — add/update/rename/move/remove elements in `elements.ts`, including cross-file references
- `add-powers-data` — add/update `powers.ts` profiles
- `refresh-budget-data` — new OSCAR workbook → `budgets-oscar.json`
- `civil-service-stats-refresh` — new Civil Service Statistics release → `staffing.ts`

---

## Troubleshooting

- **Hover highlight broken after search:** `searchActiveRef.current` should be `false` when `highlightIds` is `null`; it's set in the `useEffect` watching `highlightIds`.
- **Power card missing:** key in `powerProfiles` must equal the element ID.
- **Staff pie missing for a sub-org:** check `effectiveView` in `StaffTab.tsx` falls back to `'grade'` when `orgs.length === 0`.
- **Staff row not clickable:** `orgId` must match an element ID.
- **Budget pie slice not navigating:** body label must be in `BODY_LABEL_TO_ELEMENT`; re-run the extract script.
- **Sticky tab bar shows content at its sides:** the scroll container must set `--pane-pad-x` to match its horizontal padding (`.details-panel`, `.bottom-sheet-content`).

---

## Build & deploy

```bash
npm run dev       # local dev server
npm run build     # TypeScript check + Vite production build
```

Deployed to Cloudflare Pages. Build output: `dist/`.

The chunk size warning (`> 500 kB`) on build is expected and harmless — Cytoscape + Recharts are large.
