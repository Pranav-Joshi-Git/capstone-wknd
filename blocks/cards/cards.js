import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * "members-only" variant: locked teaser cards (WKND magazine section).
 * Each row = one teaser: title, description, CTA link, image. A yellow lock
 * badge overlays the title, the card is dimmed, and the CTA is non-interactive.
 * @param {Element} block the cards block (with the members-only variant class)
 */
function decorateMembersOnly(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    row.className = 'members-only-card';

    const title = cells.find((c) => c.querySelector('h1,h2,h3,h4,h5,h6')) || cells[0];
    const img = cells.find((c) => c.querySelector('picture, img'));
    const cta = cells.find((c) => c.querySelector('a'));
    const desc = cells.find((c) => c !== title && c !== img && c !== cta);

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

/**
 * Default cards decoration: image + body cells laid out as a card grid.
 * @param {Element} block the cards block
 */
function decorateDefault(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}

export default function decorate(block) {
  if (block.classList.contains('members-only')) {
    decorateMembersOnly(block);
  } else {
    decorateDefault(block);
  }
}
