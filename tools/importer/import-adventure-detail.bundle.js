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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    let slides = [...element.querySelectorAll(".cmp-carousel__item")];
    if (!slides.length) slides = [...element.querySelectorAll(".cmp-teaser--hero, .cmp-teaser")];
    const cells = [];
    slides.forEach((slide) => {
      const teaser = slide.matches(".cmp-teaser") ? slide : slide.querySelector(".cmp-teaser") || slide;
      const image = teaser.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const title = teaser.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
      const cta = teaser.querySelector(".cmp-teaser__action-link, .cmp-teaser__action-container a, a[href]");
      const content = [];
      if (title) content.push(title);
      if (description) content.push(description);
      if (cta) content.push(cta);
      if (image || content.length) {
        cells.push([image || "", content]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-facts.js
  function parse2(element, { document }) {
    const elements = [...element.querySelectorAll(".cmp-contentfragment__element")];
    const cells = [];
    elements.forEach((el) => {
      const label = el.querySelector(".cmp-contentfragment__element-title, dt");
      const value = el.querySelector(".cmp-contentfragment__element-value, dd");
      const labelText = label ? (label.textContent || "").trim() : "";
      const valueText = value ? (value.textContent || "").trim() : "";
      if (labelText || valueText) {
        cells.push([labelText, valueText]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-facts", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/social-links.js
  function parse3(element, { document }) {
    const anchors = [...element.querySelectorAll("a[href]")];
    if (!anchors.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    anchors.forEach((a) => {
      const href = a.getAttribute("href") || "#";
      const label = a.querySelector(".cmp-button__text") && a.querySelector(".cmp-button__text").textContent.trim() || (a.textContent || "").trim() || a.getAttribute("aria-label") || href;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      cells.push([link]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "social-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-detail.js
  function parse4(element, { document }) {
    const labels = [...element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, [role="tab"]')];
    const panels = [...element.querySelectorAll(':scope > .cmp-tabs__tabpanel, [role="tabpanel"]')];
    const cells = [];
    panels.forEach((panel, i) => {
      const label = labels[i];
      const labelText = label ? (label.textContent || "").trim() : `Tab ${i + 1}`;
      const fragmentBody = panel.querySelector(".cmp-contentfragment__elements");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-detail", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "carousel-hero": parse,
    "columns-facts": parse2,
    "social-links": parse3,
    "tabs-detail": parse4
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    "name": "adventure-detail",
    "description": "Adventure detail page: breadcrumb, hero image carousel with title, adventure metadata (activity, difficulty, price, etc.), share social links, and tabbed body content (overview, itinerary, what to bring).",
    "urls": [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html",
      "https://wknd.site/us/en/adventures/beervana-portland.html",
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/us/en/adventures/cycling-tuscany.html",
      "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/us/en/adventures/tahoe-skiing.html",
      "https://wknd.site/us/en/adventures/west-coast-cycling.html",
      "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
    ],
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          "div.carousel.cmp-carousel--mini"
        ]
      },
      {
        "name": "columns-facts",
        "instances": [
          "div.cmp-contentfragment--elements"
        ]
      },
      {
        "name": "social-links",
        "instances": [
          "main.cmp-layout-container--fixed div.cmp-buildingblock--btn-list"
        ]
      },
      {
        "name": "tabs-detail",
        "instances": [
          "main.cmp-layout-container--fixed div.cmp-tabs"
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
