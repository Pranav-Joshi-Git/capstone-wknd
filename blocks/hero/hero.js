/**
 * "adventure" variant: full-width image with an overlaid white content card
 * (heading, text, CTA). On mobile the card flows below the image; on desktop
 * it overlays centered at the image bottom.
 * @param {Element} block the hero block (with the adventure variant class)
 */
function decorateAdventure(block) {
  const imageDiv = block.querySelector(':scope > div:first-child');
  if (!imageDiv || !imageDiv.querySelector('picture')) {
    block.classList.add('no-image');
    return;
  }
  imageDiv.classList.add('hero-adventure-image');

  // the non-image div is the content card
  const contentDiv = [...block.children].find((d) => !d.querySelector('picture'));
  if (contentDiv) contentDiv.classList.add('hero-adventure-content');
}

/**
 * loads and decorates the hero block
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  if (block.classList.contains('adventure')) {
    decorateAdventure(block);
  }
  // base hero needs no JS decoration (heading over background image via CSS)
}
