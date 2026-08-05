import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';

const DEFAULTS = {
  // path prefix(es) that identify magazine articles in the query index.
  // Accepts a comma-separated list so multiple folders can be included.
  source: '/us/en/magazine/, /us/en/new-magazine/',
  // query index feed
  index: '/query-index.json',
  // max number of articles to show (0 = all)
  limit: 4,
};

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
 * loads and decorates the article-list block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const cfg = { ...DEFAULTS, ...readBlockConfig(block) };
  const limit = parseInt(cfg.limit, 10) || 0;

  block.textContent = '';

  // source may list several path prefixes, comma-separated
  const prefixes = cfg.source.split(',').map((s) => s.trim()).filter(Boolean);

  const articles = (await fetchArticles(cfg.index))
    .filter((a) => a.path && prefixes.some((p) => a.path.startsWith(p)))
    .slice(0, limit > 0 ? limit : undefined);

  const ul = document.createElement('ul');
  articles.forEach((article) => ul.append(buildCard(article)));
  block.append(ul);
}
