/* eslint-disable */
/* global WebImporter */
/**
 * Parser for social-links. Base: social-links (custom block).
 * Source: div.cmp-buildingblock--btn-list containing button links
 *   (a.cmp-button) for Facebook / Twitter / Instagram.
 *
 * Structure (block JS): the block collects every <a> inside it and renders an icon
 * list, resolving the platform from the link href/text. The parser emits one row
 * per link, each cell holding a labeled anchor so platform detection still works.
 */
export default function parse(element, { document }) {
  const anchors = [...element.querySelectorAll('a[href]')];

  if (!anchors.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  anchors.forEach((a) => {
    const href = a.getAttribute('href') || '#';
    // Prefer an explicit label (button text or aria-label) so the block can resolve
    // the platform even when the href is a bare anchor (e.g. #facebook-...).
    const label = (a.querySelector('.cmp-button__text') && a.querySelector('.cmp-button__text').textContent.trim())
      || (a.textContent || '').trim()
      || a.getAttribute('aria-label')
      || href;

    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    cells.push([link]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'social-links', cells });
  element.replaceWith(block);
}
