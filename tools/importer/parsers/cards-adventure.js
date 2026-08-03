/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-adventure. Base: cards.
 * Source: div.image-list.list (ul.cmp-image-list > li.cmp-image-list__item)
 * Structure (library): 2 columns; first row = block name; each subsequent row is a
 * card with the image in cell 1 and text content (title + description) in cell 2.
 * Titles are wrapped in a link so the whole card remains clickable.
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.cmp-image-list__item, li');

  const cells = [];

  items.forEach((item) => {
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');
    const titleText = item.querySelector('.cmp-image-list__item-title');
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const description = item.querySelector('.cmp-image-list__item-description');
    const href = (titleLink && titleLink.getAttribute('href'))
      || (item.querySelector('a[href]') && item.querySelector('a[href]').getAttribute('href'));

    const content = [];
    if (titleText) {
      const heading = document.createElement('h3');
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = titleText.textContent.trim();
        heading.append(link);
      } else {
        heading.textContent = titleText.textContent.trim();
      }
      content.push(heading);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      content.push(p);
    }

    if (image || content.length) {
      cells.push([image || '', content]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-adventure', cells });
  element.replaceWith(block);
}
