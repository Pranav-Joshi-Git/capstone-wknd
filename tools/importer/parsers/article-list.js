/* eslint-disable */
/* global WebImporter */
/**
 * Parser for article-list. Base: article-list (custom dynamic block).
 * Source: https://wknd.site/us/en.html and section-landing/magazine (div.image-list.list)
 *
 * article-list is a self-populating block: at runtime it fetches entries from the
 * query index (see blocks/article-list/article-list.js) and renders the cards
 * itself. The individual cards in the source are NOT serialized. Instead the parser
 * emits the block's configuration rows (key/value) that the block reads via
 * readBlockConfig: `source` (path prefix), `index` (query-index feed), `limit`.
 *
 * The source path prefix is derived from the article links present in the source
 * list so a magazine list vs. a home "recent articles" list both resolve to
 * `/us/en/magazine/`.
 */
export default function parse(element, { document }) {
  // Derive the article source prefix from the first article link in the list.
  const firstLink = element.querySelector('a.cmp-image-list__item-title-link[href], a.cmp-image-list__item-image-link[href], a[href*="/magazine/"], a[href]');
  let source = '/us/en/magazine/';
  if (firstLink) {
    const href = firstLink.getAttribute('href') || '';
    // Use the directory portion of the link (e.g. /us/en/magazine/foo.html -> /us/en/magazine/).
    const match = href.match(/^(.*\/)[^/]*$/);
    if (match && match[1].startsWith('/')) source = match[1];
  }

  // Number of cards visible in the source becomes the limit (0 = all).
  const itemCount = element.querySelectorAll('.cmp-image-list__item, li').length;
  const limit = itemCount > 0 ? String(itemCount) : '4';

  // Config rows: each row is [key, value] (2 columns), read by readBlockConfig.
  const cells = [
    ['source', source],
    ['index', '/query-index.json'],
    ['limit', limit],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
