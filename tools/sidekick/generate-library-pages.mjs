/* eslint-disable no-console */
/**
 * Generate DA block-library demo pages: harvest real block markup from live
 * pages and wrap each with a library-metadata section. One HTML file per block,
 * written to tools/sidekick/blocks/ for upload to Document Authoring.
 *
 * Usage: node tools/sidekick/generate-library-pages.mjs
 */
import { writeFile, mkdir } from 'fs/promises';

const BASE = 'https://main--capstone-wknd--pranav-joshi-git.aem.live';
const OUT = new URL('./blocks/', import.meta.url);

// block -> { page, name, description, searchTags }
const BLOCKS = {
  'accordion-faq': { page: 'us/en/faqs', name: 'Accordion FAQ', description: 'Expandable question/answer list. First cell per row is the question, second is the answer.', searchTags: 'faq, accordion, questions, expand, collapse' },
  'article-list': { page: null, name: 'Article List', description: 'Dynamic list of articles/adventures from the query index. Config rows: source (path prefix), index, limit, optional facet + tabs to group into tabs.', searchTags: 'articles, dynamic, query-index, cards, list, tabs, facet' },
  author: { page: 'us/en/magazine/western-australia', name: 'Author', description: 'Contributor card: avatar image, name, and title/role. Used on article bylines and About contributors.', searchTags: 'author, byline, contributor, avatar, profile' },
  cards: { page: 'us/en', name: 'Cards', description: 'Standard card grid. Each row is a card: image cell + text cell.', searchTags: 'cards, grid, teaser, tiles' },
  'carousel-hero': { page: 'us/en', name: 'Carousel Hero', description: 'Full-width image carousel with an overlay content card (heading, text, CTA) per slide.', searchTags: 'carousel, hero, slider, banner, slideshow' },
  columns: { page: 'us/en', name: 'Columns', description: "Side-by-side content columns. Each row's cells become columns.", searchTags: 'columns, layout, side by side, grid' },
  'columns-facts': { page: 'us/en/adventures/whistler-mountain-biking', name: 'Columns Facts', description: 'Key/value fact grid (label + value pairs). Used for adventure specs like Activity, Difficulty, Price.', searchTags: 'facts, specs, key value, details, columns' },
  'columns-featured': { page: 'us/en', name: 'Columns Featured', description: 'Featured content block: eyebrow label, heading, description, CTA paired with an image.', searchTags: 'featured, promo, callout, columns, highlight' },
  hero: { page: 'us/en', name: 'Hero', description: 'Simple hero: a heading over a background image.', searchTags: 'hero, banner, header, intro' },
  'hero-adventure': { page: 'us/en', name: 'Hero Adventure', description: 'Adventure hero: full-width image with an overlaid white content card (heading, text, CTA).', searchTags: 'hero, adventure, banner, overlay, cta' },
  'members-only': { page: 'us/en/magazine', name: 'Members Only', description: 'Gated teaser row prompting sign-in to unlock members-only content.', searchTags: 'members, gated, locked, premium, sign in' },
  'related-articles': { page: 'us/en/magazine/western-australia', name: 'Related Articles', description: 'Sidebar list of related story links, typically shown alongside an article.', searchTags: 'related, articles, sidebar, links, more stories' },
  search: { page: null, name: 'Search', description: 'Search box that queries the site index and shows matching results.', searchTags: 'search, find, query, lookup' },
  'social-links': { page: 'us/en/magazine/western-australia', name: 'Social Links', description: 'Row of social media icon links (Facebook, Twitter, Instagram, ...).', searchTags: 'social, links, icons, share, follow' },
  'tabs-detail': { page: 'us/en/adventures/whistler-mountain-biking', name: 'Tabs Detail', description: 'Tabbed content panels. First cell per row is the tab label, second is the panel content.', searchTags: 'tabs, tabbed, panels, sections' },
};

// minimal representative markup for blocks with no harvestable live usage
const FALLBACK = {
  'article-list': '<div class="article-list"><div><div>source</div><div>/us/en/magazine/</div></div><div><div>index</div><div>/query-index.json</div></div><div><div>limit</div><div>4</div></div></div>',
  search: '<div class="search"><div><div>Search</div></div></div>',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function fetchPlain(page) {
  const res = await fetch(`${BASE}/${page}.plain.html`);
  if (!res.ok) return '';
  return res.text();
}

/** Extract the first balanced <div class="block ..."> ... </div> from html. */
function extract(html, block) {
  const i = html.indexOf(`class="${block}`);
  if (i < 0) return null;
  const start = html.lastIndexOf('<div', i);
  let depth = 0;
  const re = /<(\/?)div\b/g;
  re.lastIndex = start;
  let m = re.exec(html);
  while (m) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) {
      const end = html.indexOf('>', re.lastIndex) + 1;
      return html.slice(start, end);
    }
    m = re.exec(html);
  }
  return null;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let count = 0;
  const entries = Object.entries(BLOCKS);
  for (const [block, meta] of entries) {
    let markup = null;
    if (meta.page) {
      // eslint-disable-next-line no-await-in-loop
      markup = extract(await fetchPlain(meta.page), block);
    }
    if (!markup) markup = FALLBACK[block];
    if (!markup) markup = `<div class="${block}"><div><div>Example</div></div></div>`;

    const libmeta = '<div class="library-metadata">'
      + `<div><div>name</div><div>${esc(meta.name)}</div></div>`
      + `<div><div>description</div><div>${esc(meta.description)}</div></div>`
      + `<div><div>searchTags</div><div>${esc(meta.searchTags)}</div></div>`
      + '</div>';

    const doc = '<!DOCTYPE html><html><head>'
      + `<title>${esc(meta.name)}</title>`
      + `<meta name="description" content="${esc(meta.description)}">`
      + '</head><body><main>'
      + `<div>${markup}</div>`
      + `<div>${libmeta}</div>`
      + '</main></body></html>\n';

    // eslint-disable-next-line no-await-in-loop
    await writeFile(new URL(`${block}.html`, OUT), doc);
    count += 1;
    console.log(`OK  ${block.padEnd(18)} <- ${meta.page || 'FALLBACK'}`);
  }
  console.log(`\nGenerated ${count} block-library pages in tools/sidekick/blocks/`);
}

main();
