Let me verify the merge and analyze the three columns blocks in detail before drafting the focused plan.I'll use read-only tools instead.Let me read all three columns blocks (JS + CSS) to design the variants accurately.All three JS files are the **same logic** — only class prefixes differ (columns-featured adds one extra `columns-featured-text` line). Now the CSS to see how much diverges, and confirm which pages use each.I have the full picture. Both are the same JS logic; CSS differs (facts = stacked label/value with accent bar; featured = image+text promo). Both fold cleanly into `columns` via `.columns.facts` / `.columns.featured`. Let me confirm exact page usage for the re-authoring impact.I have everything needed for a precise, columns-only plan. One decision point (the JS-dispatch approach) genuinely shapes execution — let me confirm it.# WKND Capstone — Columns Block Variants Plan (Phase 2a)

## Objective
Consolidate the two forked columns blocks — `columns-facts` and `columns-featured` — into **variants of the base `columns` block** (`.columns.facts`, `.columns.featured`), per the mentor's review. **Scope is columns-only.** No other block is touched until this is closed and merged.

> Plan mode. Execution requires **Execute mode**.

## Status of prior work
- **Design tokens: DONE & MERGED to `main`** (verified: `--brand-accent` present in `styles.css`). All three columns CSS files already use tokens.

## Analysis (verified in repo)

### JS — all three are the same logic
`columns.js`, `columns-facts.js`, `columns-featured.js` are identical except:
- class **prefix** (`columns-` vs `columns-facts-` vs `columns-featured-`)
- `columns-featured.js` adds **one** extra line: tags the non-image column `columns-featured-text`.

→ A single `columns.js` can serve all three with unified `columns-*` class hooks.

### CSS — genuinely different presentation (this is the real content of each variant)
- **base `columns`**: flex rows, image-col ordering, responsive side-by-side. (34 lines)
- **`columns-facts`**: stacked label/value pairs, left yellow accent bar, small-caps label, bold value. (51 lines)
- **`columns-featured`**: grey promo band, image ~58% + text col, heading, yellow CTA button. (83 lines)

→ Facts and featured are legitimate **visual variants**, not new logic. Perfect variant candidates.

### Chosen approach (your decision): **Unify to `columns-*` classes**
- `columns.js` emits one shared class set for every variant: `columns-img-col` for image-only columns, and `columns-text` for the non-image column.
- Rewrite the facts + featured CSS selectors to be scoped under `.columns.facts` / `.columns.featured`, using the unified `columns-img-col` / `columns-text` hooks.
- Net: one block folder, cleaner CSS, no per-variant class prefixes.

## Authoring impact (answering your Q2)
**Yes — only the block *name* changes in DA** (no cell/structure changes). Affected pages:
- **`columns-facts` → `Columns (facts)`:** **16 pages** — every adventure detail page (`/us/en/adventures/*`).
- **`columns-featured` → `Columns (featured)`:** **2 pages** — `/us/en` (home) and `/us/en/magazine`.
- **Total: 18 pages** to re-author (rename block header only). Agent supplies the exact block table for each; you do the DA edits.

## Migration strategy (safe, no interim breakage)
1. **Ship code first** — base `columns` supports `.facts` and `.featured` variants **while the old `columns-facts` / `columns-featured` blocks still exist and work**. Nothing breaks pre-re-author.
2. **You re-author** the 18 DA pages to the new variant block names → preview + publish.
3. **Verify** live pages render identically.
4. **Delete** old `columns-facts` + `columns-featured` block folders (+ DA library docs / sheet entries).
5. **Update** `/library/blocks.json` + a multi-variant `columns` library doc (default + facts + featured), matching the cards/article-list pattern.

## Risks / guardrails
- **Visual parity is the acceptance bar** — computed styles on adventure detail (facts) + home/magazine (featured) must match current. Verify per variant before deleting old blocks.
- **Order of ops:** never delete old blocks before all their pages are re-authored (else empty render in the gap).
- **Branch name** short (e.g. `columns-variants`).
- Re-verify Lighthouse deferred to the very end (per your earlier note); token/variant changes are CSS-only, no perf cost expected.

## Checklist

### Code (agent, Execute mode)
- [ ] Add `.facts` + `.featured` variant support to `columns.js` (unified `columns-img-col` / `columns-text` hooks; base behavior unchanged)
- [ ] Fold `columns-facts` styles into `columns.css` under `.columns.facts`
- [ ] Fold `columns-featured` styles into `columns.css` under `.columns.featured`
- [ ] Keep old `columns-facts` / `columns-featured` blocks intact for now (backward-compat)
- [ ] `npm run lint` passes
- [ ] Verify (local draft + mock) all 3 render: base, facts, featured — computed styles match current
- [ ] Feature branch + PR; merge

### Content re-authoring (user, DA)
- [ ] Rename block on 16 adventure detail pages: `columns-facts` → `Columns (facts)` (agent supplies table)
- [ ] Rename block on 2 pages (`/us/en`, `/us/en/magazine`): `columns-featured` → `Columns (featured)`
- [ ] Preview + publish all 18 pages
- [ ] Confirm live pages render identically

### Cleanup (agent, after re-author verified)
- [ ] Delete `blocks/columns-facts/` and `blocks/columns-featured/`
- [ ] Remove their DA `/blocks/*` docs
- [ ] Update `/library/blocks.json` (drop the two, keep single `Columns`)
- [ ] Update/author multi-variant `Columns` library doc (default + facts + featured)
- [ ] `npm run lint`; PR; merge

### Close out (columns only)
- [ ] Final visual spot-check: adventure detail, home, magazine
- [ ] Confirm columns consolidation complete before considering any other block

## Notes
- Other blocks (cards-adventure, tabs-adventure, hero-adventure, accordion-faq, etc.) are **explicitly out of scope** until columns is fully closed and merged.

> Execution requires **Execute mode**. No code changes made this turn.
