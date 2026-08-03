/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-adventure. Base: hero.
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Structure (library): 1 column, 3 rows. Row 1 = block name; row 2 = background image;
 * row 3 = title + subheading + CTA. Each content row is a single cell.
 */
export default function parse(element, { document }) {
  const teaser = element.querySelector('.cmp-teaser') || element;

  const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
  const cta = teaser.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[href]');

  if (!title && !description && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell). Only add when present.
  if (image) cells.push([image]);

  // Row 3: text content (single cell holding title, subheading, CTA).
  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  if (cta) contentCell.push(cta);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-adventure', cells });
  element.replaceWith(block);
}
