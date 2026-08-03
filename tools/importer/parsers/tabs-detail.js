/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-detail. Base: tabs.
 * Source: main.cmp-layout-container--fixed div.cmp-tabs
 *   - ol.cmp-tabs__tablist > li.cmp-tabs__tab  => tab labels (in order)
 *   - div.cmp-tabs__tabpanel                   => tab panels (in matching order)
 *     Panels wrap a content-fragment (Overview / Itinerary / What to Bring).
 * Structure (library): 2 columns; first row = block name; each subsequent row is a
 * tab: label in cell 1, panel content in cell 2.
 */
export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, [role="tab"]')];
  const panels = [...element.querySelectorAll(':scope > .cmp-tabs__tabpanel, [role="tabpanel"]')];

  const cells = [];

  panels.forEach((panel, i) => {
    const label = labels[i];
    const labelText = label ? (label.textContent || '').trim() : `Tab ${i + 1}`;

    // Prefer the content-fragment body if present; otherwise use the panel's content.
    const fragmentBody = panel.querySelector('.cmp-contentfragment__elements');
    let content;
    if (fragmentBody) {
      content = [...fragmentBody.children];
    } else {
      content = panel.firstElementChild ? [...panel.children] : [panel];
    }

    cells.push([labelText, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
