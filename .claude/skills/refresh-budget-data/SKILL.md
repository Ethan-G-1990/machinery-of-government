---
name: refresh-budget-data
description: Use when the user provides a new HM Treasury OSCAR Final Outturn workbook (BUD_xx-xx.xlsx) or asks to refresh budget data for a new financial year. Regenerates src/data/budgets-oscar.json via scripts/extract-oscar.mjs, reconciles department/body mappings against elements.ts, and updates year and source references in the app and README.
---

# Refresh budget data

Budget data comes from HM Treasury's OSCAR Final Outturn release, pre-processed by `scripts/extract-oscar.mjs` into `src/data/budgets-oscar.json` (imported by `src/data/budgets.ts`). All figures are £ thousands.

## Steps

1. **Locate the input.** The workbook (e.g. `BUD_25-26.xlsx`, from assets.publishing.service.gov.uk) should be in the project root or `input_data/`. If the user hasn't supplied it, ask for it; don't fabricate figures.
2. **Update the script** `scripts/extract-oscar.mjs`:
   - the filename in the header comment and in `XLSX.readFile(...)` / the console message
   - `FINANCIAL_YEAR` (e.g. `'2025-26'`) and `SOURCE_LABEL`
   - (If the file lives in `input_data/`, adjust the `join(ROOT, ...)` path.)
3. **Check mappings before running.** Compare the workbook's `DEPARTMENT_GROUP_CODE` values and body labels with `DEPT_GROUP_TO_ELEMENT` and `BODY_LABEL_TO_ELEMENT` in the script. Machinery-of-government changes (renamed, merged, split or moved departments) will need mapping updates; target element IDs must exist in `src/data/elements.ts` (see the `manage-elements` skill). Report any unmapped groups or bodies to the user and confirm before dropping them.
4. **Run:** `node scripts/extract-oscar.mjs` (needs the `xlsx` package; `npm install` if missing). Read the console summary: number of department groups, any warnings.
5. **Sanity-check** a few departments' totals against the previous output (`git diff --stat`, spot-check large changes) and confirm year-on-year changes are plausible, not a parsing error.
6. **Update references** to the old year: grep `src/` and `README.md` for the old financial year (e.g. `2024-25`, `2024–25`) in `BudgetTab.tsx`, `InfoPane.tsx`, the README third-party data and Budget feature sections, and the header comment in `budgets.ts`. Note the department-group count in the README if it changed.
7. **Verify:** `npx tsc --noEmit -p .` then `npm run build`.

## Report

State the year loaded, number of groups, mapping changes, unmapped items, and anything unusual in the diff. Do not commit unless asked.
