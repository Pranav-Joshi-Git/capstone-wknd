/**
 * Inline SVG paths for supported social platforms.
 * Keyed by platform slug; matched against link href / text.
 */
const ICONS = {
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.13 1.5-4.13 4.25v2.17H7.6V13h2.8v8z"/></svg>',
  twitter:
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.9c-.7.32-1.5.53-2.3.63a4 4 0 0 0 1.76-2.2c-.78.46-1.64.8-2.55.98a4 4 0 0 0-6.82 3.65A11.36 11.36 0 0 1 3.5 4.7a4 4 0 0 0 1.24 5.34c-.65-.02-1.26-.2-1.8-.5v.05a4 4 0 0 0 3.2 3.92c-.58.16-1.2.18-1.8.07a4 4 0 0 0 3.74 2.78A8.03 8.03 0 0 1 2 18.28a11.32 11.32 0 0 0 6.13 1.8c7.35 0 11.37-6.09 11.37-11.37v-.52A8.1 8.1 0 0 0 22 5.9z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.51.01-4.75.07-.9.04-1.38.19-1.7.32-.43.16-.73.36-1.05.68-.32.32-.52.62-.68 1.05-.13.32-.28.8-.32 1.7C3.21 8.49 3.2 8.86 3.2 12s.01 3.51.07 4.75c.04.9.19 1.38.32 1.7.16.43.36.73.68 1.05.32.32.62.52 1.05.68.32.13.8.28 1.7.32 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c.9-.04 1.38-.19 1.7-.32.43-.16.73-.36 1.05-.68.32-.32.52-.62.68-1.05.13-.32.28-.8.32-1.7.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.04-.9-.19-1.38-.32-1.7a2.8 2.8 0 0 0-.68-1.05 2.8 2.8 0 0 0-1.05-.68c-.32-.13-.8-.28-1.7-.32C15.51 4.01 15.14 4 12 4zm0 3.06A4.94 4.94 0 1 0 12 16.94 4.94 4.94 0 0 0 12 7.06zm0 8.15A3.21 3.21 0 1 1 12 8.79a3.21 3.21 0 0 1 0 6.42zm6.29-8.35a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>',
};

/**
 * Resolve a platform slug from a link's href/text.
 * @param {HTMLAnchorElement} a
 * @returns {string|undefined}
 */
function resolvePlatform(a) {
  const haystack = `${a.getAttribute('href') || ''} ${a.textContent || ''}`.toLowerCase();
  if (haystack.includes('facebook')) return 'facebook';
  if (haystack.includes('twitter')) return 'twitter';
  if (haystack.includes('insta')) return 'instagram';
  return undefined;
}

/**
 * loads and decorates the social-links block
 *
 * Expected authored structure: one or more links, each pointing to (or labeled
 * with) a social platform (Facebook / Twitter / Instagram). Links may be in
 * separate rows/cells or a single cell.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const anchors = [...block.querySelectorAll('a')];

  const list = document.createElement('ul');
  list.className = 'social-links-list';

  anchors.forEach((a) => {
    const platform = resolvePlatform(a);
    const label = a.textContent.trim() || platform || 'social link';

    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    link.className = `social-links-icon${platform ? ` social-links-icon--${platform}` : ''}`;
    link.setAttribute('aria-label', label);
    link.setAttribute('title', label);
    if (/^https?:/i.test(link.href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.innerHTML = platform ? ICONS[platform] : '';
    li.append(link);
    list.append(li);
  });

  block.textContent = '';
  block.append(list);
}
