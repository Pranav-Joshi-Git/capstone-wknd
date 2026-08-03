/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: div.cmp-accordion
 *   div.cmp-accordion__item
 *     .cmp-accordion__title  => item label
 *     .cmp-accordion__panel  => item body
 * Structure (library): 2 columns; first row = block name; each subsequent row is an
 * accordion item with the title in cell 1 and the body content in cell 2.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.cmp-accordion__item')];

  const cells = [];

  items.forEach((item) => {
    const title = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, button');
    const panel = item.querySelector('.cmp-accordion__panel, [data-cmp-hook-accordion="panel"]');

    const titleText = title ? (title.textContent || '').trim() : '';

    // Body content: prefer the meaningful text nodes inside the panel.
    let body;
    if (panel) {
      // Prefer the text wrapper; fall back to individual content elements.
      let texts = [...panel.querySelectorAll('.cmp-text')];
      if (!texts.length) texts = [...panel.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6')];
      // Drop empty elements (e.g. <h3>&nbsp;</h3> spacers in the source).
      texts = texts.filter((el) => (el.textContent || '').replace(/ /g, ' ').trim().length);
      body = texts.length ? texts : [panel];
    } else {
      body = '';
    }

    if (titleText || (Array.isArray(body) && body.length)) {
      cells.push([titleText, body]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
