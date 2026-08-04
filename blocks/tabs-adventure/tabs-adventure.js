// eslint-disable-next-line import/no-unresolved
import { toClassName, decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventure-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventure-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-adventure-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // Nested block tables inside tab panels are NOT auto-converted by the EDS
  // pipeline (that only happens for section-level blocks). Convert each nested
  // <table> into a cards-adventure block div, then decorate + load it.
  await Promise.all(
    [...block.querySelectorAll('.tabs-adventure-panel table')].map(async (table) => {
      const rows = [...table.querySelectorAll('tbody > tr, thead > tr')];
      // first row is the block-name label ("Cards Adventure") — drop it
      const [, ...contentRows] = rows;

      const cardsBlock = document.createElement('div');
      cardsBlock.className = 'cards-adventure';

      contentRows.forEach((tr) => {
        const rowDiv = document.createElement('div');
        [...tr.children].forEach((td) => {
          const cellDiv = document.createElement('div');
          while (td.firstChild) cellDiv.append(td.firstChild);
          rowDiv.append(cellDiv);
        });
        cardsBlock.append(rowDiv);
      });

      table.replaceWith(cardsBlock);
      decorateBlock(cardsBlock);
      await loadBlock(cardsBlock);
    }),
  );
}
