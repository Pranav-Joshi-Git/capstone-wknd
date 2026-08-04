/*
 * Search block
 * Client-side search over the site query index (/query-index.json).
 * Placed in the nav "tools" slot. Filters index entries by title/description
 * and renders a small results dropdown.
 */

const DEFAULT_INDEX = '/query-index.json';

async function fetchIndex(indexPath) {
  try {
    const resp = await fetch(indexPath);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

function renderResults(resultsEl, matches) {
  resultsEl.textContent = '';
  if (!matches.length) {
    resultsEl.setAttribute('hidden', '');
    return;
  }
  const ul = document.createElement('ul');
  matches.slice(0, 10).forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.path;
    a.textContent = item.title || item.path;
    li.append(a);
    ul.append(li);
  });
  resultsEl.append(ul);
  resultsEl.removeAttribute('hidden');
}

export default async function decorate(block) {
  const indexPath = block.textContent.trim() || DEFAULT_INDEX;
  block.textContent = '';

  const form = document.createElement('div');
  form.className = 'search-box';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');

  const results = document.createElement('div');
  results.className = 'search-results';
  results.setAttribute('hidden', '');

  form.append(input, results);
  block.append(form);

  let index = null;

  const runSearch = async () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      renderResults(results, []);
      return;
    }
    if (!index) index = await fetchIndex(indexPath);
    const matches = index.filter((item) => {
      const hay = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      return hay.includes(q);
    });
    renderResults(results, matches);
  };

  input.addEventListener('input', runSearch);
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) results.setAttribute('hidden', '');
  });
}
