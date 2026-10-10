---
name: add-powers-data
description: Use when the user wants to add or update powers, duties, functions or responsibilities for an element in src/data/powers.ts (e.g. a minister, commissioner or regulator). Covers the PowerProfile structure, sourcing from legislation.gov.uk, source types, and verification.
---

# Add or update powers data

Powers live in `powerProfiles` in `src/data/powers.ts`, keyed by the element's ID in `elements.ts`. Not every element needs a profile; absence means no data yet.

## Before writing

1. Confirm the element exists in `src/data/elements.ts` (use its exact `id`). If not, add it first (see `manage-elements`).
2. Check whether a profile already exists in `powers.ts` and extend it rather than duplicating the key.
3. **Source from primary legislation.** Use WebSearch/WebFetch on legislation.gov.uk (and, for case law, the neutral citation) to verify section numbers, years and wording. Don't cite sections you haven't confirmed. If a power can't be verified, leave it out and tell the user.

## Structure

```ts
'element-id': {
  elementId: 'element-id',
  lastReviewed: 'YYYY-MM-DD',          // set to today's date when you add/revise entries
  powers: [
    {
      id: 'element-id-short-slug',     // unique within the file
      title: 'Short title',
      description: 'What the power/duty is, in plain English, one to three sentences.',
      powerType: 'power' | 'duty' | 'function' | 'responsibility',
      inForceFrom: '2010',             // optional: year or ISO date
      amendedDate?: string,
      sources: [
        {
          type: 'act' | 'statutory-instrument' | 'prerogative' | 'case-law' | 'convention',
          title: 'Constitutional Reform and Governance Act 2010',
          section: 's.3(1)',           // optional
          year: 2010,                  // optional
          legislationUrl: 'https://www.legislation.gov.uk/ukpga/2010/25',
          caseRef: '[2019] UKSC 41',   // case-law only
        },
      ],
      notes?: string,
    },
  ],
},
```

Conventions:
- Use the `power` / `duty` / `function` / `responsibility` distinction accurately: "may" = power, "must/shall" = duty.
- Prefer `legislationUrl` on every statutory source, linking to the Act (or section) on legislation.gov.uk.
- Prerogative and convention sources have no URL; describe them in `title`/`notes`.
- Match the tone and density of neighbouring entries; keep descriptions neutral and factual.

## Verify

`npx tsc --noEmit -p .` must pass. Check every new `id` is unique (grep) and that the element's Powers tab would pick up the profile (key equals element `id`). Update the README's powers coverage list if you added coverage for a new type of official.

## Report

List the element(s) and number of entries added, and flag any sources you couldn't verify. Do not commit unless asked.
