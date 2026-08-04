import { readBlockConfig } from '../../scripts/aem.js';

const DEFAULTS = {
  source: '/us/en/magazine/',
  index: '/query-index.json',
  limit: 4,
};

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
 * Format a publish date (YYYY-MM-DD or timestamp) as "Weekday, D Mon YYYY".
 */
function formatDate(value) {
  if (!value) return '';
  let date;
  if (/^\d+$/.test(String(value))) {
    // epoch seconds or ms
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

export default async function decorate(block) {
  const cfg = { ...DEFAULTS, ...readBlockConfig(block) };
  const limit = parseInt(cfg.limit, 10) || 0;

  block.textContent = '';

  // heading
  const heading = document.createElement('h5');
  heading.className = 'related-articles-heading';
  heading.textContent = 'Share this Story';
  block.append(heading);

  const currentPath = window.location.pathname.replace(/\.html$/, '');

  const articles = (await fetchArticles(cfg.index))
    .filter((a) => a.path && a.path.startsWith(cfg.source))
    .filter((a) => a.path.replace(/\.html$/, '') !== currentPath)
    .slice(0, limit > 0 ? limit : undefined);

  const ul = document.createElement('ul');
  ul.className = 'related-articles-list';

  articles.forEach((article) => {
    const li = document.createElement('li');

    const link = document.createElement('a');
    link.href = article.path;

    const title = document.createElement('span');
    title.className = 'related-articles-title';
    title.textContent = article.title || article.path;
    link.append(title);

    const date = formatDate(article.publishDate);
    if (date) {
      const dateEl = document.createElement('span');
      dateEl.className = 'related-articles-date';
      dateEl.textContent = date;
      link.append(dateEl);
    }

    li.append(link);
    ul.append(li);
  });

  block.append(ul);
}
