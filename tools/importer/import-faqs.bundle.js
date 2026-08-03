/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
  });

  // tools/importer/parsers/accordion-faq.js
  function parse(element, { document }) {
    const items = [...element.querySelectorAll(".cmp-accordion__item")];
    const cells = [];
    items.forEach((item) => {
      const title = item.querySelector(".cmp-accordion__title, .cmp-accordion__header, button");
      const panel = item.querySelector('.cmp-accordion__panel, [data-cmp-hook-accordion="panel"]');
      const titleText = title ? (title.textContent || "").trim() : "";
      let body;
      if (panel) {
        let texts = [...panel.querySelectorAll(".cmp-text")];
        if (!texts.length) texts = [...panel.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6")];
        texts = texts.filter((el) => (el.textContent || "").replace(/ /g, " ").trim().length);
        body = texts.length ? texts : [panel];
      } else {
        body = "";
      }
      if (titleText || Array.isArray(body) && body.length) {
        cells.push([titleText, body]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        // Empty third-party share widget placeholders (no authorable content).
        // Documented in the brief; present on article/adventure-detail templates.
        ".fb-share-button",
        ".fb-like",
        '[class*="pinterest"]',
        '[class*="pin-it"]',
        "[data-pin-do]",
        ".addthis_toolbox",
        '[class*="addthis"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header experience fragment -> becomes EDS header block, authored separately.
        // cleaned.html:5 -> <header class="experiencefragment cmp-experiencefragment--header ...">
        "header.cmp-experiencefragment--header",
        // Footer experience fragment -> becomes EDS footer block, authored separately.
        // cleaned.html:357 -> <footer class="experiencefragment cmp-experiencefragment--footer ...">
        "footer.cmp-experiencefragment--footer",
        // Breadcrumb navigation -> EDS regenerates breadcrumbs.
        // Documented in brief; present on adventure-detail / magazine-article templates.
        "nav.cmp-breadcrumb",
        ".breadcrumb.cmp-breadcrumb",
        // Language navigation / sign-in utility bar.
        // cleaned.html:14 -> <div class="sign-in-buttons ...">
        // cleaned.html:15 -> <div class="wknd-sign-in-buttons">
        // cleaned.html:21 -> <div class="languagenavigation cmp-languagenavigation--header ...">
        ".sign-in-buttons",
        ".wknd-sign-in-buttons",
        ".languagenavigation",
        // Header search widget. cleaned.html:135 -> <section class="cmp-search">
        ".cmp-search--header",
        "section.cmp-search",
        // Mobile navigation chrome. cleaned.html:454 -> <div id="toggleNav">, cleaned.html:460 -> <div id="mobileNav">
        "#toggleNav",
        "#mobileNav",
        ".cmp-navigation--mobile",
        // Standalone site navigation (defensive; header nav removed with the header XF above).
        "nav.cmp-navigation",
        // Leftover embeds / non-authorable elements.
        "iframe",
        "noscript"
      ]);
      const wrapperSelectors = [
        "div.aem-Grid",
        "div.cmp-container",
        "div.root.responsivegrid",
        "div.container.responsivegrid"
      ];
      for (let pass = 0; pass < 6; pass += 1) {
        const wrappers = element.querySelectorAll(wrapperSelectors.join(","));
        if (wrappers.length === 0) break;
        wrappers.forEach((wrapper) => {
          while (wrapper.firstChild) {
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
          }
          wrapper.remove();
        });
      }
    }
  }

  // tools/importer/import-faqs.js
  var parsers = {
    "accordion-faq": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    "name": "faqs",
    "description": "FAQ page: title, intro image and text, an accordion of question/answer items, and a contact help section.",
    "urls": [
      "https://wknd.site/us/en/faqs.html"
    ],
    "blocks": [
      {
        "name": "accordion-faq",
        "instances": [
          "div.accordion.cmp-accordion",
          "div.cmp-accordion"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_faqs_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_faqs_exports);
})();
