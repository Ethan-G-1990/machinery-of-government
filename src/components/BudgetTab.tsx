import { useState } from 'react'
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts'
import type { BudgetProfile, BudgetLine } from '../data/budgets'
import './BudgetTab.css'

interface BudgetTabProps {
  budgetProfile: BudgetProfile | undefined
  onSelectElement?: (id: string) => void
}

type Breakdown = 'type' | 'programme' | 'body'

const PIE_COLOURS = [
  '#2980b9', '#27ae60', '#e67e22', '#8e44ad', '#c0392b',
  '#16a085', '#d35400', '#2c3e50', '#f39c12', '#7f8c8d',
  '#1abc9c', '#e91e63',
]

// Slices below this share of total are folded into "Other" on the pie only
const OTHER_THRESHOLD = 0.02

function formatAmount(amountThousands: number): string {
  const abs = Math.abs(amountThousands)
  if (abs >= 1_000_000) return `£${(abs / 1_000_000).toFixed(1)}bn`
  if (abs >= 1_000)     return `£${(abs / 1_000).toFixed(1)}m`
  return `£${abs.toLocaleString()}k`
}

function formatSigned(amountThousands: number): string {
  return (amountThousands < 0 ? '−' : '') + formatAmount(amountThousands)
}

interface PieEntry { name: string; value: number; fill: string; elementId?: string }

// Returns pie data with small items collapsed into "Other", a full sorted list
// for the table, and a label→colour map so the table can show pie colours.
function buildChartData(lines: BudgetLine[]): {
  pieData: PieEntry[]
  tableRows: BudgetLine[]
  colourMap: Map<string, string>
} {
  const sorted = lines
    .filter(l => Math.abs(l.amount) > 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

  if (sorted.length === 0) return { pieData: [], tableRows: [], colourMap: new Map() }

  const total = sorted.reduce((s, l) => s + Math.abs(l.amount), 0)

  const main: BudgetLine[] = []
  const small: BudgetLine[] = []
  for (const l of sorted) {
    if (Math.abs(l.amount) / total < OTHER_THRESHOLD) small.push(l)
    else main.push(l)
  }

  const colourMap = new Map<string, string>()
  const pieData: PieEntry[] = main.map((l, i) => {
    const fill = PIE_COLOURS[i % PIE_COLOURS.length]
    colourMap.set(l.label, fill)
    return { name: l.label, value: Math.abs(l.amount), fill, elementId: l.elementId }
  })

  if (small.length > 0) {
    const otherTotal = small.reduce((s, l) => s + Math.abs(l.amount), 0)
    pieData.push({ name: 'Other', value: otherTotal, fill: '#bdc3c7' })
  }

  return { pieData, tableRows: sorted, colourMap }
}

// Custom tooltip
interface TooltipProps { active?: boolean; payload?: Array<{ payload: PieEntry }> }
function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="budget-tooltip">
      <div className="budget-tooltip-label">{name}</div>
      <div className="budget-tooltip-value">{formatAmount(value)}</div>
    </div>
  )
}

function BreakdownTable({ rows, isIncome, colourMap }: {
  rows: BudgetLine[]
  isIncome: boolean
  colourMap: Map<string, string>
}) {
  if (!rows.length) return null
  return (
    <table className="budget-breakdown-table">
      <tbody>
        {rows.map((row, i) => {
          const colour = colourMap.get(row.label)
          return (
            <tr key={i}>
              <td className="bbt-swatch">
                {colour
                  ? <span className="bbt-dot" style={{ background: colour }} />
                  : <span className="bbt-dot bbt-dot-other" />
                }
              </td>
              <td className="bbt-label">{row.label}</td>
              <td className="bbt-amount">{isIncome ? formatSigned(row.amount) : formatAmount(row.amount)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

interface DelAmeBarProps {
  delAdmin: number; delProg: number; deptAme: number; nonDeptAme: number
}
function DelAmeBar({ delAdmin, delProg, deptAme, nonDeptAme }: DelAmeBarProps) {
  const segments = [
    { label: 'DEL Admin',     value: Math.max(0, delAdmin),   colour: '#2980b9' },
    { label: 'DEL Programme', value: Math.max(0, delProg),    colour: '#27ae60' },
    { label: 'Dept AME',      value: Math.max(0, deptAme),    colour: '#e67e22' },
    { label: 'Non-Dept AME',  value: Math.max(0, nonDeptAme), colour: '#8e44ad' },
  ].filter(s => s.value > 0)

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  return (
    <div className="del-ame-section">
      <div className="budget-section-label">DEL / AME Split</div>
      <div className="del-ame-bar">
        {segments.map(seg => (
          <div
            key={seg.label}
            className="del-ame-segment"
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.colour }}
            title={`${seg.label}: ${formatAmount(seg.value)}`}
          />
        ))}
      </div>
      <div className="del-ame-legend">
        {segments.map(seg => (
          <div key={seg.label} className="del-ame-legend-item">
            <span className="del-ame-dot" style={{ background: seg.colour }} />
            <span className="del-ame-legend-label">{seg.label}</span>
            <span className="del-ame-legend-value">{formatAmount(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChartBlockProps {
  expenditureLines: BudgetLine[]
  incomeLines: BudgetLine[]
  expenditureLabel: string
  incomeLabel: string
  onSelectElement?: (id: string) => void
}
function ChartBlock({ expenditureLines, incomeLines, expenditureLabel, incomeLabel, onSelectElement }: ChartBlockProps) {
  const [showIncome, setShowIncome] = useState(false)

  const hasIncome = incomeLines.some(l => Math.abs(l.amount) > 0)
  const hasExpenditure = expenditureLines.some(l => Math.abs(l.amount) > 0)

  // If only one type exists, force that view
  const effectiveShowIncome = hasIncome && (!hasExpenditure || showIncome)

  const activeLines = effectiveShowIncome ? incomeLines : expenditureLines
  const { pieData, tableRows, colourMap } = buildChartData(activeLines)

  if (pieData.length === 0) return null

  return (
    <div className="budget-chart-section">
      {hasIncome && hasExpenditure && (
        <div className="breakdown-bar" style={{ marginBottom: '0.5rem' }}>
          <button
            className={`breakdown-btn${!effectiveShowIncome ? ' breakdown-btn-active' : ''}`}
            onClick={() => setShowIncome(false)}
          >
            {expenditureLabel}
          </button>
          <button
            className={`breakdown-btn${effectiveShowIncome ? ' breakdown-btn-active' : ''}`}
            onClick={() => setShowIncome(true)}
          >
            {incomeLabel}
          </button>
        </div>
      )}
      <div className="budget-section-label">
        {effectiveShowIncome ? incomeLabel : expenditureLabel}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            onClick={(data: any) => data?.elementId && onSelectElement?.(data.elementId)}
            style={{ cursor: 'pointer' }}
          />
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="budget-chart-touch-hint">Tap a slice for its amount</div>
      <BreakdownTable rows={tableRows} isIncome={effectiveShowIncome} colourMap={colourMap} />
    </div>
  )
}

export default function BudgetTab({ budgetProfile, onSelectElement }: BudgetTabProps) {
  const [breakdown, setBreakdown] = useState<Breakdown>('type')

  if (!budgetProfile || budgetProfile.budgets.length === 0) {
    return (
      <div className="tab-empty">
        <p>No budget data has been recorded for this element yet.</p>
      </div>
    )
  }

  const budget = budgetProfile.budgets[0]
  const hasIncome = budget.incomeLines.length > 0
  const hasProgrammes = budget.programmeLines.length > 0
  const hasBodies     = budget.bodyLines.length > 0

  return (
    <div className="budget-tab">

      {/* ── Summary ── */}
      <div className="budget-summary">
        <div className="budget-summary-year">{budget.financialYear} Outturn</div>
        <div className="budget-summary-figures">
          <div className="budget-figure budget-figure-net">
            <div className="budget-figure-label">Net Expenditure</div>
            <div className="budget-figure-value">{formatAmount(budget.totalNetExpenditure)}</div>
          </div>
          <div className="budget-figure budget-figure-gross">
            <div className="budget-figure-label">Gross Expenditure</div>
            <div className="budget-figure-value">{formatAmount(budget.totalGrossExpenditure)}</div>
          </div>
          {hasIncome && (
            <div className="budget-figure budget-figure-income">
              <div className="budget-figure-label">Income</div>
              <div className="budget-figure-value">{formatSigned(budget.totalIncome)}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── DEL / AME bar ── */}
      <DelAmeBar
        delAdmin={budget.delAdmin ?? 0}
        delProg={budget.delProg ?? 0}
        deptAme={budget.deptAme ?? 0}
        nonDeptAme={budget.nonDeptAme ?? 0}
      />

      {/* ── Breakdown switcher ── */}
      {(hasProgrammes || hasBodies) && (
        <div className="breakdown-bar" role="group" aria-label="Spending breakdown view">
          <button
            className={`breakdown-btn${breakdown === 'type' ? ' breakdown-btn-active' : ''}`}
            onClick={() => setBreakdown('type')}
          >
            By Type
          </button>
          {hasProgrammes && (
            <button
              className={`breakdown-btn${breakdown === 'programme' ? ' breakdown-btn-active' : ''}`}
              onClick={() => setBreakdown('programme')}
            >
              By Programme
            </button>
          )}
          {hasBodies && (
            <button
              className={`breakdown-btn${breakdown === 'body' ? ' breakdown-btn-active' : ''}`}
              onClick={() => setBreakdown('body')}
            >
              By Body
            </button>
          )}
        </div>
      )}

      {/* ── Charts ── */}
      {breakdown === 'type' && (
        <ChartBlock
          expenditureLines={budget.expenditureLines}
          incomeLines={budget.incomeLines}
          expenditureLabel="Expenditure by Type"
          incomeLabel="Income by Type"
          onSelectElement={onSelectElement}
        />
      )}

      {breakdown === 'programme' && (
        <ChartBlock
          expenditureLines={budget.programmeLines}
          incomeLines={budget.programmeIncomeLines ?? []}
          expenditureLabel="Expenditure by Programme"
          incomeLabel="Income by Programme"
          onSelectElement={onSelectElement}
        />
      )}

      {breakdown === 'body' && (
        <ChartBlock
          expenditureLines={budget.bodyLines}
          incomeLines={budget.bodyIncomeLines ?? []}
          expenditureLabel="Grants to Bodies"
          incomeLabel="Income from Bodies"
          onSelectElement={onSelectElement}
        />
      )}

      {/* ── Footer ── */}
      <div className="budget-footer">
        {budget.annualReportUrl && (
          <a
            href={budget.annualReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            Full annual report ↗
          </a>
        )}
        <p className="budget-source">Source: {budget.sourceLabel}</p>
        {budget.notes && <p className="budget-notes">{budget.notes}</p>}
        <p className="budget-ogl">
          Contains public sector information licensed under the{' '}
          <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener noreferrer">
            Open Government Licence v3.0
          </a>
        </p>
      </div>

    </div>
  )
}
