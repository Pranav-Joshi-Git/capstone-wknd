/* eslint-disable */
/* global WebImporter */
/**
 * Parser for author. Base: author (custom block).
 * Source variants:
 *   - .cmp-experience-fragment--contributor (about-us / magazine landing):
 *       image (.cmp-image img), name (first .cmp-title h3), role (.cmp-title h5)
 *   - div.byline / div.cmp-byline (magazine article):
 *       image (.cmp-byline__image img), name (.cmp-byline__name),
 *       role (.cmp-byline__occupations)
 *
 * Structure (block JS): one column, 3 rows -> avatar image, name, title/role.
 * Each row is a single cell.
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-byline__image img, .cmp-image img, .image img, img');

  let name;
  let role;

  // Byline layout has dedicated name / occupations elements.
  const bylineName = element.querySelector('.cmp-byline__name');
  const bylineRole = element.querySelector('.cmp-byline__occupations, .cmp-byline__title');
  if (bylineName) {
    name = (bylineName.textContent || '').trim();
    role = bylineRole ? (bylineRole.textContent || '').trim() : undefined;
  } else {
    // Contributor XF layout: titles rendered via .cmp-title elements.
    const titleEls = [...element.querySelectorAll('.cmp-title__text, h1, h2, h3, h4, h5, h6')];
    const seen = new Set();
    const texts = [];
    titleEls.forEach((el) => {
      const t = (el.textContent || '').trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        texts.push(t);
      }
    });
    [name, role] = texts;
  }

  if (!image && !name) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Collect nested social links BEFORE replacing the element. The social-links
  // block is nested inside the contributor/byline element, so it must be captured
  // here (the author block replaces the whole element) and emitted as a sibling
  // social-links block right after the author block. Otherwise the nested links
  // are destroyed before the social-links parser can run.
  const socialAnchors = [...element.querySelectorAll('.cmp-buildingblock--btn-list a[href], .cmp-byline__social a[href]')];

  const cells = [];

  // Row: avatar image (single cell).
  if (image) cells.push([image]);

  // Row: name.
  if (name) {
    const nameEl = document.createElement('p');
    nameEl.textContent = name;
    cells.push([nameEl]);
  }

  // Row: title / role.
  if (role) {
    const roleEl = document.createElement('p');
    roleEl.textContent = role;
    cells.push([roleEl]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'author', cells });

  // Build a paired social-links block from the captured anchors (if any).
  let socialBlock;
  if (socialAnchors.length) {
    const socialCells = socialAnchors.map((a) => {
      const href = a.getAttribute('href') || '#';
      const label = (a.querySelector('.cmp-button__text') && a.querySelector('.cmp-button__text').textContent.trim())
        || (a.textContent || '').trim()
        || a.getAttribute('aria-label')
        || href;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      return [link];
    });
    socialBlock = WebImporter.Blocks.createBlock(document, { name: 'social-links', cells: socialCells });
  }

  if (socialBlock) {
    element.replaceWith(block, socialBlock);
  } else {
    element.replaceWith(block);
  }
}
