---
name: add-organogram-data
description: Use when the user provides a senior organogram CSV (from the National Data Library / data.gov.uk) and wants src/data/organograms.ts updated with the new organisation's leadership structure. Parses the CSV hierarchy, maps it to the correct element ID in elements.ts, and adds or replaces the OrgProfile entry.
---

# Add organogram data

Adds or replaces a senior organogram entry in `src/data/organograms.ts` from a
government organogram CSV file.

## Where organogram CSVs come from

Senior organogram CSVs are published to the National Data Library / data.gov.uk by
central government departments and agencies, typically on a 6-monthly basis.

Each CSV covers the Senior Civil Service (SCS) posts within one organisation.
The file name convention encodes the publication date and reference date:
`<publishedAt>-<asAt>-organogram-senior.csv` (e.g.
`2026-07-24T14-09-01Z-2026-03-31-organogram-senior.csv`).

The **`asAt` date** (second date in the filename, or confirmed by the user) is
the reference date to record in `OrgProfile.asAt`. This is not the publication
date.

## CSV format

Key columns (order may vary; match by header name):

| Column | Notes |
|---|---|
| `Post Unique Reference` | Unique key for each post within this CSV |
| `Name` | Person's name, or `REDACTED` if withheld |
| `Grade (or equivalent)` | `SCS4`, `SCS3`, `SCS2`, `SCS1` |
| `Job Title` | Role title, or `REDACTED` |
| `Unit` | Organisational unit within the department |
| `Reports to Senior Post` | `Post Unique Reference` of the manager |
| `FTE` | Full-time equivalent (decimal) |
| `Valid?` | Ignore rows where this is not `1.00` or `1` |
| `Organisation` | Parent organisation label (used to confirm which element this CSV covers) |

Additional columns (`Salary Cost of Reports`, `Actual Pay Floor/Ceiling`,
`Contact Phone/Email`, `Professional/Occupational Group`, etc.) are **not** stored
in `organograms.ts`.

### Redacted values

- `REDACTED` — explicitly withheld under FOIA exemptions; store as-is
- `N/D` (Not Disclosed) — treat identically to `REDACTED` for storage purposes

Both will render in the Org tab as grey italic "Redacted".

## Data model (`src/data/organograms.ts`)

```ts
export interface OrgPost {
  ref: string       // Post Unique Reference
  name: string      // 'REDACTED' if not published
  grade: string     // 'SCS4' | 'SCS3' | 'SCS2' | 'SCS1'
  title: string     // 'REDACTED' if not published
  unit: string      // organisational unit
  reportsTo: string // ref of direct manager, or '' if top-level in this dataset
  fte: number       // round to 2dp; default 1 if field is blank/unparseable
}

export interface OrgProfile {
  asAt: string      // ISO date 'YYYY-MM-DD' — the reference date, NOT the publication date
  sourceUrl: string // data.gov.uk dataset URL, confirmed with the user
  posts: OrgPost[]
}

export const organogramProfiles: Record<string, OrgProfile> = {
  'element-id': { asAt: '...', sourceUrl: '...', posts: [...] },
}
```

The record key **must** match the element ID in `src/data/elements.ts`. This is
the lookup used by `ElementDetails.tsx` to find the profile.

## Step-by-step process

### 1. Identify the element ID

Find the correct element ID for the organisation covered by the CSV:

1. Note the `Organisation` column value in the CSV (e.g. `Cabinet Office`).
2. Grep `elements.ts` for the organisation name (case-insensitive):
   `grep -in "cabinet office" src/data/elements.ts`
3. Confirm the element has `category: 'department'` or `category: 'body'` —
   organograms are not used for `'official'` or `'group'` elements.
4. If the CSV `Organisation` label doesn't match any element name cleanly (old
   name, abbreviation, post-restructure label), search by description and
   parent context, then confirm with the user before proceeding.

### 2. Determine the source URL

Ask the user for the data.gov.uk dataset URL if not already provided.
The standard URL pattern is:
`https://www.data.gov.uk/dataset/<uuid>/organogram-of-staff-roles-salaries`

Do not invent or guess UUIDs.

### 3. Parse the CSV

Use a Python script to parse the CSV and emit the `posts` array.

Key parsing rules:
- **Filter out invalid rows**: skip rows where `Valid?` is not `1.00` or `1`
- **Top-level posts**: a post is top-level (`reportsTo: ''`) when its
  `Reports to Senior Post` value is absent, blank, or does not appear in any
  other row's `Post Unique Reference` column
- **Newlines in fields**: some title/unit fields contain literal `\n` or `\r\n`
  characters — collapse to a single space
- **Single quotes in names/titles**: escape as `\'` in the TypeScript literal
- **FTE**: parse as float; default to `1` if blank or non-numeric
- **Round FTE to 2 dp** — store as `1` not `1.00` (drop trailing zeros)

Example Python skeleton:

```python
import csv, re

def esc(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'")
    s = re.sub(r'[\r\n]+', ' ', s)
    s = re.sub(r'  +', ' ', s).strip()
    return s

with open('path/to/file.csv') as f:
    rows = list(csv.DictReader(f))

refs = set(r['Post Unique Reference'].strip() for r in rows
           if str(r.get('Valid?', '1')).strip() in ('1', '1.00'))

posts = []
for r in rows:
    if str(r.get('Valid?', '1')).strip() not in ('1', '1.00'):
        continue
    ref = r['Post Unique Reference'].strip()
    reports_to = r['Reports to Senior Post'].strip()
    try:
        fte = round(float(r['FTE']), 2)
    except (ValueError, KeyError):
        fte = 1.0
    # Drop trailing .0
    fte_str = str(int(fte)) if fte == int(fte) else str(fte)
    posts.append({
        'ref': ref, 'name': r['Name'].strip(), 'grade': r['Grade (or equivalent)'].strip(),
        'title': r['Job Title'].strip(), 'unit': r['Unit'].strip(),
        'reportsTo': reports_to if reports_to in refs else '',
        'fte': fte_str,
    })

for p in posts:
    print(f"      {{ ref: '{esc(p['ref'])}', name: '{esc(p['name'])}', grade: '{esc(p['grade'])}', "
          f"title: '{esc(p['title'])}', unit: '{esc(p['unit'])}', reportsTo: '{esc(p['reportsTo'])}', fte: {p['fte']} }},")
```

### 4. Write `organograms.ts`

**Adding a new organisation** — append a new key to `organogramProfiles`:

```ts
export const organogramProfiles: Record<string, OrgProfile> = {
  'co': { /* existing */ },
  'new-element-id': {
    asAt: 'YYYY-MM-DD',
    sourceUrl: 'https://www.data.gov.uk/dataset/.../organogram-of-staff-roles-salaries',
    posts: [ /* generated output */ ],
  },
}
```

**Refreshing an existing organisation** — replace the existing entry entirely
(organograms are point-in-time snapshots, not time-series; unlike staffing data
there is no need to preserve prior snapshots in the data file):

```ts
  'co': {
    asAt: '2026-09-30',       // ← updated
    sourceUrl: '...',          // ← update if the dataset URL changed
    posts: [ /* new posts */ ],
  },
```

Do **not** keep the old posts alongside the new ones — the OrgTab always
displays the current snapshot.

### 5. Verify

1. Run `npm run build` — must exit clean (no TypeScript errors).
2. Start `npm run dev`, open the element in the app, and confirm:
   - The Org tab appears and shows the correct post count badge
   - The top-level post is the most senior grade (SCS4 or equivalent)
   - Named posts show names; redacted posts show grey italic "Redacted"
   - Expanding a node reveals its direct reports
   - The footer shows the correct `asAt` date and source link

### 6. Summarise for the user

Report:
- Which element ID the profile was mapped to
- Total post count and grade breakdown (SCS4/SCS3/SCS2/SCS1)
- Number of named vs redacted posts
- The `asAt` date recorded
- Any ambiguities or mismatches found during step 1 (element ID resolution)

## Non-goals

- Do not store pay, salary, contact details, or phone/email from the CSV
- Do not add organogram data for `'official'` or `'group'` category elements
- Do not invent source URLs — ask the user if not provided
- Do not attempt to reconcile the organogram's Unit names with elements.ts
  sub-org IDs — units in the organogram are internal to the department's
  own structure and may not correspond 1:1 with tracked elements
