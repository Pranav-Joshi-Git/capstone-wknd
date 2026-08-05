# EDS Architecture Notes

A quick reference for how an AEM Edge Delivery Services (EDS) project fits together.

## Page load flow

```
head.html            → injected into every page's <head>; loads aem.js + scripts.js
   ↓
scripts.js           → orchestrator: decides WHICH blocks load and WHEN (3 phases)
   ↓ (calls aem.js loaders)
aem.js               → the framework: fetches each block's JS+CSS, injects CSS, calls decorate()
   ↓
blocks/<name>/<name>.js → decorate(): the actual rendering for that block (your code)
   ↓
delayed.js           → runs last (~3s), for non-critical third-party scripts
```

## Core JS files

| File | Role | Edit it? |
|------|------|----------|
| `scripts/aem.js` | Core framework — page decoration, block loading, helpers (`createOptimizedPicture`, `readBlockConfig`, `loadCSS`). Identical across projects. | ❌ Never |
| `scripts/scripts.js` | Your entry point. Controls the 3 load phases + site-wide customization (auto-blocking). | ✅ Yes |
| `scripts/delayed.js` | Non-critical, deferred code: analytics, chat, consent, A/B, martech. | ✅ Yes |

### Three-phase loading (driven by scripts.js)
- **Eager** — only what's needed for the first screen (LCP). Fast first paint.
- **Lazy** — everything else: header, footer, remaining blocks, `lazy-styles.css`.
- **Delayed** — kicks off `delayed.js` after a pause, so third-party code never hurts performance.

### Who renders a block?
Division of labor — no single file does it all:
- `scripts.js` decides *when/which* block to load.
- `aem.js` is the *courier*: fetches `<name>.js` + `<name>.css`, injects CSS, calls `decorate()`.
- `blocks/<name>/<name>.js` holds the *actual rendering logic*.

Each block is a separate file loaded only when present on the page → automatic code-splitting → fast.

## Config / data files

| File | Purpose |
|------|---------|
| `helix-query.yaml` | Defines the **query index**: which pages to crawl + which fields to extract. Output = `/query-index.json`, a JSON feed of your content. Powers dynamic listings (article lists, related content, search) with no backend. Add a page → it enters the index on publish → listings update, no code change. |
| `helix-sitemap.yaml` | Defines how **sitemap.xml** is generated, sourced from the query index. Maps entries to `<url>` + `<lastmod>`. |
| `robots.txt` | Tells crawlers what they may crawl (`Disallow`) and points them to the sitemap. Advisory (not security); `Disallow` blocks crawling, not indexing. |

### How they connect
```
pages → helix-query.yaml → /query-index.json ─┬─→ blocks (dynamic listings)
                                              └─→ helix-sitemap.yaml → sitemap.xml
robots.txt → gatekeeper for bots + points to → sitemap.xml
```
The query index is the single source of truth for "what pages exist"; the sitemap and dynamic blocks both consume it.

## Migration tooling (build-time, not shipped to the site)

| Folder | Purpose |
|--------|---------|
| `catalog/` | Site **scoping**: inventory of all URLs, grouped by template, block variants, effort estimate. Throwaway after migration. |
| `migration-work/` | Intermediate **analysis** artifacts (cleaned HTML, screenshots, structure JSON) used to generate parsers/transformers. Throwaway. |
| `tools/importer/` | The **migration machine**: converts old HTML → EDS content. Keep only if you'll re-run imports. |

Inside `tools/importer/`:
- `page-templates.json` — page types and which blocks each uses
- `parsers/*.js` — one per block; reshapes old HTML into EDS block structure
- `transformers/*.js` — site-wide DOM cleanup applied to every page
- `import-*.js` — orchestration per template (cleanup + parsers over a URL list)
- `urls-*.txt` — source URLs per template

Flow: `import-X.js` reads `urls-X.txt` → cleans each page → runs parsers → outputs EDS content.

## Standard project structure

```
├── blocks/<name>/       # reusable blocks: <name>.js + <name>.css
├── styles/
│   ├── styles.css       # minimal global styling (LCP-critical)
│   ├── lazy-styles.css  # below-the-fold styling
│   └── fonts.css        # @font-face definitions
├── scripts/
│   ├── aem.js           # core framework (never edit)
│   ├── scripts.js       # entry point / phase orchestration
│   └── delayed.js       # deferred third-party code
├── head.html            # global <head> content
└── 404.html             # custom 404
```
