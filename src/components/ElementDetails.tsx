import { useState, useRef, useCallback } from 'react'
import { getElement, getConnectedElements, tagDefinitions } from '../data/elements'
import { jurisdictionInfo } from '../data/jurisdictions'
import { getElementColor } from '../utils/colors'
import { powerProfiles } from '../data/powers'
import { budgetProfiles } from '../data/budgets'
import { getStaffProfileSeries } from '../data/staffing'
import { professionProfiles } from '../data/professions'
import { organogramProfiles } from '../data/organograms'
import BudgetTab from './BudgetTab'
import StaffTab from './StaffTab'
import OrgTab from './OrgTab'
import './ElementDetails.css'

type Tab = 'info' | 'powers' | 'budget' | 'staff' | 'org'

interface ElementDetailsProps {
  elementId: string
  onSelectElement: (id: string) => void
  onClose: () => void
  onOpenCategory: (category: string, subtype: string) => void
  onOpenTag: (tagId: string) => void
  isMobile?: boolean
}

export default function ElementDetails({ elementId, onSelectElement, onClose, onOpenCategory, onOpenTag, isMobile }: ElementDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [activePowerTypes, setActivePowerTypes] = useState<Set<string>>(new Set(['power', 'duty', 'function', 'responsibility']))
  const tabBarWrapperRef = useRef<HTMLDivElement>(null)
  const tabContentRef = useRef<HTMLDivElement>(null)

  const selectTab = useCallback((tab: Tab) => {
    setActiveTab(tab)
    // If the pane is scrolled so the sticky tab bar is pinned over earlier content,
    // jump back so the newly selected tab starts at its top rather than mid-way down
    const wrapper = tabBarWrapperRef.current
    const content = tabContentRef.current
    const scroller = wrapper?.closest('.details-panel, .bottom-sheet-content')
    if (!wrapper || !content || !scroller) return
    const gap = parseFloat(getComputedStyle(wrapper).marginBottom) || 0
    const overlap = content.getBoundingClientRect().top - (wrapper.getBoundingClientRect().bottom + gap)
    if (overlap < 0) scroller.scrollTop += overlap
  }, [])

  const element = getElement(elementId)
  const connected = getConnectedElements(elementId)
  const powerProfile = powerProfiles[elementId]
  const budgetProfile = budgetProfiles[elementId]
  const staffHistory = getStaffProfileSeries(elementId)
  const staffProfile = staffHistory[staffHistory.length - 1]
  const professionProfile = professionProfiles[elementId]
  const orgProfile = organogramProfiles[elementId]

  if (!element) {
    return <div className="element-details">Element not found</div>
  }

  const getCategoryLabel = (category: string, subtype: string): string => {
    const labels: Record<string, Record<string, string>> = {
      official: {
        'prime-minister': '👑 Prime Minister',
        'cabinet-minister': '🌟 Cabinet Minister',
        'junior-minister': '👤 Junior Minister',
        'civil-servant': '👤 Civil Servant',
        independent: '👤 Independent Official',
      },
      department: {
        ministerial: '🏛️ Ministerial Department',
        'non-ministerial': '🏛️ Non-Ministerial Department',
        agency: '⚙️ Executive Agency',
        'division-directorate': '⚙️ Division / Directorate',
      },
      body: {
        'executive-ndpb': '📋 Executive NDPB',
        'advisory-ndpb': '💡 Advisory NDPB',
        'tribunal': '⚖️ Tribunal',
        'public-corporation': '🏢 Public Corporation',
        'royal-charter-body': '📜 Royal Charter Body',
        other: '🔗 Other Body',
      },
      group: {
        cabinet: '⭐ Cabinet',
        'other-group': '⭐ Group',
      },
    }
    return labels[category]?.[subtype] || 'Unknown'
  }

  const formatSinceDate = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `Since ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getBodyEmoji = (subtype: string) =>
    subtype === 'executive-ndpb' ? '📋' :
    subtype === 'advisory-ndpb' ? '💡' :
    subtype === 'tribunal' ? '⚖️' :
    subtype === 'public-corporation' ? '🏢' :
    subtype === 'royal-charter-body' ? '📜' : '🔗'

  // Helper function to determine relationship descriptions
  const getRelationshipLabel = (parent: any, child: any): { parentLabel: string; childLabel: string } => {
    if (parent.category === 'official' && parent.subtype === 'cabinet-minister' &&
        child.category === 'official' && child.subtype === 'junior-minister') {
      return { parentLabel: 'oversees', childLabel: 'overseen by' }
    }
    if (parent.category === 'official' && child.category === 'official') {
      return { parentLabel: 'appoints', childLabel: 'appointed by' }
    }
    if (parent.category === 'official' && child.category === 'department' && child.subtype === 'ministerial') {
      return { parentLabel: 'leads', childLabel: 'led by' }
    }
    if (parent.category === 'official' && parent.subtype === 'civil-servant' &&
        child.category === 'department' && child.subtype === 'non-ministerial') {
      return { parentLabel: 'leads', childLabel: 'led by' }
    }
    if (parent.category === 'official' && parent.subtype === 'independent' &&
        child.category === 'department' && child.subtype === 'non-ministerial') {
      return { parentLabel: 'leads', childLabel: 'led by' }
    }
    if (parent.category === 'official' && child.category === 'department' && child.subtype === 'non-ministerial') {
      return { parentLabel: 'sponsors', childLabel: 'sponsored by' }
    }
    if (parent.category === 'department' && child.category === 'department' &&
        (child.subtype === 'agency' || child.subtype === 'division-directorate')) {
      return { parentLabel: 'is parent of', childLabel: 'is child of' }
    }
    if (parent.category === 'department' && parent.subtype === 'ministerial' &&
        child.category === 'department' && child.subtype === 'non-ministerial') {
      return { parentLabel: 'supports', childLabel: 'supported by' }
    }
    if (parent.category === 'department' && child.category === 'body' &&
        (child.subtype === 'executive-ndpb' || child.subtype === 'advisory-ndpb' || child.subtype === 'tribunal')) {
      return { parentLabel: 'sponsors', childLabel: 'sponsored by' }
    }
    if (parent.category === 'group') {
      return { parentLabel: 'includes', childLabel: 'member of' }
    }
    return { parentLabel: 'works with', childLabel: 'works with' }
  }

  // ── Tab: Info ──────────────────────────────────────────────────────────────
  const renderInfo = () => (
    <>
      <p className="element-description">{element.description}</p>

      {professionProfile && professionProfile.professions.length > 0 && (() => {
        const sectionKey = 'regulated-professions'
        const isCollapsed = collapsedSections.has(sectionKey)
        return (
          <div className={`detail-section professions-section${isMobile ? ' detail-section-collapsible' : ''}${isCollapsed ? ' collapsed' : ''}`}>
            <h3 onClick={() => isMobile && setCollapsedSections(prev => {
              const next = new Set(prev)
              next.has(sectionKey) ? next.delete(sectionKey) : next.add(sectionKey)
              return next
            })}>Regulated professions</h3>
            <p className="professions-intro">
              {element.name} regulates the following profession{professionProfile.professions.length !== 1 ? 's' : ''}
              {professionProfile.onBehalfOf ? ` on behalf of ${professionProfile.onBehalfOf}` : ''}:
            </p>
            <ul className="professions-list">
              {professionProfile.professions.map((prof, i) => (
                <li key={i} className="profession-item">
                  <span className="profession-name">{prof.name}</span>
                  {prof.jurisdictionNote && (
                    <span className="profession-jurisdiction">{prof.jurisdictionNote}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })()}

      {element.tags && element.tags.length > 0 && (() => {
        const typeTags = element.tags!.filter(t => tagDefinitions[t]?.tagCategory === 'type').map(t => tagDefinitions[t])
        const sectorTags = element.tags!.filter(t => tagDefinitions[t]?.tagCategory === 'sector').map(t => tagDefinitions[t])
        return (
          <div className="element-tags">
            {typeTags.length > 0 && (
              <div className="element-tag-row">
                {typeTags.map(tag => (
                  <span key={tag.id} className="element-tag-pill" style={{ '--tag-colour': tag.colour } as React.CSSProperties}
                    onClick={() => onOpenTag(tag.id)} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenTag(tag.id)}>
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
            {sectorTags.length > 0 && (
              <div className="element-tag-row">
                {sectorTags.map(tag => (
                  <span key={tag.id} className="element-tag-pill element-tag-pill-sector" style={{ '--tag-colour': tag.colour } as React.CSSProperties}
                    onClick={() => onOpenTag(tag.id)} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenTag(tag.id)}>
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {element.role && (
        <div className="detail-section">
          <h3>Role</h3>
          <p className="role-text">{element.role}</p>
        </div>
      )}

      {element.currentHolder && (
        <div className="detail-section">
          <h3>Current Holder</h3>
          <p className="role-text">
            {element.currentHolder}
            {element.currentHolderSince && (
              <span className="role-text-since">{formatSinceDate(element.currentHolderSince)}</span>
            )}
          </p>
        </div>
      )}

      {element.jurisdictions && element.jurisdictions.length > 0 && (
        <div className="detail-section">
          <h3>Jurisdiction</h3>
          <p className="role-text">
            {element.jurisdictions.map(j => jurisdictionInfo[j]?.label ?? j).join(', ')}
          </p>
        </div>
      )}

      {element.infoUrl && (
        <div className="detail-section">
          <h3>Further Information</h3>
          <a href={element.infoUrl} target="_blank" rel="noopener noreferrer" className="external-link">
            View more details ↗
          </a>
        </div>
      )}

      {(connected.parents.length > 0 || connected.secondaryParents.length > 0) && (
        <>
          {Array.from(new Set(
            connected.parents.map(parent => getRelationshipLabel(parent, element).childLabel)
          )).map((relationshipType) => {
            const sectionKey = `parent-${relationshipType}`
            const isCollapsed = collapsedSections.has(sectionKey)
            return (
            <div key={relationshipType} className={`detail-section${isMobile ? ' detail-section-collapsible' : ''}${isCollapsed ? ' collapsed' : ''}`}>
              <h3 onClick={() => isMobile && setCollapsedSections(prev => {
                const next = new Set(prev)
                next.has(sectionKey) ? next.delete(sectionKey) : next.add(sectionKey)
                return next
              })}>{relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}</h3>
              <ul className="element-list">
                {connected.parents.filter(parent => {
                  const { childLabel } = getRelationshipLabel(parent, element)
                  return childLabel === relationshipType
                }).map(parent => {
                  const parentColor = getElementColor(parent.category, parent.subtype)
                  const parentCategoryLabel = getCategoryLabel(parent.category, parent.subtype).replace(/^[^\s]*\s/, '')
                  return (
                    <li
                      key={parent.id}
                      className="relationship-item"
                      onClick={() => onSelectElement(parent.id)}
                      style={{ borderLeftColor: parentColor }}
                    >
                      <div className="item-type" style={{ color: parentColor }}>
                        {parent.category === 'official' ? '👤' : parent.category === 'department' ? '🏛️' : parent.category === 'group' ? '⭐' : getBodyEmoji(parent.subtype)}
                      </div>
                      <div className="item-content">
                        <div className="item-name">{parent.name}</div>
                        {parent.currentHolder && (
                          <div className="item-subtitle item-holder">{parent.currentHolder}</div>
                        )}
                        <div className="item-subtitle" style={{ color: parentColor }}>{parentCategoryLabel}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )})}
          {connected.secondaryParents.length > 0 && (() => {
            const sectionKey = 'secondary-parent'
            const isCollapsed = collapsedSections.has(sectionKey)
            return (
              <div className={`detail-section${isMobile ? ' detail-section-collapsible' : ''}${isCollapsed ? ' collapsed' : ''}`}>
                <h3 onClick={() => isMobile && setCollapsedSections(prev => {
                  const next = new Set(prev)
                  next.has(sectionKey) ? next.delete(sectionKey) : next.add(sectionKey)
                  return next
                })}>{element.category === 'department' ? 'Also led by' : 'Also sponsored by'}</h3>
                <ul className="element-list">
                  {connected.secondaryParents.map(parent => {
                    const parentColor = getElementColor(parent.category, parent.subtype)
                    const parentCategoryLabel = getCategoryLabel(parent.category, parent.subtype).replace(/^[^\s]*\s/, '')
                    return (
                      <li
                        key={parent.id}
                        className="relationship-item relationship-item-secondary"
                        onClick={() => onSelectElement(parent.id)}
                        style={{ borderLeftColor: parentColor }}
                      >
                        <div className="item-type" style={{ color: parentColor }}>
                          {parent.category === 'official' ? '👤' : parent.category === 'department' ? '🏛️' : parent.category === 'group' ? '⭐' : getBodyEmoji(parent.subtype)}
                        </div>
                        <div className="item-content">
                          <div className="item-name">{parent.name}</div>
                          {parent.currentHolder && (
                            <div className="item-subtitle item-holder">{parent.currentHolder}</div>
                          )}
                          <div className="item-subtitle" style={{ color: parentColor }}>{parentCategoryLabel}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })()}
        </>
      )}

      {(connected.children.length > 0 || connected.secondaryChildren.length > 0) && (
        <>
          {Array.from(new Set([
            ...connected.children.map(child => getRelationshipLabel(element, child).parentLabel),
            ...connected.secondaryChildren.map(child => getRelationshipLabel(element, child).parentLabel),
          ])).sort((a, b) => {
            const order = ['leads', 'is parent of', 'supports', 'oversees', 'appoints', 'includes', 'sponsors', 'works with']
            return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99)
          }).map((relationshipType) => {
            const sectionKey = `child-${relationshipType}`
            const isCollapsed = collapsedSections.has(sectionKey)
            const primaryItems = connected.children.filter(child => getRelationshipLabel(element, child).parentLabel === relationshipType)
            const secondaryItems = connected.secondaryChildren.filter(child => getRelationshipLabel(element, child).parentLabel === relationshipType)
            return (
            <div key={relationshipType} className={`detail-section${isMobile ? ' detail-section-collapsible' : ''}${isCollapsed ? ' collapsed' : ''}`}>
              <h3 onClick={() => isMobile && setCollapsedSections(prev => {
                const next = new Set(prev)
                next.has(sectionKey) ? next.delete(sectionKey) : next.add(sectionKey)
                return next
              })}>{relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}</h3>
              <ul className="element-list">
                {[...primaryItems.map(c => ({ child: c, secondary: false })), ...secondaryItems.map(c => ({ child: c, secondary: true }))].map(({ child, secondary }) => {
                  const childColor = getElementColor(child.category, child.subtype)
                  const childCategoryLabel = getCategoryLabel(child.category, child.subtype).replace(/^[^\s]*\s/, '')
                  return (
                    <li
                      key={child.id}
                      className={`relationship-item${secondary ? ' relationship-item-secondary' : ''}`}
                      onClick={() => onSelectElement(child.id)}
                      style={{ borderLeftColor: childColor }}
                    >
                      <div className="item-type" style={{ color: childColor }}>
                        {child.category === 'official' ? '👤' : child.category === 'department' ? '🏛️' : child.category === 'group' ? '⭐' : getBodyEmoji(child.subtype)}
                      </div>
                      <div className="item-content">
                        <div className="item-name">{child.name}</div>
                        {child.currentHolder && (
                          <div className="item-subtitle item-holder">{child.currentHolder}</div>
                        )}
                        <div className="item-subtitle" style={{ color: childColor }}>{childCategoryLabel}</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )})}
        </>
      )}
    </>
  )

  // ── Tab: Powers ────────────────────────────────────────────────────────────
  const renderPowers = () => {
    if (!powerProfile || powerProfile.powers.length === 0) {
      return (
        <div className="tab-empty">
          <p>No powers, duties, or responsibilities have been recorded for this element yet.</p>
        </div>
      )
    }

    const typeOrder: Record<string, number> = { power: 0, duty: 1, function: 2, responsibility: 3 }
    const sorted = [...powerProfile.powers].sort((a, b) => (typeOrder[a.powerType] ?? 4) - (typeOrder[b.powerType] ?? 4))
    const presentTypes = Array.from(new Set(powerProfile.powers.map(p => p.powerType)))
      .sort((a, b) => (typeOrder[a] ?? 4) - (typeOrder[b] ?? 4))
    const filtered = sorted.filter(p => activePowerTypes.has(p.powerType))

    const toggleType = (type: string) => {
      setActivePowerTypes(prev => {
        const next = new Set(prev)
        if (next.has(type)) {
          if (next.size > 1) next.delete(type)
        } else {
          next.add(type)
        }
        return next
      })
    }

    const typeLabels: Record<string, string> = { power: 'Power', duty: 'Duty', function: 'Function', responsibility: 'Responsibility' }
    const typeColours: Record<string, string> = { power: '#6c3483', duty: '#1a5276', function: '#1e8449', responsibility: '#784212' }

    return (
      <>
        {presentTypes.length > 1 && (
          <div className="power-filters">
            {presentTypes.map(type => (
              <button
                key={type}
                className={`power-filter-btn${activePowerTypes.has(type) ? ' active' : ''}`}
                style={{ '--type-colour': typeColours[type] } as React.CSSProperties}
                onClick={() => toggleType(type)}
              >
                {typeLabels[type]}
              </button>
            ))}
          </div>
        )}
        {filtered.map(power => (
          <div key={power.id} className={`power-card power-card-${power.powerType}`}>
            <div className="power-card-header">
              <span className={`power-type-badge power-type-${power.powerType}`}>
                {power.powerType.charAt(0).toUpperCase() + power.powerType.slice(1)}
              </span>
              {power.inForceFrom && (
                <span className="power-since">Since {power.inForceFrom}</span>
              )}
            </div>
            <div className="power-title">{power.title}</div>
            <p className="power-description">{power.description}</p>

            {power.sources.length > 0 && (
              <div className="power-sources">
                <div className="power-sources-label">Source{power.sources.length > 1 ? 's' : ''}</div>
                <ul className="power-sources-list">
                  {power.sources.map((src, i) => (
                    <li key={i} className="power-source-item">
                      <span className={`source-type-badge source-type-${src.type}`}>
                        {src.type === 'statutory-instrument' ? 'SI' :
                         src.type === 'act' ? 'Act' :
                         src.type === 'prerogative' ? 'Prerogative' :
                         src.type === 'case-law' ? 'Case law' : 'Convention'}
                      </span>
                      {src.legislationUrl ? (
                        <a href={src.legislationUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                          {src.title}{src.section ? `, ${src.section}` : ''}
                        </a>
                      ) : (
                        <span className="source-text">
                          {src.title}{src.section ? `, ${src.section}` : ''}
                          {src.caseRef ? ` — ${src.caseRef}` : ''}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {power.notes && (
              <p className="power-notes">{power.notes}</p>
            )}
          </div>
        ))}
        {powerProfile.lastReviewed && (
          <p className="tab-reviewed">Data last reviewed: {powerProfile.lastReviewed}</p>
        )}
      </>
    )
  }

  // ── Tab bar ────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; count?: string; empty?: boolean }[] = [
    { id: 'info', label: 'Info' },
    { id: 'powers', label: 'Powers', count: powerProfile ? String(powerProfile.powers.length) : undefined, empty: !powerProfile },
    ...(element.category !== 'official' ? [
      { id: 'budget' as Tab, label: 'Budget', count: budgetProfile?.budgets[0]?.financialYear, empty: !budgetProfile },
      { id: 'staff' as Tab, label: 'Staff', count: staffProfile?.grades.total.toLocaleString(), empty: !staffProfile },
      { id: 'org' as Tab, label: 'Org', count: orgProfile ? String(orgProfile.posts.length) : undefined, empty: !orgProfile },
    ] : []),
  ]
  // Budget/Staff aren't offered for officials — fall back to Info if one was open
  const currentTab: Tab = tabs.some(t => t.id === activeTab) ? activeTab : 'info'

  // WAI-ARIA tabs pattern: arrow keys / Home / End move between tabs
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex(t => t.id === currentTab)
    const next =
      e.key === 'ArrowRight' ? (i + 1) % tabs.length :
      e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length :
      e.key === 'Home' ? 0 :
      e.key === 'End' ? tabs.length - 1 : null
    if (next === null) return
    e.preventDefault()
    selectTab(tabs[next].id)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className="element-details">
      <div className="element-header">
        <div className="header-content">
          <h2>{element.name}</h2>
          <span
            className="element-type category-button"
            onClick={() => onOpenCategory(element.category, element.subtype === 'independent' ? 'other' : element.subtype)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenCategory(element.category, element.subtype === 'independent' ? 'other' : element.subtype)}
          >
            {getCategoryLabel(element.category, element.subtype)}
          </span>
        </div>
        <button
          className="close-button-header"
          onClick={onClose}
          aria-label="Close details panel"
        >
          ✕
        </button>
      </div>

      <div className="tab-bar-wrapper" ref={tabBarWrapperRef}>
      <div className="tab-bar" role="tablist" aria-label="Element details" onKeyDown={handleTabKeyDown}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`element-tab-${tab.id}`}
            className={`tab-button${currentTab === tab.id ? ' tab-button-active' : ''}${tab.empty ? ' tab-button-empty' : ''}`}
            role="tab"
            aria-selected={currentTab === tab.id}
            aria-controls="element-tabpanel"
            tabIndex={currentTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>
      </div>

      <div className="tab-content" ref={tabContentRef} id="element-tabpanel" role="tabpanel" aria-labelledby={`element-tab-${currentTab}`}>
        {currentTab === 'info' && renderInfo()}
        {currentTab === 'powers' && renderPowers()}
        {currentTab === 'budget' && <BudgetTab budgetProfile={budgetProfile} onSelectElement={onSelectElement} />}
        {/* key resets the tab's year / scope / chart state when the selected
            element changes, so a new organisation always opens on its latest year */}
        {currentTab === 'staff' && <StaffTab key={elementId} staffHistory={staffHistory} onSelectElement={onSelectElement} />}
        {currentTab === 'org' && (orgProfile
          ? <OrgTab key={elementId} orgProfile={orgProfile} />
          : <div className="tab-empty"><p>No organogram data is available for this organisation yet.</p></div>
        )}
      </div>
    </div>
  )
}
