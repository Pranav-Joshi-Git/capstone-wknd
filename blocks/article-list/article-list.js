import { createOptimizedPicture, readBlockConfig, toClassName } from '../../scripts/aem.js';

const DEFAULTS = {
  // path prefix(es) that identify articles in the query index.
  // Accepts a comma-separated list so multiple folders can be included.
  source: '/us/en/magazine/, /us/en/new-magazine/',
  // query index feed
  index: '/query-index.json',
  // max number of articles to show (0 = all)
  limit: 4,
  // optional index field to group items into tabs by (e.g. "activity").
  // when empty, the block renders a single flat list (magazine behaviour).
  facet: '',
  // optional comma-separated tab labels defining tab order. The first label
  // is treated as the "show everything" tab. When empty, tabs are derived
  // from the distinct facet values found in the data.
  tabs: '',
  // heading shown above the compact ("related") variant list
  heading: 'Share this Story',
};

// maps raw index facet values to display/tab buckets. Raw adventure "Activity"
// values (Rock Climbing, Social, Camping, ...) are normalised to the tab set
// used on the adventures landing page.
const FACET_ALIASES = {
  'rock climbing': 'Climbing',
  climbing: 'Climbing',
  cycling: 'Cycling',
  skiing: 'Skiing',
  surfing: 'Surfing',
  social: 'Travel',
  camping: 'Travel',
  travel: 'Travel',
};

/**
 * Normalise a raw facet value to its display bucket.
 * @param {string} raw raw value from the index
 * @returns {string} normalised bucket label (falls back to the raw value)
 */
function bucketFor(raw) {
  if (!raw) return '';
  const key = raw.trim().toLowerCase();
  return FACET_ALIASES[key] || raw.trim();
}

/**
 * Format a publish date (YYYY-MM-DD or epoch) as "Weekday, D Mon YYYY".
 * @param {string|number} value raw date value from the index
 * @returns {string} formatted date, or '' when unparseable
 */
function formatDate(value) {
  if (!value) return '';
  let date;
  if (/^\d+$/.test(String(value))) {
    const n = Number(value);
    date = new Date(n < 1e12 ? n * 1000 : n);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Fetch and normalize entries from the query index.
 * @param {string} indexPath absolute path to the query-index.json
 * @returns {Promise<Array>} array of index entries
 */
async function fetchArticles(indexPath) {
  try {
    const resp = await fetch(indexPath);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Build a single article teaser card.
 * @param {object} article query-index entry
 * @returns {HTMLElement} li element
 */
function buildCard(article) {
  const li = document.createElement('li');

  if (article.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'article-list-card-image';
    const pic = createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]);
    imageDiv.append(pic);
    const link = document.createElement('a');
    link.href = article.path;
    link.append(imageDiv);
    li.append(link);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  if (article.title) {
    const title = document.createElement('h3');
    const titleLink = document.createElement('a');
    titleLink.href = article.path;
    titleLink.textContent = article.title;
    title.append(titleLink);
    body.append(title);
  }

  if (article.description) {
    const desc = document.createElement('p');
    desc.textContent = article.description;
    body.append(desc);
  }

  li.append(body);
  return li;
}

/**
 * Build a <ul> card list from a set of articles.
 * @param {Array} articles index entries
 * @returns {HTMLElement} ul element
 */
function buildList(articles) {
  const ul = document.createElement('ul');
  articles.forEach((article) => ul.append(buildCard(article)));
  return ul;
}

/**
 * Render a flat card list (default / magazine behaviour).
 * @param {Element} block the block element
 * @param {Array} articles filtered index entries
 */
function renderFlat(block, articles) {
  block.append(buildList(articles));
}

/**
 * Render a compact link list (title + date), used as a "related stories"
 * sidebar. Shows a heading and excludes the current page.
 * @param {Element} block the block element
 * @param {Array} articles filtered index entries
 * @param {string} heading heading text (from the `heading` config)
 * @param {number} limit max items to show (0 = all), applied after excluding
 *   the current page
 */
function renderCompact(block, articles, heading, limit) {
  const currentPath = window.location.pathname.replace(/\.html$/, '');

  if (heading) {
    const h = document.createElement('h5');
    h.className = 'article-list-heading';
    h.textContent = heading;
    block.append(h);
  }

  const ul = document.createElement('ul');
  ul.className = 'article-list-compact-list';

  articles
    .filter((a) => a.path.replace(/\.html$/, '') !== currentPath)
    .slice(0, limit > 0 ? limit : undefined)
    .forEach((article) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = article.path;

      const title = document.createElement('span');
      title.className = 'article-list-compact-title';
      title.textContent = article.title || article.path;
      link.append(title);

      const date = formatDate(article.publishDate);
      if (date) {
        const dateEl = document.createElement('span');
        dateEl.className = 'article-list-compact-date';
        dateEl.textContent = date;
        link.append(dateEl);
      }

      li.append(link);
      ul.append(li);
    });

  block.append(ul);
}

/**
 * Render a tabbed card list grouped by a facet.
 * @param {Element} block the block element
 * @param {Array} articles filtered index entries
 * @param {string} facet index field to group by
 * @param {string[]} tabLabels ordered tab labels (first = "all")
 * @param {number} limit max cards PER category tab (0 = all); the "All" tab
 *   shows the union of every category tab's (limited) cards
 */
function renderTabbed(block, articles, facet, tabLabels, limit) {
  // derive tab labels from data when none were configured
  let labels = tabLabels;
  if (!labels.length) {
    const found = [...new Set(articles.map((a) => bucketFor(a[facet])).filter(Boolean))].sort();
    labels = ['All', ...found];
  }

  // limit applies per category tab (not globally); "All" is their union
  const perCategory = new Map();
  labels.slice(1).forEach((label) => {
    const matches = articles.filter((a) => bucketFor(a[facet]) === label);
    perCategory.set(label, limit > 0 ? matches.slice(0, limit) : matches);
  });
  const selected = new Set();
  perCategory.forEach((list) => list.forEach((a) => selected.add(a)));
  const allItems = articles.filter((a) => selected.has(a));

  const tablist = document.createElement('div');
  tablist.className = 'article-list-tabs';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'article-list-panels';

  labels.forEach((label, i) => {
    const id = toClassName(label);
    const matches = i === 0 ? allItems : perCategory.get(label);

    // panel
    const panel = document.createElement('div');
    panel.className = 'article-list-panel';
    panel.id = `article-list-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `article-list-tab-${id}`);
    panel.setAttribute('aria-hidden', !!i);
    panel.append(buildList(matches));
    panels.append(panel);

    // tab button
    const button = document.createElement('button');
    button.className = 'article-list-tab';
    button.id = `article-list-tab-${id}`;
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `article-list-panel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.addEventListener('click', () => {
      panels.querySelectorAll('[role=tabpanel]').forEach((p) => p.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      panel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
  });

  // hide tabs that have no matching items (keeps the "all" tab)
  [...tablist.children].forEach((btn, i) => {
    if (i === 0) return;
    const panel = panels.querySelector(`#${btn.getAttribute('aria-controls')}`);
    if (!panel.querySelector('li')) btn.remove();
  });

  block.append(tablist, panels);
}

/**
 * loads and decorates the article-list block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const cfg = { ...DEFAULTS, ...readBlockConfig(block) };
  const limit = parseInt(cfg.limit, 10) || 0;

  const compact = block.classList.contains('compact');
  // tabbed variant: explicit `tabbed` class, or (back-compat) a facet configured
  const tabbed = block.classList.contains('tabbed') || !!cfg.facet;

  block.textContent = '';

  // source may list several path prefixes, comma-separated
  const prefixes = cfg.source.split(',').map((s) => s.trim()).filter(Boolean);

  let articles = (await fetchArticles(cfg.index))
    .filter((a) => a.path && prefixes.some((p) => a.path.startsWith(p)));

  // the flat variant caps the whole grid here; compact limits after excluding
  // the current page (in renderCompact); tabbed limits PER tab (in renderTabbed)
  if (!compact && !tabbed && limit > 0) articles = articles.slice(0, limit);

  if (compact) {
    renderCompact(block, articles, cfg.heading, limit);
  } else if (tabbed) {
    const tabLabels = cfg.tabs.split(',').map((s) => s.trim()).filter(Boolean);
    renderTabbed(block, articles, cfg.facet, tabLabels, limit);
  } else {
    renderFlat(block, articles);
  }
}
