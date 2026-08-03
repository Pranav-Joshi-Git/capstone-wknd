# WKND Capstone Migration Plan

## Objective
Migrate the WKND site (**https://wknd.site/us/en.html**) to AEM Edge Delivery Services and satisfy the capstone's **Must-have features** and **Acceptance criteria (rubric)**. Content is imported into **Document Authoring (DA)**; code ships via feature branches + PRs to `github.com/Pranav-Joshi-Git/capstone-wknd`. Multi-site management (MSM) is **out of scope** — `us/en` is treated as our site root/main index, and everything under it is a child page.

> Drafted in Plan mode. Executing the steps below requires switching to Execute mode.

## Current State (from repo inspection)
- Fresh `@adobe/aem-boilerplate` clone. Existing blocks: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget`.
- `content/` is empty; no `fstab.yaml`, `helix-query.yaml`, or `redirects` sheet yet.
- Preview target: `pranav-joshi-git` / `capstone-wknd` → `https://main--capstone-wknd--pranav-joshi-git.aem.page`.

## Decisions Locked (from your answers)
- **Block names:** `social-links`, `author`, `article-list` — confirmed.
- **Home page:** replicate the live `/us/en` home **exactly** (same content), including cards that link to their respective Adventures / Magazine pages.
- **URL/folder structure:** mirror the live site. `us/en` = main index; all pages sit beneath it as children (e.g. `us/en/magazine/...`, `us/en/adventures/...`, `us/en/about-us`).
- **About:** standalone page (not a home-page section) — confirmed against scope during Phase 0.
- **Article scope:** migrate **all** WKND Magazine articles.
- **Content source:** Document Authoring (DA), with a snapshot + review workflow.
- **Redirects (deferred):** build the complete site as-is first. At the **end**, move a few pages into new folders (e.g. `new-magazine`, `new-adventure`) and add 301 redirects mapping old → new. Exact URLs decided then.

## Requirement → Work Mapping

### Must-have features
| Requirement | Plan |
|---|---|
| Home page with header + footer | Migrate `/us/en` home 1:1; instrument `header` (nav) and `footer` from source |
| Magazine section + About section | Migrate Magazine landing + standalone About page |
| Custom block for social links | New `social-links` block |
| Custom block for writer/photographer details | New `author` block (name, avatar, title) |
| Dynamic block listing all Magazine articles from query index | New `article-list` block reading `helix-query.yaml` (updates on publish, no code change) |
| Indexing of content (`helix-query.yaml`) | Author `helix-query.yaml` indexing magazine articles (path, title, image, author, date, description) |
| 301 redirects (≥2 old URLs) | Deferred to final phase: relocate pages → `redirects` sheet mapping old→new |
| Per-page + bulk metadata on magazine pages | Per-page metadata + bulk metadata spreadsheet for the magazine folder |

### Acceptance criteria (rubric)
| Criterion | Plan |
|---|---|
| **Functionality** | Article list driven by live index, updates on publish with no code change |
| **Performance** | Lighthouse/PSI 100 mobile on home + one article; LCP/CLS "good"; optimized images, eager/lazy phasing |
| **Accessibility** | Lighthouse a11y 100; keyboard-navigable; meaningful alt text on all images |
| **SEO** | Valid sitemap, per-page metadata incl. `og:`/`twitter:`, `robots.txt`, 301 redirects |
| **Content workflow** | Import into DA; ship ≥1 content update via snapshot + review before going live |
| **Code quality** | `npm run lint` passes; blocks follow Block Collection patterns; feature branch + PR, no direct commits to `main` |

## Phased Approach

### Phase 0 — Scope & discovery
Discover all URLs under `/us/en` (sitemap → crawl), analyze representative pages, group into templates (home, magazine landing, article, adventures, about), inventory required blocks vs. existing palette, confirm the new custom blocks. Confirm the About page and Adventures pages as standalone templates here.

### Phase 1 — Content import to DA
Author `fstab.yaml` pointing at the DA content source. Generate import infrastructure (parsers/transformers). Import home, magazine landing, About, adventures, and all articles into DA, preserving the live folder structure beneath `us/en`.

### Phase 2 — Custom blocks
Build `social-links`, `author` (name/avatar/title), and `article-list` (query-index driven). Style/instrument header (nav) and footer to match source. Follow Block Collection patterns; lint clean.

### Phase 3 — Indexing, metadata, SEO
Author `helix-query.yaml`; apply per-page + bulk metadata (incl. `og:`/`twitter:`) to the magazine folder; confirm sitemap + `robots.txt`.

### Phase 4 — QA & performance
Lighthouse/PSI on home + one article (target 100 perf & a11y), keyboard nav, alt-text audit, CWV check, `npm run lint`.

### Phase 5 — Redirects & content-workflow demo
Relocate a couple of pages into new folders (`new-magazine`/`new-adventure`), add the `redirects` sheet (≥2 old→new, returning 301). Demonstrate one content update via DA snapshot + review before publish.

### Phase 6 — Ship
Feature branch → PR with a feature-preview link to a demonstrating path. No direct commits to `main`.

## Checklist
- [ ] Discover all URLs under `/us/en` (sitemap, fallback crawl)
- [ ] Analyze pages; group into templates (home, magazine landing, article, adventures, about)
- [ ] Confirm About + Adventures as standalone page templates
- [ ] Inventory blocks; confirm new blocks: `social-links`, `author`, `article-list`
- [ ] Set up `fstab.yaml` and DA content source
- [ ] Import home page 1:1 (header + footer, cards linking to adventures/magazine)
- [ ] Import Magazine landing + standalone About page into DA
- [ ] Import Adventures pages into DA (mirroring live folder structure)
- [ ] Import all Magazine articles into DA
- [ ] Build `social-links` custom block
- [ ] Build `author` block (name, avatar, title)
- [ ] Build query-index-driven `article-list` block (updates on publish, no code change)
- [ ] Instrument/style header (nav) and footer from source
- [ ] Author `helix-query.yaml` to index magazine content
- [ ] Apply per-page + bulk metadata (incl. `og:`/`twitter:`) to magazine pages
- [ ] Verify sitemap + `robots.txt` present/valid
- [ ] Accessibility pass: keyboard nav + meaningful alt text (Lighthouse a11y 100)
- [ ] Performance pass: Lighthouse/PSI 100 mobile on home + one article; LCP/CLS "good"
- [ ] `npm run lint` passes; blocks follow Block Collection patterns
- [ ] Relocate pages to new folders + add `redirects` sheet (≥2 old→new, 301)
- [ ] Demonstrate one content update via DA snapshot + review before going live
- [ ] Ship via feature branch + PR (no direct commits to `main`) with feature-preview link

## Notes
- Redirects are intentionally the last content step: full site built first, then pages moved and 301s added — exact old/new URLs decided at that point.
- Home page must match live content exactly, including card links to their respective adventure/magazine destinations.

This plan is ready. Switch to Execute mode and I'll begin Phase 0 (scope & discovery).
