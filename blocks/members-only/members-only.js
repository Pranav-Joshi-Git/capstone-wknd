import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Members Only block
 * Renders locked teaser cards (WKND magazine "Members Only" section).
 * Each row = one teaser: title, description, CTA link, image.
 * A yellow lock badge overlays the top-left of each card's title.
 *
 * Expected authored structure (one row per teaser):
 *   cell 1: heading (title)
 *   cell 2: description
 *   cell 3: CTA link (Read More)
 *   cell 4: image
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    row.className = 'members-only-card';

    const title = cells.find((c) => c.querySelector('h1,h2,h3,h4,h5,h6')) || cells[0];
    const img = cells.find((c) => c.querySelector('picture, img'));
    const cta = cells.find((c) => c.querySelector('a'));
    const desc = cells.find((c) => c !== title && c !== img && c !== cta);

    // header row: lock badge + title
    if (title) {
      title.className = 'members-only-header';
      const badge = document.createElement('span');
      badge.className = 'members-only-lock';
      badge.setAttribute('aria-hidden', 'true');
      title.prepend(badge);
    }
    if (desc) desc.className = 'members-only-desc';
    if (cta) {
      cta.className = 'members-only-cta';
      const a = cta.querySelector('a');
      if (a) { a.className = 'button'; a.title = a.textContent; }
    }
    if (img) {
      img.className = 'members-only-image';
      const image = img.querySelector('img');
      if (image) {
        img.replaceChildren(
          createOptimizedPicture(image.src, image.getAttribute('alt') || '', false, [{ width: '750' }]),
        );
      }
    }
  });
}
