---
name: civil-service-stats-refresh
description: Use when the user provides a new year's Civil Service Statistics release (grade and profession CSVs/ODS from gov.uk) and wants src/data/staffing.ts updated. Ingests the new year's data, appends it to existing per-element history (without discarding prior years), flags department name/structure discrepancies against elements.ts for user confirmation, and updates source/year references in the app.
---

# Civil Service Stats refresh

Updates `src/data/staffing.ts` with a new year's Civil Service Statistics release, preserving all prior years' data.

## Inputs expected

The user will point to one or two files in `input_data/` (or elsewhere), normally:
- A **Grade** table: headcount by grade (SCS, G6/7, SEO/HEO, EO, AA/AO, unreported) per organisation
- A **Profession** table: headcount by profession per organisation

These are usually CSV extracts of Table 20 and Table 8 from the annual
`https://www.gov.uk/government/statistics/civil-service-statistics-<year>`
release (sometimes supplied as `.ods`/`.xlsx` — ask the user to export the
two relevant tables to CSV if so, matching the column layout of
`input_data/CivilServiceStats_*_Grade.csv` / `*_Profession.csv` from the
prior run).

CSV conventions to expect:
- Figures may contain thousands-separator commas and be quoted (`"3,380"`)
- `[c]` marks a suppressed cell (1–4 staff) — treat as `0`
- Each parent department has an "Overall" row (or is its own single row if
  it has no sub-orgs) and, if it has agencies, an "(excl. agencies)" row
  for the core department
- Devolved administrations (Scottish Government, Welsh Government) and
  their agencies are **out of scope** — do not add elements or staffing
  entries for them unless the user explicitly asks

## Data model (`src/data/staffing.ts`)

```ts
export const staffProfiles: Record<string, StaffProfile[]> = {
  'dept-id': [
    { elementId: 'dept-id', year: '2024-25', grades: {...}, orgs: [...], professions: {...} },
    { elementId: 'dept-id', year: '2025-26', grades: {...}, orgs: [...], professions: {...} },  // ← new entry appended
  ],
}
```

Each element ID maps to an **array** of `StaffProfile`, one per reference
year, **oldest first**. This mirrors the `budgets: Budget[]` convention in
`src/data/budgets.ts`. To add a new year:

1. **Never remove or rewrite existing array entries.** Only append a new
   `StaffProfile` object to each element's array.
2. `getStaffProfile(elementId)` already returns the latest (last) entry —
   no caller changes needed.
3. `getStaffProfileHistory(elementId)` returns the full array if a future
   feature needs a year-over-year view.

## Step-by-step process

1. **Read both new CSVs in full.** Note the "Civil Service parent
   department" and "Civil Service organisation" columns — the latter is
   the row label, the former groups sub-org rows under their parent.

2. **Map each CSV department/org name to an element ID** in
   `src/data/elements.ts`, by meaning and current machinery-of-government
   position — not by exact string match. elements.ts names and structure
   are the source of truth; CSV labels can lag behind reorganisations,
   renames, or merges (e.g. a dissolved department whose functions moved
   elsewhere). Search elements.ts for the current name/description to find
   the right ID, and check `parentIds` to confirm the current parent
   department before assuming a sub-org's home hasn't changed.

3. **Flag discrepancies to the user before writing data** — do not
   silently resolve or silently skip any of the following, and do not
   guess at machinery-of-government changes:
   - A CSV department name doesn't match any current element's name
   - A CSV sub-org's parent department differs from what elements.ts
     currently models (possible restructuring)
   - A CSV row has no corresponding element at all (new body, or a body
     the app doesn't yet track)
   - An element referenced in old staffing.ts data no longer appears in
     the new CSV (merged, abolished, or renamed beyond recognition)
   - Use `AskUserQuestion` for anything with real ambiguity; only proceed
     without asking when the mapping is unambiguous (e.g. identical name,
     unchanged parent)

4. **For each mapped department**, build a new `StaffProfile`:
   - `grades`: from the "Overall" row (or the only row, if no agencies)
   - `coreGrades`: from the "(excl. agencies)" row, only if sub-orgs exist
   - `orgs[]`: one `OrgStaff` per sub-org row, with `orgId` set to the
     matched element ID (or `''` if genuinely no element exists yet —
     confirm this with the user rather than assuming)
   - `professions`: from the matching "Overall" row in the Profession CSV,
     as `Record<profession name, headcount>` — convert `[c]` to `0`, strip
     thousands separators, omit a profession key entirely only if the old
     convention for that department already omitted zero-value professions
     (check existing entries for the department's style; otherwise it's
     fine to include 0 values)
   - `coreProfessions`: **whenever `coreGrades` is set, `coreProfessions`
     must also be set**, from the matching "(excl. agencies)" row in the
     Profession CSV. Never leave it `undefined` alongside a populated
     `coreGrades` — the Staff tab's "Core department" toggle falls back to
     whole-group profession figures when `coreProfessions` is missing,
     which silently desyncs the profession breakdown from the grade
     breakdown and the headline total. If the Profession CSV genuinely has
     no "(excl. agencies)" row for a department that has one in the Grade
     CSV, flag this to the user rather than leaving it out.

5. **Append** each new `StaffProfile` to the end of its element's array in
   `staffProfiles`. Do not touch earlier years' entries except to fix a
   genuine previously-discovered data error (confirm with the user first).

6. **Update source/year references** app-wide:
   - `src/components/StaffTab.tsx`: the gov.uk source link URL and year,
     and the "Headcount as at 31 March <year>" footer text
   - Any other hardcoded year/source mentions found via
     `grep -rn "civil-service-statistics-" src/` and
     `grep -rn "<old-year>" src/components src/data/staffing.ts`

7. **Verify**:
   - Run `npx tsc --noEmit -p .` and `npm run build`.
   - Run a quick script to assert every `StaffProfile` with `coreGrades`
     set also has `coreProfessions` set, e.g.:
     `grep -B2 "coreProfessions: undefined" src/data/staffing.ts` should
     return nothing once coreGrades-bearing entries are filled in.
   - Spot-check a few departments in the running app (`npm run dev`):
     open a department with sub-orgs (e.g. one with both `coreGrades` and
     multiple `orgs`), go to its Staff tab, and toggle "Whole group" /
     "Core department" on each of the By Grade, By Organisation, and By
     Profession views. Confirm the headline total, the pie chart, and the
     legend table's absolute numbers (not just percentages) all change
     together, and that "By Organisation" is unavailable in Core
     department scope (core excludes agencies, so there's nothing to
     break down by organisation there).

8. **Summarize for the user**: list every discrepancy found and how it was
   resolved (or left for them to confirm), and any new elements.ts entries
   created as part of the refresh.

## Non-goals

- Do not add Scottish Government / Welsh Government / other devolved
  administration bodies as new elements unless explicitly asked.
- Do not change `elements.ts` department names/structure beyond what the
  user has explicitly confirmed reflects a real machinery-of-government
  change — a stats release using an old or shorthand name is not by
  itself evidence of a rename.
- Do not collapse multiple years into a single "latest only" entry — the
  whole point of this skill is preserving history.
