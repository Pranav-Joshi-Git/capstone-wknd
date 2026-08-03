/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html (div.carousel.cmp-carousel--hero)
 * Structure (library): 2 columns; first row = block name; each subsequent row is a
 * slide with the image in cell 1 and text content (title, description, CTA) in cell 2.
 */
export default function parse(element, { document }) {
  // Each carousel item is a slide. Prefer the carousel item wrapper; fall back to
  // teasers directly. Selectors are checked in order to avoid double-matching the
  // teaser nested inside each carousel item.
  let slides = [...element.querySelectorAll('.cmp-carousel__item')];
  if (!slides.length) slides = [...element.querySelectorAll('.cmp-teaser--hero, .cmp-teaser')];

  const cells = [];

  slides.forEach((slide) => {
    const teaser = slide.matches('.cmp-teaser') ? slide : slide.querySelector('.cmp-teaser') || slide;

    const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');
    const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
    const cta = teaser.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a[href]');

    const content = [];
    if (title) content.push(title);
    if (description) content.push(description);
    if (cta) content.push(cta);

    // Only emit a slide row when we have an image and/or content.
    if (image || content.length) {
      cells.push([image || '', content]);
    }
  });

  // Bail gracefully if nothing extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
