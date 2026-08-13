# Plan: De-nest the Adventures landing page (David's Model fix)

**Status:** Plan only — no code changes yet.
**Scope:** `/us/en/adventures` (landing) + `helix-query.yaml` + `blocks/article-list`. Detail pages untouched.

## Problem
`/us/en/adventures` uses `tabs-adventure`, and inside each of its 6 tabs
(`All, Climbing, Cycling, Skiing, Surfing, Travel`) sits a **nested `cards-adventure`
table** (6 groups, 32 rows). `tabs-adventure.js` manually runs `decorateBlock` +
`loadBlock` on those nested tables. Block-inside-a-block violates David's Model and
is fragile.

The 16 adventure **detail** pages are fine — `tabs-detail` holds only default content,
no nested tables.

## Why query-index works here
Every adventure detail page already has an **`Activity`** field (Cycling, Skiing, …)
in its `columns-facts` block — the same categories the tabs represent. So the landing
page can be generated from the index instead of hand-authored nested cards.

## Chosen approach: extend `article-list` with a category facet
Keep one list block; add optional config so it can group indexed items by a field.

### 1. `helix-query.yaml` — add one property
```yaml
      activity:
        select: .columns-facts > div:has(> div:first-child:contains("Activity")) > div:last-child
        value: # text of the Activity value cell
```
> Exact selector to be finalized against rendered DOM during implementation
> (columns-facts renders label/value divs). Republish all adventure pages afterward
> so `activity` populates in `/query-index.json`.

### 2. `blocks/article-list` — new optional config
Add to `DEFAULTS` and `readBlockConfig` handling:
- `facet` (e.g. `activity`) — when set, group results into tabs by this field.
- `tabs` (optional, comma-separated) — fixed tab order + labels, e.g.
  `All, Climbing, Cycling, Skiing, Surfing, Travel`. First tab (`All`) shows everything.
- Existing `source` filter reused: set to `/us/en/adventures/` for this page.

Behavior when `facet` is present:
- Fetch + filter by `source` (as today).
- Build a tablist from `tabs` (or derive distinct facet values if `tabs` omitted).
- Each panel = cards whose `article[facet]` matches (All = no filter).
- Reuse the existing card markup + CSS; add lightweight tab switching (aria-selected,
  role=tab/tabpanel). **No nested blocks, no `loadBlock`.**

When `facet` absent → current magazine behavior, unchanged.

### 3. Re-author `/us/en/adventures` in DA (user does this)
Replace the whole `tabs-adventure` (+ nested `cards-adventure`) with ONE block:

| article-list | |
|---|---|
| source | `/us/en/adventures/` |
| facet | `activity` |
| tabs | `All, Climbing, Cycling, Skiing, Surfing, Travel` |
| limit | `0` |

(`limit: 0` = show all.)

### 4. Retire now-unused blocks
Once the page no longer references them (only this page did):
- Delete `blocks/tabs-adventure/`
- Delete `blocks/cards-adventure/`
Keep `tabs-detail` (still used by detail pages).

## Size & impact
| Item | Effort | Notes |
|---|---|---|
| helix-query.yaml (`activity`) | XS | ~4 lines + republish adventures |
| Extend article-list (facet/tabs) | S–M | ~60–90 lines JS + small tab CSS; magazine path unchanged |
| Re-author landing in DA | S | User pastes one block table; big simplification |
| Remove tabs-adventure + cards-adventure | XS | Only this page used them |
| Detail pages | none | Untouched |

**Risks / notes**
- Re-authoring is manual in DA (agent can't edit DA content). Exact block table above.
- One-time index rebuild required after adding `activity`.
- Fixed tab order via `tabs` config (don't rely on discovery order).
- Card parity: index already has `title`, `description`, `image` — matches current cards.
- Verify a11y: new tabs need role=tab/tabpanel + keyboard support (reuse tabs-detail pattern).

## Rollout
Feature branch → verify locally (all 6 tabs populate, keyboard nav, no overflow) →
PR to main → user re-authors DA page + republishes adventures → confirm live.
