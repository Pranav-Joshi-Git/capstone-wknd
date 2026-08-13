# PR ready to open (once branch is pushed)

**Branch:** `adventures-denest-2026-08-05` → `main`
**Commit:** `7b5f7b2` — lint clean, verified locally.

## PR title
Make adventures list dynamic; remove nested blocks (David's Model fix)

## PR body
Replaces the nested `tabs-adventure` + `cards-adventure` structure on
`/us/en/adventures` (a David's Model violation — block inside a block) with a
dynamic, query-index-driven `article-list`.

### Changes
- **article-list**: added optional `facet` (group by an index field) and `tabs`
  (fixed tab order/labels) config. Renders accessible tabs (`role=tab/tabpanel`,
  `aria-selected`/`aria-hidden`) with no nested blocks. Magazine behaviour is
  unchanged when `facet` is absent. `FACET_ALIASES` maps raw Activity values
  (Rock Climbing→Climbing, Social/Camping→Travel) to the tab set.
- **helix-query.yaml**: index `activity` from the first `columns-facts` row on
  adventure detail pages.
- **header.css**: unitless-zero box-shadow (lint fix).

### Verification
- Lint clean (`npm run lint`, exit 0).
- Tested locally against a mock index: 6 tabs render, correct grouping with
  alias mapping, tab switching shows one panel at a time, correct ARIA, no
  horizontal overflow, cards link to real (non-redirected) URLs.

### Behaviour change (intentional)
Data-driven tabs differ from the old hand-curated ones:
- **Cycling**: 3 → 4 (adds `cycling-southern-utah`, previously omitted).
- **Travel**: 6 → 5 (drops `cycling-tuscany`'s duplicate; it's now only in Cycling).

### Feature preview
https://adventures-denest-2026-08-05--capstone-wknd--pranav-joshi-git.aem.page/us/en/adventures

### Post-merge (author steps in DA)
1. Republish the 16 adventure detail pages so `activity` populates in the index.
2. Edit `/us/en/adventures`: replace the old tabs block with:

   | article-list | |
   |---|---|
   | source | `/us/en/adventures/` |
   | facet | `activity` |
   | tabs | `All, Climbing, Cycling, Skiing, Surfing, Travel` |
   | limit | `0` |

3. After verifying tabs populate, delete unused `tabs-adventure` +
   `cards-adventure` blocks (follow-up PR).

## Commands to run once git auth is enabled
```
git push -u origin adventures-denest-2026-08-05
gh pr create --base main --head adventures-denest-2026-08-05 \
  --title "Make adventures list dynamic; remove nested blocks (David's Model fix)" \
  --body-file docs/adventures-denest-PR.md
```
