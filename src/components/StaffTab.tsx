import { useState } from 'react'
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts'
import type { StaffProfile } from '../data/staffing'
import './StaffTab.css'

interface StaffTabProps {
  staffProfile: StaffProfile | undefined
  onSelectElement?: (id: string) => void
}

type ChartView = 'grade' | 'org' | 'profession'
type Scope = 'group' | 'core'

const GRADE_COLOURS: Record<string, string> = {
  scs:   '#8e44ad',
  g67:   '#2980b9',
  sheo:  '#27ae60',
  eo:    '#e67e22',
  aaao:  '#c0392b',
  other: '#7f8c8d',
}

const GRADE_LABELS: Record<string, string> = {
  scs:   'Senior Civil Service',
  g67:   'Grade 6 / 7',
  sheo:  'SEO / HEO',
  eo:    'Executive Officer',
  aaao:  'AA / AO',
  other: 'Unreported Grade',
}

const ORG_COLOURS = [
  '#2980b9', '#27ae60', '#e67e22', '#8e44ad', '#c0392b',
  '#16a085', '#d35400', '#2c3e50', '#f39c12', '#1abc9c', '#e91e63',
]

const OTHER_THRESHOLD = 0.02

// Collapses entries below 2% of total into a grey "Other" pie slice.
// Returns the collapsed pie array, the full unsorted legend rows (all entries),
// and a colour map keyed by name for the legend.
function collapseSmall(
  entries: PieEntry[],
  total: number,
): { pieData: PieEntry[]; colourMap: Map<string, string> } {
  const colourMap = new Map<string, string>()
  const main: PieEntry[] = []
  const small: PieEntry[] = []
  for (const e of entries) {
    if (e.value / total < OTHER_THRESHOLD) small.push(e)
    else { main.push(e); colourMap.set(e.name, e.fill) }
  }
  const pieData = [...main]
  if (small.length > 0) {
    pieData.push({ name: 'Other', value: small.reduce((s, e) => s + e.value, 0), fill: '#bdc3c7' })
  }
  return { pieData, colourMap }
}

// A palette of 20 distinct colours for professions
const PROFESSION_COLOURS = [
  '#2980b9', '#27ae60', '#e67e22', '#8e44ad', '#c0392b',
  '#16a085', '#d35400', '#f39c12', '#1abc9c', '#e91e63',
  '#2c3e50', '#7f8c8d', '#6c3483', '#1a5276', '#1e8449',
  '#784212', '#117a65', '#943126', '#1f618d', '#b7950b',
]

function formatHeadcount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}

interface PieEntry { name: string; value: number; fill: string; elementId?: string }

export default function StaffTab({ staffProfile, onSelectElement }: StaffTabProps) {
  const [chartView, setChartView] = useState<ChartView>('grade')
  const [scope, setScope] = useState<Scope>('group')

  if (!staffProfile) {
    return (
      <div className="tab-empty">
        <p>No staffing data has been recorded for this organisation yet.</p>
      </div>
    )
  }

  const { grades, coreGrades, orgs, year, professions, coreProfessions } = staffProfile

  // Whether this profile supports a core / whole-group toggle
  const hasCoreScope = !!coreGrades && orgs.length > 0
  const effectiveScope: Scope = hasCoreScope ? scope : 'group'
  const activeGrades = (effectiveScope === 'core' && coreGrades) ? coreGrades : grades
  const activeProfessions = (effectiveScope === 'core' && coreProfessions) ? coreProfessions : professions

  // ── Grade pie data ──────────────────────────────────────────────────────
  const gradeKeys: (keyof typeof GRADE_LABELS)[] = ['scs', 'g67', 'sheo', 'eo', 'aaao', 'other']
  const gradePieData: PieEntry[] = gradeKeys
    .filter(k => activeGrades[k as keyof typeof activeGrades] > 0)
    .map(k => ({
      name: GRADE_LABELS[k],
      value: activeGrades[k as keyof typeof activeGrades] as number,
      fill: GRADE_COLOURS[k],
    }))

  // ── Org pie data ────────────────────────────────────────────────────────
  const orgAllEntries: PieEntry[] = orgs.map((org, i) => ({
    name: org.label,
    value: org.grades.total,
    fill: ORG_COLOURS[i % ORG_COLOURS.length],
    elementId: org.orgId || undefined,
  })).filter(e => e.value > 0)
  const orgTotal = orgAllEntries.reduce((s, e) => s + e.value, 0)
  const { pieData: orgPieData, colourMap: orgColourMap } = collapseSmall(orgAllEntries, orgTotal)

  // ── Profession pie data ─────────────────────────────────────────────────
  const profAllEntries: PieEntry[] = activeProfessions
    ? Object.entries(activeProfessions)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value], i) => ({
          name,
          value,
          fill: PROFESSION_COLOURS[i % PROFESSION_COLOURS.length],
        }))
    : []
  const profTotal = profAllEntries.reduce((s, e) => s + e.value, 0)
  const { pieData: profPieData, colourMap: profColourMap } = collapseSmall(profAllEntries, profTotal)

  // Determine which chart views are available
  // "By Organisation" only makes sense in whole-group scope — the core
  // department (excl. agencies) has no sub-orgs to break down.
  const hasOrgs = orgs.length > 0 && effectiveScope === 'group'
  const hasProfessions = profAllEntries.length > 0

  // Fall back if selected view has no data
  let effectiveChartView: ChartView = chartView
  if (effectiveChartView === 'org' && !hasOrgs) effectiveChartView = 'grade'
  if (effectiveChartView === 'profession' && !hasProfessions) effectiveChartView = 'grade'

  const activePieData =
    effectiveChartView === 'grade' ? gradePieData :
    effectiveChartView === 'org'   ? orgPieData   :
                                     profPieData

  // Full legend rows (all entries, not collapsed) and colour map for each view
  const activeLegendEntries =
    effectiveChartView === 'grade' ? gradePieData :
    effectiveChartView === 'org'   ? orgAllEntries :
                                     profAllEntries
  const activeColourMap =
    effectiveChartView === 'org'        ? orgColourMap :
    effectiveChartView === 'profession' ? profColourMap :
                                          new Map(gradePieData.map(e => [e.name, e.fill]))

  const pieTotal = activeGrades.total

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const { name, value } = payload[0]
    const pct = ((value / pieTotal) * 100).toFixed(1)
    return (
      <div className="staff-tooltip">
        <div className="staff-tooltip-label">{name}</div>
        <div className="staff-tooltip-value">{value.toLocaleString()} ({pct}%)</div>
      </div>
    )
  }

  const chartLabel =
    effectiveChartView === 'grade'      ? 'Breakdown by grade' :
    effectiveChartView === 'org'        ? 'Breakdown by organisation' :
                                          'Breakdown by profession'

  return (
    <div className="staff-tab">
      {/* Summary */}
      <div className="staff-summary">
        <div className="staff-summary-year">Civil Service Statistics — {year}</div>
        <div className="staff-summary-total">
          <span className="staff-total-value">{activeGrades.total.toLocaleString()}</span>
          <span className="staff-total-label"> civil servants (headcount)</span>
        </div>
      </div>

      {/* Scope toggle — only when core grades exist */}
      {hasCoreScope && (
        <div className="breakdown-bar">
          <button
            className={`breakdown-btn${effectiveScope === 'group' ? ' breakdown-btn-active' : ''}`}
            onClick={() => setScope('group')}
          >
            Whole group
          </button>
          <button
            className={`breakdown-btn${effectiveScope === 'core' ? ' breakdown-btn-active' : ''}`}
            onClick={() => setScope('core')}
          >
            Core department
          </button>
        </div>
      )}

      {/* Chart-type switcher */}
      {(hasOrgs || hasProfessions) && (
        <div className="breakdown-bar">
          <button
            className={`breakdown-btn${effectiveChartView === 'grade' ? ' breakdown-btn-active' : ''}`}
            onClick={() => setChartView('grade')}
          >
            By Grade
          </button>
          {hasOrgs && (
            <button
              className={`breakdown-btn${effectiveChartView === 'org' ? ' breakdown-btn-active' : ''}`}
              onClick={() => setChartView('org')}
            >
              By Organisation
            </button>
          )}
          {hasProfessions && (
            <button
              className={`breakdown-btn${effectiveChartView === 'profession' ? ' breakdown-btn-active' : ''}`}
              onClick={() => setChartView('profession')}
            >
              By Profession
            </button>
          )}
        </div>
      )}

      {/* Pie chart */}
      <div className="staff-chart-section">
        <div className="budget-section-label">{chartLabel}</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={activePieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              onClick={(data: any) => data?.elementId && onSelectElement?.(data.elementId)}
              style={{ cursor: effectiveChartView === 'org' ? 'pointer' : 'default' }}
            />
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend table — always shows all entries; small ones get a grey dot */}
        <table className="staff-breakdown-table">
          <tbody>
            {activeLegendEntries.map(entry => {
              const colour = activeColourMap.get(entry.name)
              return (
                <tr key={entry.name}>
                  <td className="bbt-swatch">
                    {colour
                      ? <span className="bbt-dot" style={{ backgroundColor: colour }} />
                      : <span className="bbt-dot bbt-dot-other" />
                    }
                  </td>
                  <td className="bbt-label">{entry.name}</td>
                  <td className="bbt-amount">{entry.value.toLocaleString()}</td>
                  <td className="bbt-pct">{((entry.value / pieTotal) * 100).toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Org detail table — visible in grade view too, showing each sub-org's grade breakdown */}
      {hasOrgs && effectiveChartView === 'grade' && effectiveScope === 'group' && (
        <div className="staff-chart-section">
          <div className="budget-section-label">Grade breakdown by organisation</div>
          <table className="staff-org-table">
            <thead>
              <tr>
                <th className="sot-org">Organisation</th>
                <th className="sot-num">Total</th>
                <th className="sot-num">SCS</th>
                <th className="sot-num">G6/7</th>
                <th className="sot-num">SEO/HEO</th>
                <th className="sot-num">EO</th>
                <th className="sot-num">AA/AO</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr
                  key={org.label}
                  className={org.orgId && onSelectElement ? 'sot-row-clickable' : ''}
                  onClick={() => org.orgId && onSelectElement && onSelectElement(org.orgId)}
                >
                  <td className="sot-org">{org.label}</td>
                  <td className="sot-num sot-total">{formatHeadcount(org.grades.total)}</td>
                  <td className="sot-num">{org.grades.scs || '–'}</td>
                  <td className="sot-num">{formatHeadcount(org.grades.g67)}</td>
                  <td className="sot-num">{formatHeadcount(org.grades.sheo)}</td>
                  <td className="sot-num">{org.grades.eo ? formatHeadcount(org.grades.eo) : '–'}</td>
                  <td className="sot-num">{org.grades.aaao ? formatHeadcount(org.grades.aaao) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="staff-footer">
        <a
          className="staff-source-link"
          href="https://www.gov.uk/government/statistics/civil-service-statistics-2026"
          target="_blank"
          rel="noopener noreferrer"
        >
          Civil Service Statistics 2026 ↗
        </a>
        <p className="staff-notes">
          Headcount as at 31 March 2026. Figures rounded to nearest 5.
          Cells with fewer than 5 staff are suppressed (shown as 0).
          'Other' grade includes unclassified and unreported grades.
          Profession data from Table 8; grade data from Table 20.
        </p>
        <p className="staff-ogl">
          Contains public sector information licensed under the{' '}
          <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">
            Open Government Licence v3.0
          </a>
        </p>
      </div>
    </div>
  )
}
