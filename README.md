# Machinery of Government

An interactive web application for exploring the structure of the UK Government — showing how departments, ministers, agencies, public bodies, and other organisations relate to and oversee one another.

## Licence

Copyright © MMXXVI Harry C. Rushworth.

This project is source available. Non-commercial use is permitted provided clear attribution is given to the original author (Harry C. Rushworth) and a link to the original repository or published application is included. Commercial use is not permitted without prior written permission. The author reserves the right to release future versions under different licence terms. See the [LICENSE](LICENSE) file for full terms.

### Third-party data

This application incorporates public sector data used under the Open Government Licence v3.0:

- **HM Treasury OSCAR** — 2024–25 Final Outturn budget data. © Crown Copyright.
- **Cabinet Office Civil Service Statistics 2026** (with 2025 for historic comparison) — Headcount as at 31 March 2026 and 31 March 2025. © Crown Copyright.
- **Senior organogram data** — Senior Civil Service post and reporting-line data from the National Data Library / data.gov.uk. The Cabinet Office snapshot is as at 31 March 2026. Eighteen further departments use their latest published senior file. © Crown Copyright.

Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

---

## Features

### Views

**Full view** (default)
Every element in the network is shown simultaneously, arranged in concentric rings by constitutional distance from the Prime Minister:
- Ring 0 — Prime Minister
- Ring 1 — Cabinet Ministers
- Ring 2 — Junior Ministers
- Ring 3 — Ministerial and Non-Ministerial Departments
- Ring 4 — Executive Agencies and Divisions/Directorates
- Ring 5+ — All other bodies, placed by BFS distance from the nearest ring-1–4 node

Hover any node to reveal its name in a cursor-following tooltip and highlight its full ancestor chain plus direct children. Click a node to select it — the selected element is highlighted with an amber border and its name is shown as a persistent label. Click on the background to clear the selection. The ↺ button re-centres on the PM and clears the selection.

When the search or jurisdiction filter is active in full view, matching elements are highlighted across the whole network and connections between them are shown, making it easy to see where a filtered set of organisations sits in the network.

**Focus view**
The selected element is placed at the centre with its parents, grandparents, children, and grandchildren arranged radially. Click any node to re-focus the chart. The ↺ button resets the layout.

**Dark / light mode**
Toggle between light and dark appearances via the ☾/☀ button in the chart toolbar (desktop) or the moon/sun icon in the mobile navigation bar.

### Navigation & Visualization
- **Interactive network graph** — click any node to select it; connections arranged radially in focus view
- **Element pane** — detailed sidebar with tabbed sections for Info, Powers, Budget, Staff, and Org
- **Random element** — ⚄ button (top-right of chart) jumps to a randomly selected element from the entire database
- **Legend** — ☰ Legend button toggles the key on desktop; shown by default, hidden on mobile. Groups section only shown in focus view
- **Jurisdiction filter** — 🌍 Territory button filters the chart by geographic scope (UK, England, Wales, Scotland, Northern Ireland, Crown Dependencies, Overseas Territories); selecting a territory shows all elements whose remit covers it, including broader jurisdictions; reset with ↺
- **Category pane** — click any category badge to see a description and full list of all elements of that type
- **Tag pane** — click any tag pill to see all organisations sharing that tag
- **Search pane** — full-text and tag-based search across all elements; in full view, results are highlighted live on the network with connections between matches shown
- **Help pane** — in-app guide accessible via the Help button
- **Categories pane** — browse all element types grouped by section
- **Mobile selection chip** — on mobile, tapping a node shows a name/type bar at the bottom; tap **Select** to update the chart, then **Details →** to open the full pane

### Element Detail Tabs

Each element's detail pane has up to five tabs:

**Info**
- Description, role title, current role holder
- Jurisdiction (where set — e.g. England, England & Wales, UK)
- Clickable tag pills (type and sector)
- All parent and child relationships, grouped by relationship type and clickable to navigate
- Link to GOV.UK page

**Powers**
- Powers, duties, functions, and responsibilities listed as cards, filterable by type
- Each entry shows the power type, date in force, and one or more legislative sources
- Sources link directly to [legislation.gov.uk](https://www.legislation.gov.uk) where available
- Data entered for all Cabinet ministers, the PM, the Comptroller and Auditor General, the Investigatory Powers Commissioner, and other key officials

**Budget**
- 2024–25 final outturn spending from HM Treasury OSCAR data
- Headline figures: net expenditure, gross expenditure, income
- DEL / AME split shown as a proportional bar
- Spending breakdown with three views: By Type, By Programme, By Body
- Donut charts with hover tooltips; clicking a body slice navigates to that element
- Budget data available for 37 department groups

**Staff**
- Civil Service headcount as at 31 March 2026, with 2025 data retained for comparison
- Year selector with change from the previous year
- Grade breakdown (SCS, Grade 6/7, SEO/HEO, EO, AA/AO)
- Profession breakdown, where reported
- For departments, a toggle switches between grade view, by-organisation view and profession view, and between the whole group and the core department
- Clicking a sub-organisation row navigates to that element

**Org**
- Senior leadership structure as a collapsible hierarchy of Senior Civil Service posts
- Each post shows name (where published), grade (SCS4–SCS1), job title (where published), and organisational unit
- Defaults to showing the most senior two tiers; nodes expand on click to reveal direct reports
- Shows the reference date the data was reported and a link to the source on the National Data Library

### Classification System

| Category | Subtypes |
|----------|----------|
| Official | Prime Minister, Cabinet Minister, Junior Minister, Civil Servant, Independent Official |
| Department | Ministerial Department, Non-Ministerial Department, Executive Agency, Division / Directorate |
| Body | Executive NDPB, Advisory NDPB, Public Corporation, Royal Charter Body, Tribunal, Other Body |
| Group | Cabinet, Other Group |

### Tag System

Each element can carry **type tags** (e.g. Regulator, Museum / Gallery, Armed Forces) and **sector tags** (e.g. Health, Finance, Digital / Technology). Tags are colour-coded, clickable in the element pane, and filterable in the search pane. In full view, tag filters highlight the matching elements across the entire network.

### Jurisdiction System

Departments and bodies carry a `jurisdictions` field indicating the geographic scope of their remit. The hierarchy is:

```
UK
├── GB (England, Scotland, Wales)
│   ├── England & Wales
│   │   ├── England
│   │   └── Wales
│   └── Scotland
└── Northern Ireland

Crown Dependencies  (Jersey, Guernsey, Isle of Man — separate)
Overseas Territories  (British Overseas Territories — separate)
```

Filtering by a territory shows all elements whose remit covers it — e.g. filtering for England shows UK-wide, GB, England & Wales, and England-only bodies. Elements with no jurisdiction set default to UK-wide.

---

## Data Coverage

`src/data/elements.ts` — comprehensive database of UK Government structure:
- All Cabinet ministers with current role holders
- All junior ministers across every department
- Permanent Secretaries and key independent officials
- All ministerial and non-ministerial departments
- 40+ executive agencies
- 100+ executive and advisory NDPBs
- Arms-length bodies, tribunals, ombudsmen, regulators, and public corporations
- Government professions and cross-cutting functions (Cabinet Office)

`src/data/powers.ts` — powers and legislation data for:
- All 19 Cabinet ministers (comprehensive coverage of statutory powers, duties, functions, and responsibilities)
- The Prime Minister (33+ entries covering constitutional and statutory powers)
- The Investigatory Powers Commissioner
- The Comptroller and Auditor General
- Key independent officials

`src/data/budgets-oscar.json` — 2024–25 outturn budget data for 37 department groups, pre-processed from HM Treasury OSCAR data.

`src/data/staffing.ts` — Civil Service headcount (31 March 2025 and 2026) for ministerial departments, major non-ministerial departments and their agencies, with grade and profession breakdowns and sub-organisation detail.

`src/data/organograms.ts` — Senior Civil Service post and reporting-line data sourced from the National Data Library organogram CSVs. The Cabinet Office entry is the full senior snapshot (423 posts, as at 31 March 2026). Eighteen further departments include SCS1, SCS2, SCS3, and SCS4 posts where the published senior file contains them, with FTE taken from that file.

---

## Tech Stack

- **React 18** + **TypeScript** via **Vite 5**
- **Cytoscape.js** — network graph (both focus and full views)
- **Recharts** — budget and staff donut charts
- **CSS3** — component-scoped styling with CSS custom property-based dark mode

---

## Visualization Controls

| Action | Control |
|--------|---------|
| Select an element | Click a node |
| Pan | Click and drag |
| Zoom | Scroll wheel / pinch |
| Reset layout / re-centre on PM | ↺ button (top-right of chart) — also clears selection and jurisdiction filter |
| Jump to random element | ⚄ button (top-right of chart) |
| Switch focus ↔ full view | ⊞ Full / ⊡ Focus button (chart toolbar) |
| Toggle legend | ☰ Legend button (chart toolbar, desktop only) |
| Filter by jurisdiction | 🌍 Territory button (chart toolbar) |
| Toggle dark / light mode | ☾ / ☀ button (chart toolbar or mobile nav) |
| Navigate to related element | Click a parent/child in the element pane |
| Open category pane | Click the category badge in the element pane |
| Open tag pane | Click a tag pill in the element pane |
| Search | Search button in the header / mobile nav |
| Browse categories | Categories button in the header / mobile nav |
| Help | ? Help button in the header / mobile nav |
| Preview element (mobile) | Tap a node — name and type appear in chip at bottom |
| Select element (mobile) | Tap **Select** in the chip to update the chart |
| View element details (mobile) | Tap **Details →** in the chip, or tap Details in the nav bar |

---

## Disclaimer

The information in this application is provided for general reference purposes only. While every effort has been made to ensure accuracy, the data may be incomplete, incorrect, or out of date. Government structures, ministerial appointments, and organisational relationships change frequently. The author makes no representations or warranties of any kind, express or implied, as to the accuracy, completeness, or fitness for any particular purpose of the information contained herein. The author accepts no liability whatsoever for any loss, damage, or inconvenience arising from reliance on information in this application. Always verify against official sources such as [GOV.UK](https://www.gov.uk/government/organisations).
