---
name: manage-elements
description: Use when the user wants to add, update, rename, move or remove an element (department, agency, body, official, group) in src/data/elements.ts. Covers choosing category/subtype, parents, jurisdictions and tags, avoiding duplicate or confusing IDs/names, updating cross-file references (staffing, professions, powers, budgets), and verifying with a type-check.
---

# Manage elements

All gov elements live in `govElements` in `src/data/elements.ts`. The `GovElement` interface at the top of that file is the source of truth for fields; the `tagDefinitions` table defines the valid tags.

## Before editing

1. **Search for duplicates and near-matches**: grep `elements.ts` for the name, common abbreviations and likely IDs (case-insensitive). Check whether the body already exists under a different name.
2. **Check for ambiguity.** Abbreviation-based IDs and names must not collide with another real organisation (e.g. `nats` was once used for The National Archives, confusing it with NATS the air traffic provider; it is now `tna`). Prefer the organisation's own accepted abbreviation, and where confusion is plausible, say so in the `description`.
3. **Verify facts rather than guess**: if a WebSearch/WebFetch tool is available, confirm the parent, status, current holder and URL on gov.uk or the organisation's own site. If you cannot verify something, say so in your final message.

## Fields

```ts
'id-slug': {
  jurisdictions: ['uk'],          // optional; absent = ['uk']. See src/data/jurisdictions.ts
  id: 'id-slug',                  // must equal the record key, unique, kebab-case
  name: 'Full Official Name',
  category: 'official' | 'department' | 'body' | 'group',
  subtype: ...,                   // must match category (below)
  description: '...',             // required; one or two sentences, factual
  role?: string,                  // officials: role title
  currentHolder?: string,         // officials: name (with honours as per gov.uk)
  currentHolderSince?: 'YYYY-MM-DD',
  infoUrl?: string,               // only if a real page exists; omit otherwise (don't invent URLs)
  parentIds: string[],            // required, [] for top-level
  secondaryParentIds?: string[],  // additional oversight/sponsorship links
  tags?: string[],                // ids from tagDefinitions
}
```

### Category / subtype

| category | valid subtypes | drawn as |
|---|---|---|
| `official` | `prime-minister`, `cabinet-minister`, `junior-minister`, `civil-servant`, `independent` | ellipse (PM heptagon, cabinet minister octagon) |
| `department` | `ministerial`, `non-ministerial`, `agency`, `division-directorate` | rectangle (agency/division: rounded) |
| `body` | `executive-ndpb`, `advisory-ndpb`, `public-corporation`, `royal-charter-body`, `tribunal`, `other` | diamond |
| `group` | `cabinet`, `other-group` | not rendered in graph views |

Use `division-directorate` for a named unit that sits inside a parent organisation (e.g. OPSI/HMSO within The National Archives) rather than an executive agency with its own framework document.

### Parents

- `parentIds` is the primary reporting/sponsorship line. A department or body usually lists its sponsoring department **and** its head official (e.g. `['dcms', 'tna-ceo']`).
- Every ID in `parentIds` / `secondaryParentIds` must exist as a key in `govElements`.
- Officials: parent is normally the organisation they lead, or `[]`/the relevant group — copy the pattern of a comparable existing official.

### Tags

- Only use ids that exist in `tagDefinitions` (type tags, then `sector-*` tags). Add a new tag definition there if genuinely needed.
- Don't apply `trading-fund`, `statutory-regulator`, `professional-regulator` etc. unless true. Pick `sector-*` tags that describe the policy area (not a coincidental one).
- Professional regulators additionally need an entry in `src/data/professions.ts`.

### Jurisdictions

Omit for UK-wide bodies. Otherwise list the real coverage (`england`, `england-wales`, `gb`, `scotland`, …). Filtering `england` also surfaces `uk`/`gb`/`england-wales` elements via `JURISDICTION_COVERS`.

## Adding

1. Pick a placement near related elements (same section of the file), following the surrounding entry style (single quotes, 2-space indent, trailing commas).
2. Add the entry, plus a head-official element if the organisation has a named chief executive/DG and comparable organisations have one.
3. Check the new element is not an orphan: its parents exist, and it appears under its parent.

## Updating / renaming / moving / removing

- **Rename an ID**: grep the whole `src/` tree for the old ID (including quoted forms) and update every reference: `parentIds`/`secondaryParentIds` in elements.ts, keys and `elementId` fields in `staffing.ts`, `professions.ts`, `powers.ts`, `budgets*.ts`/`budgets-oscar.json`. If both old and new IDs already exist in a data file, merge history rather than duplicating years.
- **Change holder**: update `currentHolder` and `currentHolderSince` together.
- **Remove**: also remove it from other elements' `parentIds`/`secondaryParentIds`, and decide with the user what happens to children and to its staffing/budget/powers data. Don't silently delete data.
- **Machinery-of-government change** (a body moves department): change `parentIds`; consider whether staffing/budget history still applies.
- If the user says a field is wrong (e.g. a URL doesn't exist, a tag isn't true), remove or correct just that field rather than the whole element, unless they clearly ask to delete the element.

## Verify

```bash
npx tsc --noEmit -p .
```

Must pass. Then grep for the id to confirm there is exactly one definition and that all references resolve. Optionally run `npm run dev` to see the node in the graph.

## Report

Summarise what was added/changed, list anything unverified (URLs, holders, dates), and mention any cross-file updates made.
