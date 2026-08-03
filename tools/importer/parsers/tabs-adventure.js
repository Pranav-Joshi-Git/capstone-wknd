/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure. Base: tabs.
 * Source: div.cmp-tabs
 *   - ol.cmp-tabs__tablist > li.cmp-tabs__tab  => tab labels (in order)
 *   - div.cmp-tabs__tabpanel                   => tab panels (in matching order)
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

    // Panel content: use the meaningful inner content of the panel.
    const content = panel.firstElementChild ? [...panel.children] : [panel];

    cells.push([labelText, content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
