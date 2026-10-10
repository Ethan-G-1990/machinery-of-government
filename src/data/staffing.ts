// Civil Service headcount by grade, as at 31 March each year
// Source: Civil Service Statistics 2026, Tables 20 and 8 (plus historic years)
// https://www.gov.uk/government/statistics/civil-service-statistics-2026
//
// Grades (Table 20):
//   scs   = Senior Civil Service
//   g67   = Grade 6 or Grade 7
//   sheo  = Senior or Higher Executive Officer
//   eo    = Executive Officer
//   aaao  = Administrative Assistant or Administrative Officer
//   other = Unreported / unclassified grade
//
// Professions (Table 8): top-level profession headcounts for the whole
// department group (the "Overall" row).  Only professions with ≥5 staff
// are included; [c] cells are recorded as 0.
//
// [c] cells (suppressed, 1–4 staff) are recorded as 0.
// Parent department entries use the "Overall" totals from Table 20.
// Sub-org entries use their individual row totals.
// Keys must match element IDs in elements.ts.
//
// History: each element ID maps to an ARRAY of StaffProfile, one per
// reference year, oldest first. This mirrors the budgets.ts convention
// (`budgets: Budget[]`) so that re-running the ingestion for a future
// year's statistics release appends a new entry without discarding the
// data already recorded for earlier years. Use `getLatestStaffProfile()`
// for the most recent year, or `getStaffProfileHistory()` for the full
// series.
//
// To refresh for a new release, use the `civil-service-stats-refresh`
// skill (see .claude/skills/).

export interface GradeBreakdown {
  scs: number
  g67: number
  sheo: number
  eo: number
  aaao: number
  other: number
  total: number
}

export interface OrgStaff {
  /** Element ID of the sub-organisation (if it exists in elements.ts) */
  orgId: string
  /** Display label matching the Table 20 organisation name */
  label: string
  grades: GradeBreakdown
}

export interface StaffProfile {
  /** Element ID from elements.ts */
  elementId: string
  /** Reference year */
  year: string
  /** Department-level totals (the "Overall" row from Table 20) */
  grades: GradeBreakdown
  /**
   * Grade totals for the core department only (excl. agencies).
   * Present only when the department has sub-orgs.  Taken from the
   * "(excl. agencies)" row in Table 20.
   */
  coreGrades?: GradeBreakdown
  /** Individual sub-organisations listed under this department in Table 20 */
  orgs: OrgStaff[]
  /**
   * Profession headcounts from Table 8 "Overall" row.
   * Keys are profession names; values are headcounts.
   */
  professions?: Record<string, number>
  /**
   * Profession headcounts for the core department only (excl. agencies).
   * Taken from the core org row in Table 8.
   */
  coreProfessions?: Record<string, number>
}

// Each element ID maps to its staffing history, oldest year first.
export const staffProfiles: Record<string, StaffProfile[]> = {

  // ── Ministerial Departments ───────────────────────────────────────────────

  'co': [
    {
      elementId: 'co',
      year: '2024-25',
      grades: { scs: 770, g67: 4460, sheo: 5060, eo: 855, aaao: 370, other: 0, total: 11510 },
      coreGrades: { scs: 530, g67: 2745, sheo: 2510, eo: 755, aaao: 355, other: 0, total: 6890 },
      orgs: [
        { orgId: 'co',    label: 'Cabinet Office (excl. agencies)', grades: { scs: 530, g67: 2745, sheo: 2510, eo: 755, aaao: 355, other: 0, total: 6890 } },
        { orgId: '',      label: 'Fast Stream',                     grades: { scs: 0,   g67: 0,    sheo: 1975, eo: 0,   aaao: 0,   other: 0, total: 1980 } },
        { orgId: '',      label: 'Crown Commercial Service',        grades: { scs: 25,  g67: 185,  sheo: 405,  eo: 85,  aaao: 10,  other: 0, total: 715  } },
        { orgId: 'government-commercial-organisation', label: 'Government Commercial Organisation', grades: { scs: 185, g67: 1305, sheo: 45, eo: 0,  aaao: 0,   other: 0, total: 1535 } },
        { orgId: '',      label: 'Government Property Agency',      grades: { scs: 30,  g67: 220,  sheo: 125,  eo: 10,  aaao: 0,   other: 0, total: 390  } },
      ],
      professions: { 'Commercial': 2165, 'Human Resources': 1370, 'Digital and Data': 1335, 'Project Delivery': 735, 'Finance': 635, 'Security': 625, 'Policy': 585, 'Legal': 390, 'Communications': 340, 'Property': 255, 'Operational Delivery': 150, 'Statistics': 135, 'Science and Engineering': 115, 'Intelligence Analysis': 105, 'Economics': 80, 'Knowledge and Information Management': 60, 'Counter Fraud': 50, 'Operational Research': 45, 'Planning': 20, 'Social Research': 20, 'Other': 15, 'No reported profession': 2270 },
      coreProfessions: { 'Commercial': 200, 'Human Resources': 1250, 'Digital and Data': 980, 'Project Delivery': 625, 'Finance': 445, 'Security': 420, 'Policy': 530, 'Legal': 320, 'Communications': 270, 'Economics': 20, 'Operational Delivery': 130, 'Statistics': 120, 'Intelligence Analysis': 100, 'Counter Fraud': 50, 'Operational Research': 35, 'Social Research': 15 },
    },
    {
      elementId: 'co',
      year: '2025-26',
      grades: { scs: 690, g67: 3745, sheo: 4715, eo: 705, aaao: 385, other: 0, total: 10235 },
      coreGrades: { scs: 425, g67: 1905, sheo: 2075, eo: 610, aaao: 370, other: 0, total: 5385 },
      orgs: [
        { orgId: 'co',    label: 'Cabinet Office (excl. agencies)', grades: { scs: 425, g67: 1905, sheo: 2075, eo: 610, aaao: 370, other: 0, total: 5385 } },
        { orgId: 'civil-service-fast-stream', label: 'Central Civil Service Fast Stream', grades: { scs: 0, g67: 0, sheo: 2065, eo: 0, aaao: 0, other: 0, total: 2065 } },
        { orgId: 'ccs',   label: 'Government Commercial Agency',    grades: { scs: 25,  g67: 210,  sheo: 405,  eo: 80,  aaao: 10,  other: 0, total: 735  } },
        { orgId: 'government-commercial-organisation', label: 'Government Commercial Organisation', grades: { scs: 200, g67: 1375, sheo: 0, eo: 0,  aaao: 0,   other: 0, total: 1580 } },
        { orgId: 'gpa',   label: 'Government Property Agency',      grades: { scs: 35,  g67: 250,  sheo: 170,  eo: 15,  aaao: 0,   other: 0, total: 470  } },
      ],
      professions: { 'Commercial': 2255, 'Human Resources': 1325, 'Digital and Data': 845, 'Policy': 785, 'Project Delivery': 715, 'Finance': 440, 'Security': 65, 'Communications': 320, 'Legal': 370, 'Property': 290, 'Operational Research': 45, 'Economics': 140, 'Statistics': 160, 'Intelligence Analysis': 90, 'Counter Fraud': 35, 'Knowledge and Information Management': 145, 'Science and Engineering': 10, 'Social Research': 30, 'Planning': 15, 'Internal Audit': 90, 'Clinical': 10, 'Operational Delivery': 70, 'Risk Management': 20, 'Other': 0, 'No reported profession': 1140 },
      coreProfessions: { 'Clinical': 10, 'Commercial': 185, 'Communications': 255, 'Counter Fraud': 35, 'Cyber': 55, 'Digital and Data': 475, 'Economics': 45, 'Finance': 245, 'Human Resources': 915, 'Intelligence Analysis': 90, 'Internal Audit': 10, 'Knowledge and Information Management': 140, 'Legal': 100, 'Occupational Psychology': 5, 'Operational Research': 5, 'Planning': 15, 'Policy': 585, 'Project Delivery': 410, 'Property': 40, 'Risk Management': 20, 'Science and Engineering': 15, 'Security': 455, 'Social Research': 55, 'Statistics': 10, 'Other': 5, 'No reported profession': 1140 },
    },
  ],

  'dbt': [
    {
      elementId: 'dbt',
      year: '2024-25',
      grades: { scs: 345, g67: 2875, sheo: 4905, eo: 1400, aaao: 1195, other: 0, total: 10720 },
      coreGrades: { scs: 320, g67: 2480, sheo: 2685, eo: 400, aaao: 50, other: 0, total: 5935 },
      orgs: [
        { orgId: 'dbt',              label: 'DBT (excl. agencies)',      grades: { scs: 320, g67: 2480, sheo: 2685, eo: 400,  aaao: 50,  other: 0, total: 5935 } },
        { orgId: 'acas',             label: 'ACAS',                      grades: { scs: 5,   g67: 60,   sheo: 650,  eo: 305,  aaao: 40,  other: 0, total: 1060 } },
        { orgId: 'companies-house',  label: 'Companies House',           grades: { scs: 10,  g67: 160,  sheo: 595,  eo: 500,  aaao: 600, other: 0, total: 1865 } },
        { orgId: 'insolvency-service', label: 'The Insolvency Service',    grades: { scs: 10,  g67: 175,  sheo: 975,  eo: 195,  aaao: 500, other: 0, total: 1855 } },
      ],
      professions: { 'Operational Delivery': 3755, 'Policy': 3560, 'Digital and Data': 820, 'Counter Fraud': 380, 'Human Resources': 335, 'Finance': 325, 'Project Delivery': 305, 'Economics': 220, 'Communications': 200, 'Commercial': 110, 'Statistics': 90, 'Security': 65, 'Legal': 60, 'Knowledge and Information Management': 60, 'Science and Engineering': 25, 'Intelligence Analysis': 25, 'Social Research': 20, 'Property': 15, 'Operational Research': 10, 'Other': 275, 'No reported profession': 30 },
      coreProfessions: { 'Policy': 3295, 'Operational Delivery': 465, 'Digital and Data': 325, 'Economics': 220, 'Human Resources': 175, 'Finance': 145, 'Project Delivery': 235, 'Communications': 125, 'Commercial': 60, 'Statistics': 75, 'Legal': 50, 'Security': 45, 'Knowledge and Information Management': 50, 'Science and Engineering': 25, 'Intelligence Analysis': 25, 'Social Research': 15 },
    },
    {
      // 2025-26: DSIT was dissolved and its functions absorbed into DBT
      // (core department + Building Digital UK, IPO, Met Office, UK Space
      // Agency), DCMS and the Cabinet Office. elements.ts already parents
      // these agencies under 'dbt', so their 2025-26 headcounts are rolled
      // up here to match.
      elementId: 'dbt',
      year: '2025-26',
      grades: {
        scs: 355 + 245, g67: 3050 + 3600, sheo: 5155 + 3555, eo: 1585 + 940, aaao: 1420 + 175, other: 0,
        total: 11565 + 8515,
      },
      coreGrades: { scs: 325, g67: 2570, sheo: 2605, eo: 360, aaao: 55, other: 0, total: 5915 },
      orgs: [
        { orgId: 'dbt',              label: 'Department for Business and Trade (excl. agencies)', grades: { scs: 325, g67: 2570, sheo: 2605, eo: 360, aaao: 55, other: 0, total: 5915 } },
        { orgId: 'acas',             label: 'Advisory, Conciliation and Arbitration Service', grades: { scs: 10, g67: 65, sheo: 725, eo: 300, aaao: 45, other: 0, total: 1140 } },
        { orgId: 'companies-house',  label: 'Companies House', grades: { scs: 10, g67: 215, sheo: 725, eo: 695, aaao: 775, other: 0, total: 2420 } },
        { orgId: 'insolvency-service', label: 'The Insolvency Service', grades: { scs: 15, g67: 200, sheo: 1095, eo: 225, aaao: 550, other: 0, total: 2085 } },
        { orgId: 'dsit', label: 'Department for Science, Innovation and Technology (excl. agencies) [absorbed into DBT]', grades: { scs: 200, g67: 2120, sheo: 1205, eo: 115, aaao: 10, other: 0, total: 3650 } },
        { orgId: 'building-digital-uk', label: 'Building Digital UK', grades: { scs: 5, g67: 125, sheo: 105, eo: 10, aaao: 0, other: 0, total: 245 } },
        { orgId: 'ipo', label: 'Intellectual Property Office', grades: { scs: 20, g67: 470, sheo: 675, eo: 495, aaao: 110, other: 0, total: 1770 } },
        { orgId: 'met-office', label: 'Met Office', grades: { scs: 10, g67: 740, sheo: 1415, eo: 305, aaao: 55, other: 0, total: 2530 } },
        { orgId: 'uk-space-agency', label: 'UK Space Agency', grades: { scs: 10, g67: 145, sheo: 155, eo: 10, aaao: 0, other: 0, total: 320 } },
      ],
      professions: {
        'Operational Delivery': 4325 + 195, 'Policy': 3495 + 1405, 'Digital and Data': 995 + 1950, 'Counter Fraud': 460, 'Human Resources': 350 + 255, 'Finance': 340 + 195, 'Project Delivery': 310 + 520, 'Economics': 250 + 135, 'Communications': 190 + 230, 'Commercial': 85 + 100, 'Statistics': 115 + 60, 'Security': 45, 'Legal': 70 + 65, 'Knowledge and Information Management': 50 + 45, 'Science and Engineering': 25 + 1515, 'Intelligence Analysis': 30 + 10, 'Social Research': 25 + 55, 'Property': 10 + 20, 'Operational Research': 15 + 25, 'Cyber': 150, 'Risk Management': 0, 'Other': 320 + 335, 'No reported profession': 30,
      },
      // Core = DBT (excl. agencies) + DSIT (excl. agencies), summed since
      // DSIT's core function absorbed into DBT's core department.
      coreProfessions: { 'Commercial': 35 + 25, 'Communications': 105 + 110, 'Corporate Finance': 15, 'Digital and Data': 385 + 1110, 'Economics': 245 + 105, 'Finance': 135 + 100, 'Human Resources': 180 + 95, 'Internal Audit': 30 + 20, 'Operational Delivery': 725 + 195, 'Operational Research': 5 + 20, 'Planning': 15, 'Policy': 3400 + 1185, 'Project Delivery': 185 + 175, 'Property': 5, 'Science and Engineering': 25 + 245, 'Security': 25, 'Social Research': 15, 'Statistics': 75 + 40, 'Cyber': 130, 'Other': 315, 'No reported profession': 0 },
    },
  ],

  'dcms': [
    {
      elementId: 'dcms',
      year: '2024-25',
      grades: { scs: 70, g67: 485, sheo: 405, eo: 95, aaao: 0, other: 0, total: 1060 },
      orgs: [],
      professions: { 'Policy': 585, 'Operational Delivery': 105, 'Finance': 70, 'Human Resources': 60, 'Communications': 50, 'Digital and Data': 40, 'Economics': 40, 'Commercial': 25, 'Social Research': 25, 'Statistics': 20, 'Project Delivery': 15, 'Property': 10, 'Security': 10, 'Knowledge and Information Management': 5, 'Science and Engineering': 5 },
    },
    {
      elementId: 'dcms',
      year: '2025-26',
      grades: { scs: 75, g67: 510, sheo: 465, eo: 100, aaao: 5, other: 0, total: 1155 },
      orgs: [],
      professions: { 'Policy': 645, 'Operational Delivery': 95, 'Finance': 75, 'Human Resources': 50, 'Communications': 60, 'Digital and Data': 45, 'Economics': 75, 'Commercial': 30, 'Social Research': 0, 'Statistics': 10, 'Project Delivery': 10, 'Property': 10, 'Security': 0, 'Knowledge and Information Management': 0, 'Science and Engineering': 0, 'Counter Fraud': 0, 'Other': 30 },
    },
  ],

  'defra': [
    {
      elementId: 'defra',
      year: '2024-25',
      grades: { scs: 240, g67: 3445, sheo: 5675, eo: 2190, aaao: 2390, other: 10, total: 13950 },
      coreGrades: { scs: 215, g67: 2710, sheo: 3390, eo: 430, aaao: 85, other: 10, total: 6840 },
      orgs: [
        { orgId: 'defra', label: 'Defra (excl. agencies)',            grades: { scs: 215, g67: 2710, sheo: 3390, eo: 430,  aaao: 85,  other: 10, total: 6840 } },
        { orgId: 'apha',  label: 'Animal and Plant Health Agency',    grades: { scs: 5,   g67: 320,  sheo: 1215, eo: 905,  aaao: 925, other: 0,  total: 3370 } },
        { orgId: 'cefas', label: 'Centre for Environment, Fisheries and Aquaculture Science', grades: { scs: 5, g67: 155, sheo: 360, eo: 120, aaao: 15, other: 0, total: 655 } },
        { orgId: 'rpa',   label: 'Rural Payments Agency',             grades: { scs: 10,  g67: 185,  sheo: 640,  eo: 715,  aaao: 1345,other: 0,  total: 2895 } },
        { orgId: 'vmd',   label: 'Veterinary Medicines Directorate',  grades: { scs: 0,   g67: 70,   sheo: 65,   eo: 25,   aaao: 25,  other: 0,  total: 190  } },
      ],
      professions: { 'Operational Delivery': 4705, 'Policy': 2795, 'Science and Engineering': 1350, 'Digital and Data': 1105, 'Project Delivery': 645, 'Finance': 540, 'Veterinarian': 495, 'Communications': 375, 'Human Resources': 335, 'Commercial': 330, 'Economics': 215, 'Property': 190, 'Social Research': 110, 'Knowledge and Information Management': 85, 'Statistics': 80, 'Security': 65, 'Corporate Finance': 60, 'Intelligence Analysis': 40, 'Operational Research': 40, 'Planning': 40, 'Counter Fraud': 30, 'Geography': 30, 'Risk Management': 30, 'Internal Audit': 10, 'Clinical': 5, 'Other': 200, 'No reported profession': 50 },
      coreProfessions: { 'Policy': 2575, 'Operational Delivery': 770, 'Science and Engineering': 915, 'Digital and Data': 915, 'Project Delivery': 475, 'Finance': 430, 'Communications': 300, 'Human Resources': 320, 'Commercial': 170, 'Economics': 215, 'Statistics': 60, 'Social Research': 105, 'Knowledge and Information Management': 70, 'Security': 50, 'Corporate Finance': 60, 'Intelligence Analysis': 40, 'Operational Research': 40, 'Planning': 40, 'Counter Fraud': 30, 'Geography': 15, 'Risk Management': 30 },
    },
    {
      elementId: 'defra',
      year: '2025-26',
      grades: { scs: 250, g67: 3465, sheo: 5385, eo: 2045, aaao: 2170, other: 0, total: 13315 },
      coreGrades: { scs: 230, g67: 2715, sheo: 3090, eo: 380, aaao: 60, other: 0, total: 6480 },
      orgs: [
        { orgId: 'defra', label: 'Defra (excl. agencies)', grades: { scs: 230, g67: 2715, sheo: 3090, eo: 380, aaao: 60, other: 0, total: 6480 } },
        { orgId: 'apha', label: 'Animal and Plant Health Agency', grades: { scs: 5, g67: 360, sheo: 1265, eo: 920, aaao: 845, other: 0, total: 3400 } },
        { orgId: 'cefas', label: 'Centre for Environment, Fisheries and Aquaculture Science', grades: { scs: 5, g67: 160, sheo: 355, eo: 105, aaao: 10, other: 0, total: 635 } },
        { orgId: 'rpa', label: 'Rural Payments Agency', grades: { scs: 5, g67: 150, sheo: 600, eo: 605, aaao: 1235, other: 0, total: 2595 } },
        { orgId: 'vmd', label: 'Veterinary Medicines Directorate', grades: { scs: 0, g67: 80, sheo: 70, eo: 30, aaao: 20, other: 0, total: 205 } },
      ],
      professions: { 'Operational Delivery': 4460, 'Policy': 2535, 'Science and Engineering': 1355, 'Digital and Data': 935, 'Project Delivery': 665, 'Finance': 445, 'Veterinarian': 495, 'Communications': 345, 'Human Resources': 310, 'Commercial': 295, 'Economics': 205, 'Property': 180, 'Social Research': 95, 'Knowledge and Information Management': 85, 'Statistics': 40, 'Security': 0, 'Corporate Finance': 60, 'Intelligence Analysis': 15, 'Operational Research': 40, 'Planning': 35, 'Counter Fraud': 25, 'Geography': 25, 'Risk Management': 15, 'Clinical': 5, 'Other': 195, 'No reported profession': 40 },
      coreProfessions: { 'Policy': 2465, 'Operational Delivery': 295, 'Science and Engineering': 155, 'Digital and Data': 825, 'Project Delivery': 450, 'Finance': 395, 'Communications': 270, 'Human Resources': 290, 'Commercial': 155, 'Economics': 205, 'Statistics': 25, 'Social Research': 80, 'Knowledge and Information Management': 60, 'Security': 0, 'Corporate Finance': 55, 'Intelligence Analysis': 0, 'Operational Research': 30, 'Planning': 30, 'Counter Fraud': 25, 'Geography': 20, 'Risk Management': 15 },
    },
  ],

  'desnz': [
    {
      elementId: 'desnz',
      year: '2024-25',
      grades: { scs: 235, g67: 2275, sheo: 2030, eo: 205, aaao: 30, other: 0, total: 4780 },
      orgs: [],
      professions: { 'Policy': 2900, 'Statistics': 630, 'Operational Delivery': 390, 'Project Delivery': 145, 'Human Resources': 140, 'Digital and Data': 130, 'Science and Engineering': 130, 'Finance': 110, 'Communications': 85, 'Knowledge and Information Management': 35, 'Commercial': 30, 'Security': 25, 'Property': 20, 'Counter Fraud': 10 },
    },
    {
      elementId: 'desnz',
      year: '2025-26',
      grades: { scs: 225, g67: 2315, sheo: 2080, eo: 190, aaao: 25, other: 0, total: 4830 },
      orgs: [],
      professions: { 'Policy': 2480, 'Statistics': 0, 'Operational Delivery': 290, 'Project Delivery': 480, 'Human Resources': 170, 'Digital and Data': 170, 'Science and Engineering': 235, 'Finance': 145, 'Communications': 110, 'Knowledge and Information Management': 35, 'Commercial': 40, 'Security': 25, 'Property': 25, 'Counter Fraud': 20, 'Corporate Finance': 25, 'Economics': 195, 'Risk Management': 90, 'Other': 0 },
    },
  ],

  'dfe': [
    {
      elementId: 'dfe',
      year: '2024-25',
      grades: { scs: 275, g67: 3255, sheo: 3875, eo: 705, aaao: 80, other: 0, total: 8185 },
      coreGrades: { scs: 245, g67: 2910, sheo: 3355, eo: 625, aaao: 70, other: 0, total: 7215 },
      orgs: [
        { orgId: 'dfe',   label: 'DfE (excl. agencies)',             grades: { scs: 245, g67: 2910, sheo: 3355, eo: 625, aaao: 70, other: 0, total: 7215 } },
        { orgId: 'esfa',  label: 'Education and Skills Funding Agency', grades: { scs: 10, g67: 135, sheo: 295, eo: 15, aaao: 0, other: 0, total: 460 } },
        { orgId: 'ifate', label: 'Institute for Apprenticeships and Technical Education', grades: { scs: 10, g67: 155, sheo: 95, eo: 10, aaao: 0, other: 0, total: 270 } },
        { orgId: 'sta',   label: 'Standards and Testing Agency',     grades: { scs: 0,   g67: 40,   sheo: 80,   eo: 15,  aaao: 0,  other: 0, total: 140  } },
        { orgId: 'tra',   label: 'Teaching Regulation Agency',       grades: { scs: 0,   g67: 10,   sheo: 45,   eo: 35,  aaao: 10, other: 0, total: 100  } },
      ],
      professions: { 'Operational Delivery': 2125, 'Policy': 1925, 'Project Delivery': 1075, 'Digital and Data': 920, 'Finance': 465, 'Statistics': 250, 'Communications': 230, 'Commercial': 185, 'Human Resources': 150, 'Social Research': 145, 'Operational Research': 110, 'Economics': 105, 'Property': 100, 'Legal': 50, 'Knowledge and Information Management': 35, 'Counter Fraud': 30, 'Science and Engineering': 15, 'Security': 15, 'No reported profession': 260 },
      coreProfessions: { 'Policy': 1835, 'Operational Delivery': 1560, 'Project Delivery': 965, 'Digital and Data': 775, 'Finance': 350, 'Statistics': 205, 'Communications': 205, 'Commercial': 165, 'Human Resources': 145, 'Social Research': 135, 'Operational Research': 110, 'Economics': 105, 'Property': 100, 'Legal': 40, 'Knowledge and Information Management': 35, 'Counter Fraud': 30, 'Security': 15 },
    },
    {
      // Note: Skills England (orgId 'skills-england') is a new sub-org
      // created within DfE's group since 2024-25; the Education and Skills
      // Funding Agency (esfa) and Institute for Apprenticeships (ifate) no
      // longer appear as separate rows in the 2026 release.
      elementId: 'dfe',
      year: '2025-26',
      grades: { scs: 265, g67: 3305, sheo: 3840, eo: 595, aaao: 70, other: 15, total: 8090 },
      coreGrades: { scs: 250, g67: 3125, sheo: 3635, eo: 545, aaao: 60, other: 15, total: 7630 },
      orgs: [
        { orgId: 'dfe', label: 'Department for Education (excl. agencies)', grades: { scs: 250, g67: 3125, sheo: 3635, eo: 545, aaao: 60, other: 15, total: 7630 } },
        { orgId: 'skills-england', label: 'Skills England', grades: { scs: 10, g67: 130, sheo: 85, eo: 5, aaao: 0, other: 0, total: 235 } },
        { orgId: 'sta', label: 'Standards and Testing Agency', grades: { scs: 5, g67: 35, sheo: 80, eo: 15, aaao: 0, other: 0, total: 140 } },
        { orgId: 'tra', label: 'Teaching Regulation Agency', grades: { scs: 0, g67: 10, sheo: 35, eo: 25, aaao: 5, other: 0, total: 80 } },
      ],
      professions: { 'Operational Delivery': 1875, 'Policy': 1850, 'Project Delivery': 995, 'Digital and Data': 870, 'Finance': 475, 'Statistics': 120, 'Communications': 225, 'Commercial': 160, 'Human Resources': 135, 'Social Research': 140, 'Operational Research': 15, 'Economics': 110, 'Property': 15, 'Legal': 30, 'Knowledge and Information Management': 50, 'Counter Fraud': 35, 'Science and Engineering': 0, 'Security': 0, 'No reported profession': 595 },
      coreProfessions: { 'Policy': 1760, 'Operational Delivery': 115, 'Project Delivery': 860, 'Digital and Data': 110, 'Finance': 465, 'Statistics': 135, 'Communications': 215, 'Commercial': 265, 'Human Resources': 135, 'Social Research': 100, 'Operational Research': 15, 'Economics': 15, 'Property': 15, 'Legal': 30, 'Knowledge and Information Management': 30, 'Counter Fraud': 0, 'Science and Engineering': 0, 'Security': 0 },
    },
  ],

  'dft': [
    {
      elementId: 'dft',
      year: '2024-25',
      grades: { scs: 295, g67: 2395, sheo: 4375, eo: 4050, aaao: 5415, other: 0, total: 16535 },
      coreGrades: { scs: 265, g67: 1670, sheo: 1510, eo: 275, aaao: 140, other: 0, total: 3855 },
      orgs: [
        { orgId: 'dft',  label: 'DfT (excl. agencies)',              grades: { scs: 265, g67: 1670, sheo: 1510, eo: 275,  aaao: 140,  other: 0, total: 3855 } },
        { orgId: 'dvla', label: 'Driver and Vehicle Licensing Agency',grades: { scs: 10,  g67: 330,  sheo: 1070, eo: 885,  aaao: 3855, other: 0, total: 6150 } },
        { orgId: 'dvsa', label: 'Driver and Vehicle Standards Agency',grades: { scs: 10,  g67: 160,  sheo: 1085, eo: 2610, aaao: 1095, other: 0, total: 4955 } },
        { orgId: 'maritime-coastguard', label: 'Maritime and Coastguard Agency',    grades: { scs: 10,  g67: 180,  sheo: 575,  eo: 205,  aaao: 280,  other: 0, total: 1250 } },
        { orgId: 'vca',  label: 'Vehicle Certification Agency',      grades: { scs: 0,   g67: 20,   sheo: 105,  eo: 75,   aaao: 40,   other: 0, total: 235  } },
        { orgId: 'active-travel-england', label: 'Active Travel England',             grades: { scs: 0,   g67: 45,   sheo: 35,   eo: 5,    aaao: 0,    other: 0, total: 85   } },
      ],
      professions: { 'Operational Delivery': 9440, 'Policy': 1510, 'Digital and Data': 1295, 'Project Delivery': 560, 'Human Resources': 465, 'Finance': 380, 'Security': 325, 'Commercial': 255, 'Communications': 235, 'Science and Engineering': 210, 'Economics': 175, 'Property': 170, 'Counter Fraud': 105, 'Statistics': 90, 'Planning': 80, 'Social Research': 55, 'Clinical': 50, 'Knowledge and Information Management': 50, 'Operational Research': 40, 'Corporate Finance': 15, 'Legal': 5, 'Other': 40, 'No reported profession': 965 },
      coreProfessions: { 'Policy': 1200, 'Operational Delivery': 185, 'Project Delivery': 395, 'Digital and Data': 360, 'Economics': 175, 'Finance': 155, 'Human Resources': 135, 'Communications': 150, 'Commercial': 115, 'Security': 80, 'Science and Engineering': 100, 'Statistics': 60, 'Property': 55, 'Social Research': 40, 'Operational Research': 30, 'Planning': 30, 'Corporate Finance': 15 },
    },
    {
      elementId: 'dft',
      year: '2025-26',
      grades: { scs: 280, g67: 2380, sheo: 4365, eo: 4205, aaao: 5380, other: 0, total: 16610 },
      coreGrades: { scs: 240, g67: 1580, sheo: 1330, eo: 210, aaao: 30, other: 0, total: 3385 },
      orgs: [
        { orgId: 'dft', label: 'Department for Transport (excl. agencies)', grades: { scs: 240, g67: 1580, sheo: 1330, eo: 210, aaao: 30, other: 0, total: 3385 } },
        { orgId: 'dvla', label: 'Driver and Vehicle Licensing Agency', grades: { scs: 10, g67: 330, sheo: 1070, eo: 885, aaao: 3890, other: 0, total: 6185 } },
        { orgId: 'dvsa', label: 'Driver and Vehicle Standards Agency', grades: { scs: 10, g67: 195, sheo: 1160, eo: 2845, aaao: 1135, other: 0, total: 5350 } },
        { orgId: 'maritime-coastguard', label: 'Maritime and Coastguard Agency', grades: { scs: 10, g67: 210, sheo: 610, eo: 190, aaao: 290, other: 0, total: 1315 } },
        { orgId: 'vca', label: 'Vehicle Certification Agency', grades: { scs: 0, g67: 20, sheo: 145, eo: 70, aaao: 35, other: 0, total: 275 } },
        { orgId: 'active-travel-england', label: 'Active Travel England', grades: { scs: 5, g67: 45, sheo: 50, eo: 0, aaao: 0, other: 0, total: 105 } },
      ],
      professions: { 'Operational Delivery': 8985, 'Policy': 1700, 'Digital and Data': 1410, 'Project Delivery': 630, 'Human Resources': 475, 'Finance': 415, 'Security': 1140, 'Commercial': 340, 'Communications': 265, 'Science and Engineering': 0, 'Economics': 160, 'Property': 0, 'Counter Fraud': 90, 'Statistics': 80, 'Planning': 80, 'Social Research': 0, 'Clinical': 50, 'Knowledge and Information Management': 30, 'Operational Research': 30, 'Corporate Finance': 0, 'Legal': 20, 'Other': 75, 'No reported profession': 90 },
      coreProfessions: { 'Commercial': 105, 'Digital and Data': 155, 'Economics': 155, 'Finance': 145, 'Human Resources': 155, 'Legal': 20, 'Operational Delivery': 205, 'Operational Research': 30, 'Planning': 65, 'Policy': 1280, 'Project Delivery': 440, 'Property': 25, 'Science and Engineering': 95, 'Security': 125, 'Social Research': 50, 'Statistics': 80, 'Other': 80, 'No reported profession': 70 },
    },
  ],

  'dhsc': [
    {
      elementId: 'dhsc',
      year: '2024-25',
      grades: { scs: 700, g67: 4105, sheo: 4480, eo: 1225, aaao: 600, other: 0, total: 11115 },
      coreGrades: { scs: 235, g67: 1675, sheo: 1455, eo: 305, aaao: 30, other: 0, total: 3695 },
      orgs: [
        { orgId: 'dhsc',  label: 'DHSC (excl. agencies)',            grades: { scs: 235, g67: 1675, sheo: 1455, eo: 305, aaao: 30,  other: 0, total: 3695 } },
        { orgId: 'mhra',  label: 'Medicines and Healthcare Products Regulatory Agency', grades: { scs: 145, g67: 545, sheo: 560, eo: 210, aaao: 25, other: 0, total: 1480 } },
        { orgId: 'uk-health-security', label: 'UK Health Security Agency',        grades: { scs: 325, g67: 1885, sheo: 2465, eo: 715, aaao: 550, other: 0, total: 5935 } },
      ],
      professions: { 'Science and Engineering': 3160, 'Operational Delivery': 1895, 'Policy': 690, 'Digital and Data': 560, 'Clinical': 505, 'Finance': 340, 'Human Resources': 300, 'Project Delivery': 285, 'Communications': 245, 'Statistics': 210, 'Commercial': 185, 'Economics': 125, 'Knowledge and Information Management': 120, 'Operational Research': 105, 'Property': 90, 'Social Research': 75, 'Internal Audit': 50, 'Legal': 40, 'Security': 30, 'Corporate Finance': 20, 'Intelligence Analysis': 20, 'Planning': 20, 'Counter Fraud': 10, 'Geography': 10, 'Other': 75, 'No reported profession': 1930 },
      coreProfessions: { 'Policy': 545, 'Operational Delivery': 285, 'Digital and Data': 290, 'Finance': 165, 'Communications': 120, 'Human Resources': 140, 'Project Delivery': 165, 'Statistics': 75, 'Economics': 100, 'Knowledge and Information Management': 75, 'Social Research': 50, 'Legal': 25, 'Security': 20, 'Commercial': 60, 'Operational Research': 30, 'Property': 25 },
    },
    {
      elementId: 'dhsc',
      year: '2025-26',
      grades: { scs: 690, g67: 3960, sheo: 4330, eo: 1165, aaao: 560, other: 0, total: 10705 },
      coreGrades: { scs: 220, g67: 1485, sheo: 1265, eo: 275, aaao: 25, other: 0, total: 3275 },
      orgs: [
        { orgId: 'dhsc', label: 'Department of Health and Social Care (excl. agencies)', grades: { scs: 220, g67: 1485, sheo: 1265, eo: 275, aaao: 25, other: 0, total: 3275 } },
        { orgId: 'mhra', label: 'Medicines and Healthcare Products Regulatory Agency', grades: { scs: 150, g67: 605, sheo: 620, eo: 210, aaao: 25, other: 0, total: 1610 } },
        { orgId: 'uk-health-security', label: 'UK Health Security Agency', grades: { scs: 315, g67: 1870, sheo: 2445, eo: 680, aaao: 510, other: 0, total: 5820 } },
      ],
      professions: { 'Science and Engineering': 2875, 'Operational Delivery': 1850, 'Policy': 670, 'Digital and Data': 575, 'Clinical': 590, 'Finance': 285, 'Human Resources': 290, 'Project Delivery': 285, 'Communications': 185, 'Statistics': 150, 'Commercial': 160, 'Economics': 95, 'Knowledge and Information Management': 115, 'Operational Research': 105, 'Property': 0, 'Social Research': 0, 'Internal Audit': 0, 'Legal': 0, 'Security': 0, 'Corporate Finance': 0, 'Intelligence Analysis': 40, 'Planning': 20, 'Counter Fraud': 15, 'Geography': 10, 'Other': 45, 'No reported profession': 2070 },
      coreProfessions: { 'Policy': 470, 'Operational Delivery': 50, 'Digital and Data': 60, 'Finance': 90, 'Communications': 25, 'Human Resources': 70, 'Project Delivery': 95, 'Statistics': 120, 'Economics': 80, 'Knowledge and Information Management': 20, 'Social Research': 40, 'Legal': 0, 'Security': 0, 'Commercial': 35, 'Operational Research': 0, 'Property': 0, 'Clinical': 155, 'Internal Audit': 5 },
    },
  ],

  'dluhc': [
    {
      elementId: 'dluhc',
      year: '2024-25',
      grades: { scs: 190, g67: 2375, sheo: 1790, eo: 380, aaao: 210, other: 0, total: 4945 },
      coreGrades: { scs: 180, g67: 1850, sheo: 1560, eo: 260, aaao: 45, other: 0, total: 3900 },
      orgs: [
        { orgId: 'dluhc', label: 'MHCLG (excl. agencies)',           grades: { scs: 180, g67: 1850, sheo: 1560, eo: 260, aaao: 45,  other: 0, total: 3900 } },
        { orgId: 'planning-inspectorate', label: 'Planning Inspectorate',            grades: { scs: 5,   g67: 520,  sheo: 200,  eo: 105, aaao: 160, other: 0, total: 995  } },
        { orgId: '',      label: 'Queen Elizabeth II Centre',        grades: { scs: 0,   g67: 0,    sheo: 30,   eo: 15,  aaao: 0,   other: 0, total: 50   } },
      ],
      professions: { 'Policy': 2045, 'Operational Delivery': 650, 'Planning Inspectors': 485, 'Digital and Data': 470, 'Project Delivery': 260, 'Finance': 155, 'Planning': 140, 'Human Resources': 130, 'Communications': 120, 'Statistics': 120, 'Economics': 80, 'Social Research': 60, 'Commercial': 55, 'Knowledge and Information Management': 55, 'Operational Research': 15, 'Security': 15, 'Property': 10, 'Corporate Finance': 5, 'Counter Fraud': 5, 'Other': 65 },
      coreProfessions: { 'Policy': 1985, 'Operational Delivery': 140, 'Digital and Data': 440, 'Project Delivery': 245, 'Finance': 145, 'Planning': 130, 'Human Resources': 125, 'Communications': 110, 'Statistics': 110, 'Economics': 80, 'Social Research': 55, 'Commercial': 50, 'Knowledge and Information Management': 50, 'Operational Research': 15, 'Security': 15, 'Property': 10 },
    },
    {
      elementId: 'dluhc',
      year: '2025-26',
      grades: { scs: 200, g67: 2470, sheo: 1735, eo: 320, aaao: 195, other: 0, total: 4915 },
      coreGrades: { scs: 190, g67: 1910, sheo: 1435, eo: 210, aaao: 35, other: 0, total: 3780 },
      orgs: [
        { orgId: 'dluhc', label: 'Ministry of Housing, Communities and Local Government (excl. agencies)', grades: { scs: 190, g67: 1910, sheo: 1435, eo: 210, aaao: 35, other: 0, total: 3780 } },
        { orgId: 'planning-inspectorate', label: 'Planning Inspectorate', grades: { scs: 5, g67: 555, sheo: 270, eo: 100, aaao: 155, other: 0, total: 1085 } },
        { orgId: '', label: 'Queen Elizabeth II Centre', grades: { scs: 0, g67: 0, sheo: 30, eo: 15, aaao: 0, other: 0, total: 50 } },
      ],
      professions: { 'Policy': 2010, 'Operational Delivery': 605, 'Planning Inspectors': 505, 'Digital and Data': 570, 'Project Delivery': 225, 'Finance': 150, 'Planning': 115, 'Human Resources': 135, 'Communications': 110, 'Statistics': 0, 'Social Research': 0, 'Commercial': 50, 'Knowledge and Information Management': 60, 'Operational Research': 20, 'Security': 0, 'Property': 0, 'Corporate Finance': 0, 'Counter Fraud': 5, 'Other': 0, 'No reported profession': 0 },
      coreProfessions: { 'Policy': 1905, 'Operational Delivery': 245, 'Digital and Data': 430, 'Project Delivery': 215, 'Finance': 130, 'Planning': 100, 'Human Resources': 100, 'Communications': 100, 'Commercial': 30, 'Knowledge and Information Management': 45, 'Operational Research': 20 },
    },
  ],

  'dwp': [
    {
      elementId: 'dwp',
      year: '2024-25',
      grades: { scs: 360, g67: 5490, sheo: 16980, eo: 50100, aaao: 23960, other: 0, total: 96890 },
      coreGrades: { scs: 320, g67: 4850, sheo: 15375, eo: 49570, aaao: 23690, other: 0, total: 93805 },
      orgs: [
        { orgId: 'dwp', label: 'DWP (excl. agencies)',               grades: { scs: 320, g67: 4850, sheo: 15375, eo: 49570, aaao: 23690, other: 0, total: 93805 } },
        { orgId: 'hse', label: 'Health and Safety Executive',        grades: { scs: 40,  g67: 640,  sheo: 1605,  eo: 530,   aaao: 270,   other: 0, total: 3085  } },
      ],
      professions: { 'Operational Delivery': 75180, 'Counter Fraud': 6745, 'Digital and Data': 4050, 'Human Resources': 1880, 'Project Delivery': 1370, 'Finance': 1305, 'Policy': 1235, 'Science and Engineering': 545, 'Security': 465, 'Commercial': 305, 'Property': 270, 'Statistics': 245, 'Economics': 230, 'Social Research': 195, 'Communications': 185, 'Knowledge and Information Management': 165, 'Operational Research': 160, 'Clinical': 50, 'Legal': 50, 'Risk Management': 45, 'Intelligence Analysis': 35, 'Internal Audit': 10, 'Other': 1775, 'No reported profession': 305 },
      coreProfessions: { 'Operational Delivery': 72525, 'Counter Fraud': 6590, 'Digital and Data': 3730, 'Human Resources': 1750, 'Project Delivery': 1270, 'Finance': 1195, 'Policy': 1145, 'Science and Engineering': 430, 'Security': 430, 'Commercial': 280, 'Property': 240, 'Statistics': 230, 'Economics': 215, 'Social Research': 180, 'Communications': 170, 'Knowledge and Information Management': 155, 'Operational Research': 145, 'Risk Management': 35, 'Intelligence Analysis': 30 },
    },
    {
      elementId: 'dwp',
      year: '2025-26',
      grades: { scs: 365, g67: 5980, sheo: 17720, eo: 49360, aaao: 23505, other: 0, total: 96930 },
      coreGrades: { scs: 325, g67: 5280, sheo: 15995, eo: 48820, aaao: 23240, other: 0, total: 93655 },
      orgs: [
        { orgId: 'dwp', label: 'Department for Work and Pensions (excl. agencies)', grades: { scs: 325, g67: 5280, sheo: 15995, eo: 48820, aaao: 23240, other: 0, total: 93655 } },
        { orgId: 'hse', label: 'Health and Safety Executive', grades: { scs: 45, g67: 705, sheo: 1720, eo: 535, aaao: 265, other: 0, total: 3270 } },
      ],
      professions: { 'Operational Delivery': 71505, 'Counter Fraud': 8435, 'Digital and Data': 4650, 'Human Resources': 1990, 'Project Delivery': 1410, 'Finance': 1580, 'Policy': 1385, 'Science and Engineering': 535, 'Security': 210, 'Commercial': 250, 'Property': 0, 'Statistics': 255, 'Economics': 230, 'Social Research': 0, 'Communications': 200, 'Knowledge and Information Management': 105, 'Operational Research': 160, 'Clinical': 45, 'Legal': 75, 'Risk Management': 0, 'Intelligence Analysis': 25, 'Internal Audit': 5, 'Debt': 2620, 'Other': 20, 'No reported profession': 80 },
      coreProfessions: { 'Clinical': 45, 'Commercial': 225, 'Communications': 155, 'Counter Fraud': 8435, 'Debt': 2620, 'Digital and Data': 4515, 'Economics': 220, 'Finance': 1550, 'Human Resources': 1925, 'Intelligence Analysis': 25, 'Internal Audit': 5, 'Knowledge and Information Management': 80, 'Operational Delivery': 69335, 'Operational Research': 160, 'Policy': 1290, 'Project Delivery': 1390, 'Property': 440, 'Risk Management': 120, 'Security': 460, 'Social Research': 210, 'Statistics': 235, 'Other': 20, 'No reported profession': 80 },
    },
  ],

  'fcdo': [
    {
      elementId: 'fcdo',
      year: '2024-25',
      grades: { scs: 575, g67: 3620, sheo: 3710, eo: 1025, aaao: 505, other: 0, total: 9435 },
      coreGrades: { scs: 565, g67: 3365, sheo: 3160, eo: 705, aaao: 360, other: 0, total: 8150 },
      orgs: [
        { orgId: 'fcdo',          label: 'FCDO (excl. agencies)',    grades: { scs: 565, g67: 3365, sheo: 3160, eo: 705, aaao: 360, other: 0, total: 8150 } },
        { orgId: '',              label: 'FCDO Services',            grades: { scs: 10,  g67: 240,  sheo: 520,  eo: 290, aaao: 135, other: 0, total: 1195 } },
        { orgId: '',              label: 'Wilton Park',              grades: { scs: 0,   g67: 15,   sheo: 30,   eo: 25,  aaao: 15,  other: 0, total: 90   } },
      ],
      professions: { 'Policy': 2460, 'Project Delivery': 1175, 'Operational Delivery': 1050, 'Security': 985, 'Human Resources': 745, 'Digital and Data': 370, 'Finance': 300, 'Property': 230, 'Commercial': 220, 'Economics': 220, 'Communications': 180, 'Knowledge and Information Management': 175, 'Internal Audit': 85, 'Risk Management': 65, 'Corporate Finance': 60, 'Legal': 55, 'Social Research': 45, 'Science and Engineering': 35, 'Other': 290, 'No reported profession': 700 },
      coreProfessions: { 'Policy': 2310, 'Project Delivery': 1045, 'Operational Delivery': 810, 'Security': 885, 'Human Resources': 665, 'Digital and Data': 290, 'Finance': 265, 'Property': 195, 'Commercial': 195, 'Economics': 210, 'Communications': 160, 'Knowledge and Information Management': 165, 'Internal Audit': 75, 'Risk Management': 60, 'Corporate Finance': 55, 'Legal': 50, 'Social Research': 40, 'Science and Engineering': 30 },
    },
    {
      elementId: 'fcdo',
      year: '2025-26',
      grades: { scs: 530, g67: 3490, sheo: 3550, eo: 885, aaao: 440, other: 0, total: 8890 },
      coreGrades: { scs: 515, g67: 3255, sheo: 2955, eo: 580, aaao: 310, other: 0, total: 7620 },
      orgs: [
        { orgId: 'fcdo', label: 'Foreign, Commonwealth and Development Office (excl. agencies)', grades: { scs: 515, g67: 3255, sheo: 2955, eo: 580, aaao: 310, other: 0, total: 7620 } },
        { orgId: '', label: 'FCDO Services', grades: { scs: 5, g67: 220, sheo: 560, eo: 280, aaao: 120, other: 0, total: 1185 } },
        { orgId: '', label: 'Wilton Park', grades: { scs: 0, g67: 10, sheo: 35, eo: 30, aaao: 10, other: 0, total: 85 } },
      ],
      professions: { 'Policy': 2505, 'Project Delivery': 1235, 'Operational Delivery': 855, 'Security': 850, 'Human Resources': 630, 'Digital and Data': 430, 'Finance': 265, 'Property': 225, 'Commercial': 195, 'Economics': 215, 'Communications': 160, 'Knowledge and Information Management': 145, 'Internal Audit': 0, 'Risk Management': 0, 'Corporate Finance': 30, 'Legal': 0, 'Social Research': 0, 'Science and Engineering': 0, 'Cyber': 80, 'Intelligence Analysis': 85, 'Other': 310, 'No reported profession': 420 },
      coreProfessions: { 'Commercial': 115, 'Communications': 135, 'Corporate Finance': 70, 'Cyber': 80, 'Digital and Data': 250, 'Economics': 215, 'Finance': 215, 'Human Resources': 580, 'Intelligence Analysis': 60, 'Internal Audit': 80, 'Knowledge and Information Management': 55, 'Operational Delivery': 855, 'Policy': 2490, 'Project Delivery': 1130, 'Property': 10, 'Risk Management': 60, 'Security': 460, 'Social Research': 45, 'Statistics': 25, 'Other': 270, 'No reported profession': 420 },
    },
  ],

  'home-office': [
    {
      elementId: 'home-office',
      year: '2024-25',
      grades: { scs: 370, g67: 5095, sheo: 13940, eo: 21155, aaao: 9950, other: 140, total: 50655 },
      orgs: [],
      professions: { 'Operational Delivery': 37360, 'Policy': 2660, 'Digital and Data': 2325, 'Project Delivery': 2080, 'Intelligence Analysis': 1490, 'Human Resources': 730, 'Security': 365, 'Finance': 360, 'Counter Fraud': 205, 'Social Research': 205, 'Communications': 180, 'Economics': 180, 'Commercial': 165, 'Statistics': 140, 'Operational Research': 120, 'Science and Engineering': 115, 'Knowledge and Information Management': 105, 'Property': 85, 'Other': 1660, 'No reported profession': 125 },
    },
    {
      elementId: 'home-office',
      year: '2025-26',
      grades: { scs: 370, g67: 5600, sheo: 14455, eo: 20790, aaao: 10105, other: 150, total: 51470 },
      orgs: [],
      professions: { 'Operational Delivery': 37595, 'Policy': 2705, 'Digital and Data': 2865, 'Project Delivery': 2175, 'Intelligence Analysis': 1420, 'Human Resources': 600, 'Security': 215, 'Finance': 375, 'Counter Fraud': 210, 'Social Research': 0, 'Communications': 180, 'Economics': 200, 'Commercial': 185, 'Statistics': 0, 'Operational Research': 130, 'Science and Engineering': 135, 'Knowledge and Information Management': 115, 'Property': 0, 'Other': 1640, 'No reported profession': 130 },
    },
  ],

  'mod': [
    {
      elementId: 'mod',
      year: '2024-25',
      grades: { scs: 560, g67: 9130, sheo: 23675, eo: 8255, aaao: 14455, other: 1425, total: 57500 },
      coreGrades: { scs: 405, g67: 3940, sheo: 12960, eo: 6475, aaao: 12570, other: 25, total: 36375 },
      orgs: [
        { orgId: 'mod',  label: 'MoD (excl. agencies)',              grades: { scs: 405, g67: 3940, sheo: 12960, eo: 6475, aaao: 12570, other: 25,   total: 36375 } },
        { orgId: 'dstl', label: 'Defence Science and Technology Laboratory', grades: { scs: 5, g67: 2420, sheo: 2285, eo: 265, aaao: 60, other: 50, total: 5085 } },
        { orgId: 'des',  label: 'Defence Equipment and Support',     grades: { scs: 105, g67: 2010, sheo: 6390, eo: 925,  aaao: 1525, other: 0,    total: 10950 } },
        { orgId: '',     label: 'Royal Fleet Auxiliary',             grades: { scs: 0,   g67: 30,   sheo: 150,  eo: 160,  aaao: 155,  other: 1135, total: 1635  } },
        { orgId: 'sda',  label: 'Submarine Delivery Agency',         grades: { scs: 40,  g67: 605,  sheo: 1370, eo: 155,  aaao: 100,  other: 215,  total: 2480  } },
        { orgId: 'uk-hydrographic', label: 'UK Hydrographic Office',            grades: { scs: 5,   g67: 125,  sheo: 525,  eo: 275,  aaao: 45,   other: 0,    total: 975   } },
      ],
      professions: { 'Operational Delivery': 14245, 'Science and Engineering': 7310, 'Security': 6320, 'Project Delivery': 5920, 'Digital and Data': 3030, 'Property': 2795, 'Finance': 2375, 'Commercial': 2170, 'Clinical': 1665, 'Policy': 1595, 'Human Resources': 1390, 'Intelligence Analysis': 1230, 'Communications': 905, 'Knowledge and Information Management': 860, 'Geography': 500, 'Statistics': 270, 'Operational Research': 55, 'Legal': 50, 'Counter Fraud': 25, 'Social Research': 15, 'Internal Audit': 10, 'Corporate Finance': 5, 'Other': 3365, 'No reported profession': 1380 },
      coreProfessions: { 'Operational Delivery': 10785, 'Security': 4450, 'Science and Engineering': 3020, 'Project Delivery': 2915, 'Property': 2095, 'Finance': 1705, 'Commercial': 955, 'Digital and Data': 2125, 'Clinical': 1665, 'Policy': 1250, 'Human Resources': 1085, 'Intelligence Analysis': 900, 'Communications': 540, 'Knowledge and Information Management': 680, 'Geography': 0, 'Statistics': 215, 'Operational Research': 35, 'Legal': 40, 'Counter Fraud': 25, 'Social Research': 10 },
    },
    {
      elementId: 'mod',
      year: '2025-26',
      grades: { scs: 580, g67: 9315, sheo: 23525, eo: 8050, aaao: 13950, other: 1500, total: 56915 },
      coreGrades: { scs: 420, g67: 4135, sheo: 13230, eo: 6345, aaao: 12310, other: 30, total: 36470 },
      orgs: [
        { orgId: 'mod', label: 'Ministry of Defence (excl. agencies)', grades: { scs: 420, g67: 4135, sheo: 13230, eo: 6345, aaao: 12310, other: 30, total: 36470 } },
        { orgId: 'dstl', label: 'Defence Science and Technology Laboratory', grades: { scs: 5, g67: 2430, sheo: 2175, eo: 215, aaao: 15, other: 0, total: 4840 } },
        { orgId: 'des', label: 'Defence Equipment and Support', grades: { scs: 105, g67: 1985, sheo: 6070, eo: 925, aaao: 1340, other: 0, total: 10425 } },
        { orgId: '', label: 'Royal Fleet Auxiliary', grades: { scs: 0, g67: 35, sheo: 150, eo: 155, aaao: 150, other: 1190, total: 1685 } },
        { orgId: 'sda', label: 'Submarine Delivery Agency', grades: { scs: 45, g67: 615, sheo: 1370, eo: 155, aaao: 80, other: 275, total: 2535 } },
        { orgId: 'uk-hydrographic', label: 'UK Hydrographic Office', grades: { scs: 5, g67: 120, sheo: 530, eo: 250, aaao: 50, other: 0, total: 955 } },
      ],
      professions: { 'Operational Delivery': 13850, 'Science and Engineering': 7240, 'Security': 285, 'Project Delivery': 5565, 'Digital and Data': 3085, 'Property': 0, 'Finance': 2540, 'Commercial': 2055, 'Clinical': 1740, 'Policy': 1550, 'Human Resources': 1360, 'Intelligence Analysis': 0, 'Communications': 905, 'Knowledge and Information Management': 905, 'Geography': 510, 'Statistics': 600, 'Operational Research': 0, 'Legal': 45, 'Counter Fraud': 25, 'Social Research': 0, 'Internal Audit': 15, 'Corporate Finance': 0, 'Cyber': 0, 'Other': 3960, 'No reported profession': 415 },
      coreProfessions: { 'Clinical': 1740, 'Commercial': 895, 'Communications': 550, 'Counter Fraud': 25, 'Digital and Data': 2190, 'Finance': 1530, 'Human Resources': 1005, 'Intelligence Analysis': 750, 'Internal Audit': 5, 'Knowledge and Information Management': 770, 'Legal': 35, 'Operational Delivery': 10110, 'Operational Research': 60, 'Policy': 1530, 'Project Delivery': 2780, 'Property': 2720, 'Science and Engineering': 1305, 'Security': 6200, 'Social Research': 15, 'Statistics': 285, 'Other': 1960, 'No reported profession': 20 },
    },
  ],

  'moj': [
    {
      elementId: 'moj',
      year: '2024-25',
      grades: { scs: 320, g67: 4565, sheo: 15680, eo: 12055, aaao: 40555, other: 23040, total: 96210 },
      coreGrades: { scs: 180, g67: 2680, sheo: 4210, eo: 770, aaao: 335, other: 30, total: 8210 },
      orgs: [
        { orgId: 'moj',   label: 'MoJ (excl. agencies)',             grades: { scs: 180, g67: 2680, sheo: 4210, eo: 770,  aaao: 335,   other: 30,    total: 8210  } },
        { orgId: 'cica',  label: 'Criminal Injuries Compensation Authority', grades: { scs: 0, g67: 10, sheo: 85, eo: 90, aaao: 140, other: 0, total: 325 } },
        { orgId: 'hmcts', label: 'HM Courts and Tribunals Service',  grades: { scs: 70,  g67: 825,  sheo: 3080, eo: 2825, aaao: 9060,  other: 0,     total: 15860 } },
        { orgId: 'legal-aid', label: 'Legal Aid Agency',                 grades: { scs: 10,  g67: 95,   sheo: 355,  eo: 385,  aaao: 470,   other: 0,     total: 1315  } },
        { orgId: 'hmpps', label: 'HM Prison and Probation Service',  grades: { scs: 55,  g67: 900,  sheo: 7760, eo: 7505, aaao: 29465, other: 23005, total: 68690 } },
        { orgId: 'opg',   label: 'Office of the Public Guardian',    grades: { scs: 0,   g67: 55,   sheo: 190,  eo: 475,  aaao: 1085,  other: 0,     total: 1810  } },
      ],
      professions: { 'Operational Delivery': 84150, 'Digital and Data': 2270, 'Policy': 1340, 'Legal': 1330, 'Occupational Psychology': 1315, 'Human Resources': 1160, 'Finance': 835, 'Commercial': 645, 'Project Delivery': 495, 'Property': 440, 'Intelligence Analysis': 380, 'Communications': 310, 'Statistics': 160, 'Social Research': 115, 'Operational Research': 85, 'Economics': 65, 'Knowledge and Information Management': 195, 'Security': 175, 'Other': 200, 'No reported profession': 540 },
      coreProfessions: { 'Policy': 1075, 'Operational Delivery': 1515, 'Digital and Data': 1105, 'Legal': 705, 'Human Resources': 570, 'Finance': 360, 'Commercial': 295, 'Project Delivery': 315, 'Property': 260, 'Communications': 155, 'Intelligence Analysis': 175, 'Statistics': 100, 'Operational Research': 50, 'Economics': 55, 'Knowledge and Information Management': 105, 'Security': 120 },
    },
    {
      elementId: 'moj',
      year: '2025-26',
      grades: { scs: 320, g67: 4950, sheo: 16225, eo: 12585, aaao: 39625, other: 23800, total: 97505 },
      coreGrades: { scs: 190, g67: 2885, sheo: 4325, eo: 685, aaao: 305, other: 30, total: 8420 },
      orgs: [
        { orgId: 'moj', label: 'Ministry of Justice (excl. agencies)', grades: { scs: 190, g67: 2885, sheo: 4325, eo: 685, aaao: 305, other: 30, total: 8420 } },
        { orgId: 'cica', label: 'Criminal Injuries Compensation Authority', grades: { scs: 0, g67: 10, sheo: 110, eo: 115, aaao: 150, other: 0, total: 385 } },
        { orgId: 'hmcts', label: 'HM Courts and Tribunals Service', grades: { scs: 60, g67: 935, sheo: 3280, eo: 3215, aaao: 9000, other: 0, total: 16490 } },
        { orgId: 'legal-aid', label: 'Legal Aid Agency', grades: { scs: 10, g67: 95, sheo: 370, eo: 420, aaao: 465, other: 0, total: 1355 } },
        { orgId: 'hmpps', label: 'HM Prison and Probation Service', grades: { scs: 55, g67: 970, sheo: 7930, eo: 7650, aaao: 28605, other: 23770, total: 68980 } },
        { orgId: 'opg', label: 'Office of the Public Guardian', grades: { scs: 5, g67: 50, sheo: 210, eo: 495, aaao: 1105, other: 0, total: 1870 } },
      ],
      professions: { 'Operational Delivery': 82290, 'Digital and Data': 2895, 'Policy': 1430, 'Legal': 1995, 'Occupational Psychology': 1460, 'Human Resources': 0, 'Finance': 955, 'Commercial': 400, 'Project Delivery': 765, 'Property': 0, 'Intelligence Analysis': 490, 'Communications': 560, 'Statistics': 165, 'Social Research': 0, 'Operational Research': 100, 'Economics': 90, 'Knowledge and Information Management': 305, 'Security': 15, 'Other': 1780, 'No reported profession': 440, 'Risk Management': 20, 'Internal Audit': 90, 'Debt': 0, 'Counter Fraud': 0, 'Actuary': 0 },
      coreProfessions: { 'Commercial': 275, 'Communications': 260, 'Digital and Data': 2160, 'Economics': 90, 'Finance': 570, 'Human Resources': 1015, 'Knowledge and Information Management': 150, 'Legal': 120, 'Occupational Psychology': 15, 'Operational Delivery': 1120, 'Operational Research': 145, 'Policy': 1005, 'Project Delivery': 490, 'Property': 280, 'Risk Management': 20, 'Science and Engineering': 5, 'Security': 70, 'Social Research': 145, 'Statistics': 205, 'Other': 140, 'No reported profession': 115 },
    },
  ],

  'ni-office': [
    {
      elementId: 'ni-office',
      year: '2024-25',
      grades: { scs: 15, g67: 55, sheo: 80, eo: 15, aaao: 5, other: 0, total: 175 },
      orgs: [],
      professions: { 'Policy': 55, 'Operational Delivery': 45, 'Communications': 10, 'Finance': 5, 'Human Resources': 5, 'Knowledge and Information Management': 5, 'Other': 35 },
    },
    {
      elementId: 'ni-office',
      year: '2025-26',
      grades: { scs: 20, g67: 60, sheo: 90, eo: 15, aaao: 0, other: 0, total: 185 },
      orgs: [],
      professions: { 'Policy': 60, 'Operational Delivery': 60, 'Communications': 10, 'Finance': 5, 'Human Resources': 10, 'Knowledge and Information Management': 5, 'Other': 30 },
    },
  ],

  'scotland-office': [
    {
      elementId: 'scotland-office',
      year: '2024-25',
      grades: { scs: 15, g67: 55, sheo: 45, eo: 10, aaao: 5, other: 0, total: 135 },
      orgs: [],
      professions: { 'Legal': 35, 'Operational Delivery': 20, 'Communications': 5, 'Policy': 5, 'No reported profession': 60 },
    },
    {
      // Renamed in the 2026 release to "Office of the Secretary of State for
      // Scotland (incl. Office of the Advocate General for Scotland)".
      elementId: 'scotland-office',
      year: '2025-26',
      grades: { scs: 15, g67: 65, sheo: 45, eo: 10, aaao: 5, other: 0, total: 140 },
      orgs: [],
      professions: { 'Communications': 10, 'Operational Delivery': 30, 'Policy': 45, 'Legal': 45, 'No reported profession': 0 },
    },
  ],

  'treasury': [
    {
      elementId: 'treasury',
      year: '2024-25',
      grades: { scs: 180, g67: 1215, sheo: 1050, eo: 240, aaao: 35, other: 0, total: 2720 },
      coreGrades: { scs: 140, g67: 910, sheo: 725, eo: 205, aaao: 30, other: 0, total: 2015 },
      orgs: [
        { orgId: 'treasury', label: 'HM Treasury (excl. agencies)', grades: { scs: 140, g67: 910, sheo: 725, eo: 205, aaao: 30, other: 0, total: 2015 } },
        { orgId: 'ukdmo',    label: 'UK Debt Management Office',     grades: { scs: 0,   g67: 45,  sheo: 60,  eo: 10,  aaao: 0,  other: 0, total: 120  } },
        { orgId: 'giaa',     label: 'Government Internal Audit Agency', grades: { scs: 25, g67: 205, sheo: 240, eo: 15, aaao: 0, other: 0, total: 485 } },
        { orgId: 'nista',    label: 'National Infrastructure and Service Transformation Authority', grades: { scs: 0, g67: 25, sheo: 15, eo: 5, aaao: 0, other: 0, total: 50 } },
        { orgId: 'obr',      label: 'Office for Budget Responsibility', grades: { scs: 0, g67: 30, sheo: 15, eo: 0, aaao: 0, other: 0, total: 50 } },
      ],
      professions: { 'Policy': 1455, 'Internal Audit': 355, 'Economics': 230, 'Operational Delivery': 170, 'Human Resources': 120, 'Finance': 105, 'Communications': 60, 'Digital and Data': 50, 'Project Delivery': 35, 'Corporate Finance': 25, 'Knowledge and Information Management': 25, 'Statistics': 15, 'Risk Management': 10, 'Commercial': 5, 'Planning': 5, 'Other': 45 },
      coreProfessions: { 'Policy': 1215, 'Economics': 215, 'Operational Delivery': 90, 'Human Resources': 90, 'Finance': 95, 'Communications': 50, 'Digital and Data': 40, 'Project Delivery': 30, 'Corporate Finance': 20, 'Statistics': 10, 'Risk Management': 10 },
    },
    {
      elementId: 'treasury',
      year: '2025-26',
      grades: { scs: 195, g67: 1255, sheo: 1035, eo: 215, aaao: 20, other: 40, total: 2765 },
      coreGrades: { scs: 165, g67: 990, sheo: 735, eo: 190, aaao: 20, other: 40, total: 2140 },
      orgs: [
        { orgId: 'treasury', label: 'HM Treasury (excl. agencies)', grades: { scs: 165, g67: 990, sheo: 735, eo: 190, aaao: 20, other: 40, total: 2140 } },
        { orgId: 'ukdmo', label: 'UK Debt Management Office', grades: { scs: 0, g67: 40, sheo: 70, eo: 10, aaao: 0, other: 0, total: 125 } },
        { orgId: 'giaa', label: 'Government Internal Audit Agency', grades: { scs: 25, g67: 195, sheo: 210, eo: 15, aaao: 0, other: 0, total: 445 } },
        { orgId: 'obr', label: 'Office for Budget Responsibility', grades: { scs: 0, g67: 30, sheo: 20, eo: 0, aaao: 0, other: 0, total: 55 } },
      ],
      professions: { 'Policy': 1390, 'Internal Audit': 330, 'Economics': 205, 'Operational Delivery': 215, 'Human Resources': 130, 'Finance': 115, 'Communications': 70, 'Digital and Data': 60, 'Project Delivery': 95, 'Corporate Finance': 0, 'Knowledge and Information Management': 20, 'Statistics': 5, 'Risk Management': 10, 'Commercial': 25, 'Planning': 0, 'Debt': 10, 'Other': 70 },
      coreProfessions: { 'Commercial': 20, 'Communications': 60, 'Digital and Data': 25, 'Economics': 155, 'Finance': 100, 'Human Resources': 115, 'Knowledge and Information Management': 20, 'Operational Delivery': 165, 'Policy': 1370, 'Project Delivery': 85, 'Statistics': 5, 'Other': 15 },
    },
  ],

  'ukef': [
    {
      elementId: 'ukef',
      year: '2024-25',
      grades: { scs: 50, g67: 265, sheo: 210, eo: 55, aaao: 0, other: 0, total: 585 },
      orgs: [],
      professions: { 'Operational Delivery': 285, 'Digital and Data': 70, 'Legal': 45, 'Finance': 35, 'Human Resources': 30, 'Knowledge and Information Management': 30, 'Policy': 30, 'Project Delivery': 20, 'Communications': 15, 'Security': 10, 'Economics': 5 },
    },
    {
      elementId: 'ukef',
      year: '2025-26',
      grades: { scs: 50, g67: 280, sheo: 220, eo: 40, aaao: 0, other: 0, total: 590 },
      orgs: [],
      professions: { 'Operational Delivery': 210, 'Digital and Data': 85, 'Legal': 35, 'Finance': 60, 'Human Resources': 30, 'Knowledge and Information Management': 40, 'Policy': 15, 'Project Delivery': 15, 'Communications': 25, 'Security': 15, 'Economics': 0, 'Risk Management': 30, 'Internal Audit': 5, 'Commercial': 0 },
    },
  ],

  'wales-office': [
    {
      elementId: 'wales-office',
      year: '2024-25',
      grades: { scs: 5, g67: 15, sheo: 15, eo: 10, aaao: 0, other: 0, total: 45 },
      orgs: [],
      professions: { 'Policy': 35, 'Communications': 10 },
    },
    {
      // Renamed in the 2026 release to "Office of the Secretary of State
      // for Wales".
      elementId: 'wales-office',
      year: '2025-26',
      grades: { scs: 0, g67: 15, sheo: 20, eo: 10, aaao: 0, other: 0, total: 45 },
      orgs: [],
      professions: { 'Communications': 5, 'Policy': 35 },
    },
  ],

  // ── Non-Ministerial Departments ───────────────────────────────────────────

  'ago': [
    {
      elementId: 'ago',
      year: '2025-26',
      grades: { scs: 10, g67: 30, sheo: 20, eo: 0, aaao: 0, other: 0, total: 65 },
      orgs: [],
      professions: { 'Communications': 10, 'Policy': 10, 'Legal': 30, 'No reported profession': 0 },
    },
  ],

  'cps': [
    {
      elementId: 'cps',
      year: '2025-26',
      grades: { scs: 100, g67: 3380, sheo: 1305, eo: 1870, aaao: 1660, other: 0, total: 8315 },
      orgs: [],
      professions: { 'Commercial': 50, 'Communications': 80, 'Cyber': 10, 'Digital and Data': 190, 'Finance': 80, 'Human Resources': 225, 'Knowledge and Information Management': 45, 'Legal': 3625, 'Operational Delivery': 3665, 'Policy': 105, 'Project Delivery': 140, 'Property': 25, 'Risk Management': 40, 'Internal Audit': 10, 'Other': 15 },
    },
  ],

  'gld': [
    {
      elementId: 'gld',
      year: '2025-26',
      grades: { scs: 245, g67: 2280, sheo: 410, eo: 425, aaao: 30, other: 0, total: 3390 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 15, 'Digital and Data': 30, 'Finance': 45, 'Human Resources': 95, 'Internal Audit': 30, 'Legal': 2740, 'Operational Delivery': 370, 'Policy': 20, 'Project Delivery': 25, 'Property': 5, 'Risk Management': 15, 'Security': 0, 'Other': 0 },
    },
  ],

  'sfo': [
    {
      elementId: 'sfo',
      year: '2025-26',
      grades: { scs: 15, g67: 205, sheo: 260, eo: 110, aaao: 15, other: 0, total: 610 },
      orgs: [],
      professions: { 'No reported profession': 610 },
    },
  ],

  'hmcpsi': [
    {
      elementId: 'hmcpsi',
      year: '2025-26',
      grades: { scs: 0, g67: 25, sheo: 0, eo: 0, aaao: 0, other: 0, total: 30 },
      orgs: [],
      professions: { 'Legal': 25, 'Operational Delivery': 5 },
    },
  ],

  'gad': [
    {
      elementId: 'gad',
      year: '2025-26',
      grades: { scs: 0, g67: 145, sheo: 70, eo: 20, aaao: 0, other: 0, total: 235 },
      orgs: [],
      professions: { 'Actuary': 140, 'Commercial': 0, 'Digital and Data': 40, 'Finance': 10, 'Human Resources': 10, 'Other': 20 },
    },
  ],

  'nsi': [
    {
      elementId: 'nsi',
      year: '2025-26',
      grades: { scs: 20, g67: 130, sheo: 105, eo: 25, aaao: 0, other: 0, total: 280 },
      orgs: [],
      professions: { 'Commercial': 20, 'Communications': 30, 'Counter Fraud': 0, 'Digital and Data': 60, 'Finance': 45, 'Human Resources': 15, 'Operational Delivery': 35, 'Policy': 5, 'Project Delivery': 50, 'Risk Management': 0 },
    },
  ],

  'supreme-court': [
    {
      elementId: 'supreme-court',
      year: '2025-26',
      grades: { scs: 0, g67: 10, sheo: 30, eo: 15, aaao: 0, other: 0, total: 55 },
      orgs: [],
      professions: { 'Communications': 5, 'Digital and Data': 5, 'Human Resources': 0, 'Internal Audit': 0, 'Knowledge and Information Management': 0, 'Legal': 15, 'Operational Delivery': 15, 'Policy': 0 },
    },
  ],

  'charity-comm': [
    {
      elementId: 'charity-comm',
      year: '2024-25',
      grades: { scs: 5, g67: 80, sheo: 250, eo: 110, aaao: 10, other: 0, total: 455 },
      orgs: [],
      professions: { 'Operational Delivery': 245, 'Digital and Data': 55, 'Intelligence Analysis': 25, 'Legal': 25, 'Communications': 25, 'Human Resources': 15, 'Knowledge and Information Management': 15, 'Finance': 10, 'Policy': 10, 'Project Delivery': 10, 'Statistics': 5, 'Other': 10 },
    },
    {
      elementId: 'charity-comm',
      year: '2025-26',
      grades: { scs: 5, g67: 80, sheo: 240, eo: 105, aaao: 15, other: 0, total: 445 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 25, 'Digital and Data': 50, 'Finance': 10, 'Human Resources': 15, 'Intelligence Analysis': 30, 'Knowledge and Information Management': 10, 'Legal': 30, 'Operational Delivery': 235, 'Policy': 10, 'Project Delivery': 10, 'Risk Management': 0, 'Statistics': 0, 'Other': 0 },
    },
  ],

  'cma': [
    {
      elementId: 'cma',
      year: '2024-25',
      grades: { scs: 140, g67: 570, sheo: 320, eo: 80, aaao: 30, other: 0, total: 1140 },
      orgs: [],
      professions: { 'Project Delivery': 420, 'Legal': 175, 'Economics': 155, 'Digital and Data': 110, 'Human Resources': 50, 'Communications': 40, 'Intelligence Analysis': 30, 'Policy': 25, 'Finance': 20, 'Commercial': 15, 'Property': 10, 'Security': 10, 'Other': 75 },
    },
    {
      elementId: 'cma',
      year: '2025-26',
      grades: { scs: 125, g67: 495, sheo: 275, eo: 65, aaao: 5, other: 0, total: 970 },
      orgs: [],
      professions: { 'Commercial': 10, 'Communications': 35, 'Digital and Data': 135, 'Economics': 135, 'Human Resources': 40, 'Intelligence Analysis': 25, 'Legal': 145, 'Policy': 25, 'Project Delivery': 370, 'Property': 10, 'Security': 0, 'Other': 15 },
    },
  ],

  'fsa': [
    {
      elementId: 'fsa',
      year: '2024-25',
      grades: { scs: 30, g67: 310, sheo: 855, eo: 380, aaao: 5, other: 0, total: 1580 },
      orgs: [],
      professions: { 'Operational Delivery': 635, 'Policy': 350, 'Science and Engineering': 140, 'Veterinarian': 70, 'Counter Fraud': 55, 'Digital and Data': 55, 'Communications': 45, 'Finance': 40, 'Project Delivery': 40, 'Human Resources': 35, 'Legal': 30, 'Intelligence Analysis': 20, 'Commercial': 15, 'Economics': 15, 'Corporate Finance': 5, 'Internal Audit': 5, 'Social Research': 5 },
    },
    {
      elementId: 'fsa',
      year: '2025-26',
      grades: { scs: 30, g67: 330, sheo: 865, eo: 365, aaao: 5, other: 0, total: 1590 },
      orgs: [],
      professions: { 'Commercial': 15, 'Communications': 50, 'Corporate Finance': 5, 'Counter Fraud': 55, 'Digital and Data': 60, 'Economics': 10, 'Finance': 50, 'Human Resources': 40, 'Intelligence Analysis': 5, 'Internal Audit': 5, 'Legal': 30, 'Operational Delivery': 640, 'Policy': 345, 'Property': 0, 'Science and Engineering': 140, 'Social Research': 0, 'Veterinarian': 75, 'Other': 0 },
    },
  ],

  'hmland': [
    {
      elementId: 'hmland',
      year: '2024-25',
      grades: { scs: 30, g67: 335, sheo: 2550, eo: 2555, aaao: 1390, other: 0, total: 6865 },
      orgs: [],
      professions: { 'Operational Delivery': 5195, 'Digital and Data': 695, 'Project Delivery': 250, 'Legal': 135, 'Human Resources': 85, 'Finance': 45, 'Operational Research': 40, 'Commercial': 35, 'Communications': 30, 'Counter Fraud': 30, 'Policy': 25, 'Knowledge and Information Management': 15, 'Security': 10, 'Internal Audit': 5, 'Property': 5, 'Other': 250 },
    },
    {
      elementId: 'hmland',
      year: '2025-26',
      grades: { scs: 35, g67: 380, sheo: 2775, eo: 2510, aaao: 1450, other: 0, total: 7150 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 35, 'Counter Fraud': 25, 'Digital and Data': 805, 'Finance': 50, 'Human Resources': 95, 'Intelligence Analysis': 5, 'Internal Audit': 15, 'Knowledge and Information Management': 15, 'Legal': 135, 'Operational Delivery': 5275, 'Operational Research': 45, 'Policy': 25, 'Project Delivery': 275, 'Property': 15, 'Risk Management': 10, 'Security': 0, 'Other': 285 },
    },
  ],

  'hmrc': [
    {
      elementId: 'hmrc',
      year: '2024-25',
      grades: { scs: 540, g67: 9800, sheo: 26070, eo: 16000, aaao: 18515, other: 0, total: 70925 },
      coreGrades: { scs: 520, g67: 9270, sheo: 24330, eo: 15125, aaao: 17700, other: 0, total: 66945 },
      orgs: [
        { orgId: 'hmrc', label: 'HMRC (excl. agencies)',             grades: { scs: 520, g67: 9270, sheo: 24330, eo: 15125, aaao: 17700, other: 0, total: 66945 } },
        { orgId: 'voa',  label: 'Valuation Office Agency',           grades: { scs: 20,  g67: 530,  sheo: 1740,  eo: 875,   aaao: 815,   other: 0, total: 3980  } },
      ],
      professions: { 'Operational Delivery': 32365, 'Tax': 15425, 'Digital and Data': 3205, 'Project Delivery': 3160, 'Counter Fraud': 3120, 'Property': 2550, 'Policy': 1370, 'Finance': 1150, 'Human Resources': 1025, 'Legal': 480, 'Statistics': 385, 'Security': 275, 'Communications': 270, 'Intelligence Analysis': 210, 'Operational Research': 210, 'Economics': 180, 'Social Research': 145, 'Knowledge and Information Management': 70, 'Commercial': 55, 'Internal Audit': 45, 'Other': 1515, 'No reported profession': 3705 },
      coreProfessions: { 'Operational Delivery': 30265, 'Tax': 15335, 'Digital and Data': 2965, 'Project Delivery': 2995, 'Counter Fraud': 2985, 'Property': 2390, 'Policy': 1275, 'Finance': 1045, 'Human Resources': 935, 'Legal': 410, 'Statistics': 340, 'Security': 265, 'Communications': 245, 'Intelligence Analysis': 190, 'Operational Research': 195, 'Economics': 165, 'Social Research': 135, 'Knowledge and Information Management': 65, 'Commercial': 50, 'Internal Audit': 40 },
    },
    {
      elementId: 'hmrc',
      year: '2025-26',
      grades: { scs: 570, g67: 10620, sheo: 27465, eo: 17340, aaao: 19505, other: 0, total: 75500 },
      coreGrades: { scs: 540, g67: 10050, sheo: 25695, eo: 16400, aaao: 18525, other: 0, total: 71210 },
      orgs: [
        { orgId: 'hmrc', label: 'HM Revenue and Customs (excl. agencies)', grades: { scs: 540, g67: 10050, sheo: 25695, eo: 16400, aaao: 18525, other: 0, total: 71210 } },
        { orgId: 'voa', label: 'Valuation Office Agency', grades: { scs: 25, g67: 570, sheo: 1770, eo: 940, aaao: 985, other: 0, total: 4290 } },
      ],
      professions: { 'Operational Delivery': 34510, 'Tax': 16745, 'Digital and Data': 3540, 'Project Delivery': 3205, 'Counter Fraud': 4065, 'Property': 2770, 'Policy': 1510, 'Finance': 1165, 'Human Resources': 1135, 'Legal': 505, 'Statistics': 405, 'Security': 160, 'Communications': 340, 'Intelligence Analysis': 60, 'Operational Research': 220, 'Economics': 195, 'Social Research': 0, 'Knowledge and Information Management': 95, 'Commercial': 60, 'Internal Audit': 0, 'Risk Management': 385, 'Other': 565, 'No reported profession': 3345 },
      coreProfessions: { 'Commercial': 55, 'Communications': 305, 'Counter Fraud': 4065, 'Digital and Data': 3495, 'Economics': 190, 'Finance': 1125, 'Human Resources': 1005, 'Intelligence Analysis': 520, 'Internal Audit': 60, 'Knowledge and Information Management': 65, 'Legal': 505, 'Operational Delivery': 33185, 'Operational Research': 195, 'Policy': 1490, 'Project Delivery': 3110, 'Property': 285, 'Security': 385, 'Social Research': 150, 'Statistics': 375, 'Tax': 16745, 'Other': 565, 'No reported profession': 3345 },
    },
  ],

  'tna': [
    {
      elementId: 'tna',
      year: '2024-25',
      grades: { scs: 10, g67: 110, sheo: 320, eo: 100, aaao: 105, other: 0, total: 645 },
      orgs: [],
      professions: { 'Operational Delivery': 145, 'Knowledge and Information Management': 115, 'Digital and Data': 95, 'Commercial': 20, 'Communications': 20, 'Human Resources': 20, 'Finance': 15, 'Project Delivery': 15, 'Property': 10, 'Security': 10, 'Other': 175 },
    },
    {
      elementId: 'tna',
      year: '2025-26',
      grades: { scs: 5, g67: 125, sheo: 345, eo: 90, aaao: 95, other: 0, total: 665 },
      orgs: [],
      professions: { 'Commercial': 15, 'Communications': 10, 'Digital and Data': 140, 'Finance': 15, 'Human Resources': 25, 'Knowledge and Information Management': 200, 'Operational Delivery': 135, 'Policy': 5, 'Property': 15, 'Other': 100 },
    },
  ],

  'nca-non-min': [
    {
      elementId: 'nca-non-min',
      year: '2024-25',
      grades: { scs: 50, g67: 575, sheo: 2795, eo: 2320, aaao: 200, other: 0, total: 5945 },
      orgs: [],
      professions: { 'Operational Delivery': 4650, 'Human Resources': 260, 'Digital and Data': 205, 'Intelligence Analysis': 150, 'Security': 150, 'Project Delivery': 125, 'Knowledge and Information Management': 95, 'Policy': 75, 'Finance': 60, 'Legal': 55, 'Commercial': 40, 'Communications': 35, 'Property': 35 },
    },
    {
      elementId: 'nca-non-min',
      year: '2025-26',
      grades: { scs: 50, g67: 615, sheo: 2840, eo: 2290, aaao: 140, other: 0, total: 5940 },
      orgs: [],
      professions: { 'Commercial': 50, 'Communications': 30, 'Digital and Data': 220, 'Finance': 65, 'Human Resources': 235, 'Intelligence Analysis': 140, 'Knowledge and Information Management': 90, 'Legal': 60, 'Operational Delivery': 4640, 'Policy': 65, 'Project Delivery': 170, 'Property': 0, 'Security': 150, 'Other': 0 },
    },
  ],

  'ofgem': [
    {
      elementId: 'ofgem',
      year: '2024-25',
      grades: { scs: 95, g67: 1010, sheo: 650, eo: 455, aaao: 10, other: 0, total: 2225 },
      orgs: [],
      professions: { 'Policy': 490, 'Operational Delivery': 470, 'Digital and Data': 300, 'Project Delivery': 110, 'Legal': 105, 'Communications': 90, 'Finance': 55, 'Human Resources': 55, 'Economics': 45, 'Science and Engineering': 20, 'Other': 485 },
    },
    {
      elementId: 'ofgem',
      year: '2025-26',
      grades: { scs: 105, g67: 1135, sheo: 625, eo: 435, aaao: 10, other: 0, total: 2310 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 80, 'Cyber': 60, 'Digital and Data': 255, 'Economics': 35, 'Finance': 55, 'Human Resources': 65, 'Legal': 105, 'Operational Delivery': 485, 'Policy': 520, 'Project Delivery': 105, 'Property': 25, 'Science and Engineering': 0, 'Other': 515 },
    },
  ],

  'ofqual': [
    {
      elementId: 'ofqual',
      year: '2024-25',
      grades: { scs: 20, g67: 135, sheo: 170, eo: 20, aaao: 5, other: 0, total: 360 },
      orgs: [],
      professions: { 'Operational Delivery': 115, 'Policy': 95, 'Digital and Data': 30, 'Project Delivery': 25, 'Social Research': 20, 'Finance': 15, 'Human Resources': 15, 'Legal': 15, 'Communications': 10, 'Statistics': 10 },
    },
    {
      elementId: 'ofqual',
      year: '2025-26',
      grades: { scs: 20, g67: 130, sheo: 155, eo: 15, aaao: 5, other: 0, total: 330 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 10, 'Digital and Data': 30, 'Finance': 0, 'Human Resources': 10, 'Legal': 15, 'Operational Delivery': 105, 'Policy': 90, 'Project Delivery': 25, 'Property': 0, 'Risk Management': 15, 'Science and Engineering': 10, 'Social Research': 0, 'Statistics': 0, 'Other': 0 },
    },
  ],

  'ofsted': [
    {
      elementId: 'ofsted',
      year: '2024-25',
      grades: { scs: 35, g67: 740, sheo: 860, eo: 195, aaao: 195, other: 0, total: 2020 },
      orgs: [],
      professions: { 'Inspector of Education and Training': 930, 'Operational Delivery': 165, 'Policy': 155, 'Digital and Data': 125, 'Statistics': 120, 'Human Resources': 50, 'Social Research': 40, 'Communications': 35, 'Finance': 35, 'Legal': 20, 'Commercial': 15, 'Property': 10, 'Other': 325 },
    },
    {
      elementId: 'ofsted',
      year: '2025-26',
      grades: { scs: 35, g67: 795, sheo: 1000, eo: 195, aaao: 180, other: 0, total: 2205 },
      orgs: [],
      professions: { 'Commercial': 15, 'Communications': 35, 'Digital and Data': 140, 'Finance': 35, 'Human Resources': 70, 'Inspector of Education and Training': 1040, 'Legal': 25, 'Operational Delivery': 175, 'Policy': 175, 'Project Delivery': 5, 'Property': 0, 'Other': 325 },
    },
  ],

  'ofwat': [
    {
      elementId: 'ofwat',
      year: '2024-25',
      grades: { scs: 10, g67: 100, sheo: 240, eo: 50, aaao: 10, other: 0, total: 410 },
      orgs: [],
      professions: { 'Policy': 75, 'Economics': 60, 'Science and Engineering': 50, 'Digital and Data': 45, 'Operational Delivery': 45, 'Communications': 30, 'Finance': 30, 'Human Resources': 25, 'Legal': 20, 'Project Delivery': 20 },
    },
    {
      elementId: 'ofwat',
      year: '2025-26',
      grades: { scs: 10, g67: 100, sheo: 290, eo: 65, aaao: 15, other: 0, total: 480 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 40, 'Digital and Data': 55, 'Economics': 45, 'Finance': 25, 'Human Resources': 25, 'Knowledge and Information Management': 25, 'Legal': 25, 'Operational Delivery': 60, 'Policy': 85, 'Project Delivery': 55, 'Other': 0 },
    },
  ],

  'ons': [
    {
      elementId: 'ons',
      year: '2024-25',
      grades: { scs: 90, g67: 1180, sheo: 2390, eo: 730, aaao: 1245, other: 0, total: 5630 },
      orgs: [],
      professions: { 'Operational Delivery': 2540, 'Digital and Data': 955, 'Statistics': 635, 'Social Research': 560, 'Project Delivery': 260, 'Economics': 150, 'Human Resources': 150, 'Communications': 85, 'Policy': 70, 'Security': 65, 'Finance': 60, 'Operational Research': 30, 'Commercial': 20, 'Knowledge and Information Management': 20, 'Geography': 15, 'Property': 15 },
    },
    {
      // "ons" (Office for National Statistics) is reported in the 2026 CSV
      // under the umbrella "UK Statistics Authority" row.
      elementId: 'ons',
      year: '2025-26',
      grades: { scs: 95, g67: 1220, sheo: 2560, eo: 805, aaao: 1300, other: 0, total: 5980 },
      orgs: [],
      professions: { 'Commercial': 20, 'Communications': 80, 'Digital and Data': 1015, 'Economics': 60, 'Finance': 0, 'Geography': 20, 'Human Resources': 140, 'Internal Audit': 0, 'Knowledge and Information Management': 20, 'Operational Delivery': 2725, 'Operational Research': 30, 'Policy': 80, 'Project Delivery': 230, 'Security': 0, 'Social Research': 605, 'Statistics': 695, 'Property': 75, 'Other': 0 },
    },
  ],

  'orr': [
    {
      elementId: 'orr',
      year: '2024-25',
      grades: { scs: 20, g67: 200, sheo: 95, eo: 35, aaao: 15, other: 0, total: 365 },
      orgs: [],
      professions: { 'Operational Delivery': 135, 'Policy': 85, 'Economics': 35, 'Science and Engineering': 25, 'Communications': 20, 'Statistics': 20, 'Finance': 10, 'Human Resources': 10, 'Legal': 10, 'Digital and Data': 5 },
    },
    {
      elementId: 'orr',
      year: '2025-26',
      grades: { scs: 20, g67: 210, sheo: 110, eo: 25, aaao: 10, other: 0, total: 380 },
      orgs: [],
      professions: { 'Commercial': 0, 'Communications': 20, 'Digital and Data': 5, 'Economics': 5, 'Finance': 10, 'Human Resources': 10, 'Legal': 0, 'Operational Delivery': 135, 'Policy': 85, 'Project Delivery': 0, 'Property': 30, 'Science and Engineering': 25, 'Statistics': 20, 'Other': 0 },
    },
  ],

}

// Returns the most recent StaffProfile for an element, or undefined if none
// exists. Searches sub-org rows (within a parent's orgs[]) as a fallback,
// using the parent's latest-year entry.
export function getStaffProfile(elementId: string): StaffProfile | undefined {
  const history = staffProfiles[elementId]
  if (history && history.length > 0) return history[history.length - 1]

  for (const parentHistory of Object.values(staffProfiles)) {
    const parent = parentHistory[parentHistory.length - 1]
    if (!parent || parent.elementId === elementId) continue
    for (const org of parent.orgs) {
      if (org.orgId === elementId) {
        return {
          elementId,
          year: parent.year,
          grades: org.grades,
          orgs: [],
        }
      }
    }
  }

  return undefined
}

// Returns the full staffing history (oldest first) for an element, or an
// empty array if none exists.
export function getStaffProfileHistory(elementId: string): StaffProfile[] {
  return staffProfiles[elementId] ?? []
}

// Returns every year of staffing data available for an element, oldest first.
// Unlike getStaffProfileHistory() this also covers elements that appear only
// as a sub-org row inside a parent department's orgs[] — one synthesised
// profile per parent year in which the sub-org is listed. Returns an empty
// array if the element has no staffing data at all.
export function getStaffProfileSeries(elementId: string): StaffProfile[] {
  const history = staffProfiles[elementId]
  if (history && history.length > 0) return history

  for (const parentHistory of Object.values(staffProfiles)) {
    if (parentHistory[0]?.elementId === elementId) continue

    // Find the labels this sub-org is listed under across the parent's years.
    // Earlier years often leave orgId blank (it was only backfilled for the
    // most recent release) and the Table 20 label can be renamed between
    // years, so collect every label that any orgId match used and treat
    // those as aliases when scanning years without an orgId.
    const aliases = new Set<string>()
    for (const parent of parentHistory) {
      for (const org of parent.orgs) {
        if (org.orgId === elementId) aliases.add(org.label)
      }
    }
    if (aliases.size === 0) continue

    const series: StaffProfile[] = []
    for (const parent of parentHistory) {
      const org = parent.orgs.find(o => o.orgId === elementId)
        ?? parent.orgs.find(o => !o.orgId && aliases.has(o.label))
      if (org) {
        series.push({ elementId, year: parent.year, grades: org.grades, orgs: [] })
      }
    }
    if (series.length > 0) return series
  }

  return []
}
