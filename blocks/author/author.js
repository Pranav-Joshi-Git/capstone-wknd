import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the author (contributor) block
 *
 * Expected authored structure (one block == one contributor):
 *   Row 1: avatar image
 *   Row 2: name
 *   Row 3: title / role (e.g. "Artist | Photographer | Traveler")
 *
 * The block renders a centered contributor card: circular avatar, name, title.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  const card = document.createElement('div');
  card.className = 'author-card';

  // 1. Avatar: first row that contains an image
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  if (imageRow) {
    const img = imageRow.querySelector('img');
    const avatar = document.createElement('div');
    avatar.className = 'author-avatar';
    if (img) {
      avatar.append(
        createOptimizedPicture(img.src, img.getAttribute('alt') || '', false, [{ width: '400' }]),
      );
    } else {
      avatar.append(imageRow.querySelector('picture').cloneNode(true));
    }
    card.append(avatar);
  }

  // 2. Remaining text rows: name (first) then title (second)
  const textRows = rows.filter((row) => row !== imageRow);
  const [nameRow, titleRow] = textRows;

  if (nameRow) {
    const name = document.createElement('h3');
    name.className = 'author-name';
    name.textContent = (nameRow.textContent || '').trim();
    card.append(name);
  }

  if (titleRow) {
    const title = document.createElement('p');
    title.className = 'author-title';
    title.textContent = (titleRow.textContent || '').trim();
    card.append(title);
  }

  block.textContent = '';
  block.append(card);
}
