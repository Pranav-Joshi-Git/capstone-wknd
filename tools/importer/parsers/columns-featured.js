/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--featured)
 * Structure (library): first row = block name; second row defines the columns.
 * The featured teaser renders as two columns: text content (pretitle, title,
 * description, CTA) in one column and the featured image in the other.
 */
export default function parse(element, { document }) {
  const teaser = element.querySelector('.cmp-teaser') || element;

  const pretitle = teaser.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
  const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
  const cta = teaser.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[href]');
  const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  const contentCol = [];
  if (pretitle) contentCol.push(pretitle);
  if (title) contentCol.push(title);
  if (description) contentCol.push(description);
  if (cta) contentCol.push(cta);

  if (!contentCol.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Two-column layout: text content + image.
  const cells = [[contentCol, image || '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
