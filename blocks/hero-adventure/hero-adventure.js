export default function decorate(block) {
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
