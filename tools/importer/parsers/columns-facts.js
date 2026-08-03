/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-facts. Base: columns.
 * Source: div.cmp-contentfragment--elements (wraps the adventure facts content fragment)
 *   dl.cmp-contentfragment__elements > div.cmp-contentfragment__element
 *     > dt.cmp-contentfragment__element-title (label)
 *     > dd.cmp-contentfragment__element-value (value)
 * Structure (library): 2 columns; first row = block name; each subsequent row is a
 * fact with the label in cell 1 and the value in cell 2.
 */
export default function parse(element, { document }) {
  const elements = [...element.querySelectorAll('.cmp-contentfragment__element')];

  const cells = [];

  elements.forEach((el) => {
    const label = el.querySelector('.cmp-contentfragment__element-title, dt');
    const value = el.querySelector('.cmp-contentfragment__element-value, dd');
    const labelText = label ? (label.textContent || '').trim() : '';
    const valueText = value ? (value.textContent || '').trim() : '';
    if (labelText || valueText) {
      cells.push([labelText, valueText]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-facts', cells });
  element.replaceWith(block);
}
