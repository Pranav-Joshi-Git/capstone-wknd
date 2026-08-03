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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

  // tools/importer/parsers/author.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-byline__image img, .cmp-image img, .image img, img");
    let name;
    let role;
    const bylineName = element.querySelector(".cmp-byline__name");
    const bylineRole = element.querySelector(".cmp-byline__occupations, .cmp-byline__title");
    if (bylineName) {
      name = (bylineName.textContent || "").trim();
      role = bylineRole ? (bylineRole.textContent || "").trim() : void 0;
    } else {
      const titleEls = [...element.querySelectorAll(".cmp-title__text, h1, h2, h3, h4, h5, h6")];
      const seen = /* @__PURE__ */ new Set();
      const texts = [];
      titleEls.forEach((el) => {
        const t = (el.textContent || "").trim();
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
    const socialAnchors = [...element.querySelectorAll(".cmp-buildingblock--btn-list a[href], .cmp-byline__social a[href]")];
    const cells = [];
    if (image) cells.push([image]);
    if (name) {
      const nameEl = document.createElement("p");
      nameEl.textContent = name;
      cells.push([nameEl]);
    }
    if (role) {
      const roleEl = document.createElement("p");
      roleEl.textContent = role;
      cells.push([roleEl]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "author", cells });
    let socialBlock;
    if (socialAnchors.length) {
      const socialCells = socialAnchors.map((a) => {
        const href = a.getAttribute("href") || "#";
        const label = a.querySelector(".cmp-button__text") && a.querySelector(".cmp-button__text").textContent.trim() || (a.textContent || "").trim() || a.getAttribute("aria-label") || href;
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        return [link];
      });
      socialBlock = WebImporter.Blocks.createBlock(document, { name: "social-links", cells: socialCells });
    }
    if (socialBlock) {
      element.replaceWith(block, socialBlock);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/social-links.js
  function parse2(element, { document }) {
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

  // tools/importer/import-magazine-article.js
  var parsers = {
    "author": parse,
    "social-links": parse2
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    "name": "magazine-article",
    "description": "Magazine article page: hero image, breadcrumb, title with author byline, long-form article body (headings, paragraphs, blockquote, inline images), author/contributor block (name, title, social links), and a related-articles list.",
    "urls": [
      "https://wknd.site/us/en/magazine/western-australia.html",
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html",
      "https://wknd.site/us/en/magazine/ski-touring.html"
    ],
    "blocks": [
      {
        "name": "author",
        "instances": [
          "div.byline",
          "div.cmp-byline"
        ]
      },
      {
        "name": "social-links",
        "instances": [
          "article.cmp-article div.cmp-buildingblock--btn-list"
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
  var import_magazine_article_default = {
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
  return __toCommonJS(import_magazine_article_exports);
})();
