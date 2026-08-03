/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import authorParser from "./parsers/author.js";
import socialLinksParser from "./parsers/social-links.js";
import articleListParser from "./parsers/article-list.js";

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from "./transformers/wknd-cleanup.js";

// PARSER REGISTRY
const parsers = {
  "author": authorParser,
  "social-links": socialLinksParser,
  "article-list": articleListParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "section-landing",
    "description": "Standalone section landing page. About Us: intro heading/text plus contributor cards (name, title, social links). Magazine landing: heading plus a card grid of all articles.",
    "urls": [
      "https://wknd.site/us/en/about-us.html",
      "https://wknd.site/us/en/magazine.html"
    ],
    "blocks": [
      {
        "name": "author",
        "instances": [
          ".cmp-experience-fragment--contributor"
        ]
      },
      {
        "name": "social-links",
        "instances": [
          ".cmp-experience-fragment--contributor div.cmp-buildingblock--btn-list"
        ]
      },
      {
        "name": "article-list",
        "instances": [
          "div.image-list.list"
        ]
      }
    ]
  };

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    if (blockDef.name.startsWith("section-")) return;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers("beforeTransform", main, payload);

    // 2. discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block (skip already-replaced elements)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup
    executeTransformers("afterTransform", main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
