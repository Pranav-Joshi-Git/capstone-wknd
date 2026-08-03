/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND (wknd.site /us/en) site-wide cleanup.
 *
 * Source is an AEM Core Components site (WKND demo). This transformer strips the
 * non-authorable site shell so the import contains only page-level authorable content.
 * The EDS header/footer are authored separately as nav/footer blocks, and EDS
 * regenerates breadcrumbs, so all of that global chrome is removed here.
 *
 * ALL selectors below are validated against migration-work/cleaned.html
 * (representative page: /us/en/faqs.html). Selectors present on other templates
 * (breadcrumb, third-party share widgets) are documented inline and applied
 * site-wide per the migration brief; DOMUtils.remove is a safe no-op when absent.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove third-party / tracking iframes and overlays before block parsing so
    // they can't interfere with block matching.
    // cleaned.html:452 -> <iframe id="destination_publishing_iframe_wkndsite_0" ...demdex.net>
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      // Empty third-party share widget placeholders (no authorable content).
      // Documented in the brief; present on article/adventure-detail templates.
      '.fb-share-button',
      '.fb-like',
      '[class*="pinterest"]',
      '[class*="pin-it"]',
      '[data-pin-do]',
      '.addthis_toolbox',
      '[class*="addthis"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // 1) Remove non-authorable global chrome (header, footer, nav, search, utility bar).
    WebImporter.DOMUtils.remove(element, [
      // Header experience fragment -> becomes EDS header block, authored separately.
      // cleaned.html:5 -> <header class="experiencefragment cmp-experiencefragment--header ...">
      'header.cmp-experiencefragment--header',
      // Footer experience fragment -> becomes EDS footer block, authored separately.
      // cleaned.html:357 -> <footer class="experiencefragment cmp-experiencefragment--footer ...">
      'footer.cmp-experiencefragment--footer',
      // Breadcrumb navigation -> EDS regenerates breadcrumbs.
      // Documented in brief; present on adventure-detail / magazine-article templates.
      'nav.cmp-breadcrumb',
      '.breadcrumb.cmp-breadcrumb',
      // Language navigation / sign-in utility bar.
      // cleaned.html:14 -> <div class="sign-in-buttons ...">
      // cleaned.html:15 -> <div class="wknd-sign-in-buttons">
      // cleaned.html:21 -> <div class="languagenavigation cmp-languagenavigation--header ...">
      '.sign-in-buttons',
      '.wknd-sign-in-buttons',
      '.languagenavigation',
      // Header search widget. cleaned.html:135 -> <section class="cmp-search">
      '.cmp-search--header',
      'section.cmp-search',
      // Mobile navigation chrome. cleaned.html:454 -> <div id="toggleNav">, cleaned.html:460 -> <div id="mobileNav">
      '#toggleNav',
      '#mobileNav',
      '.cmp-navigation--mobile',
      // Standalone site navigation (defensive; header nav removed with the header XF above).
      'nav.cmp-navigation',
      // Leftover embeds / non-authorable elements.
      'iframe',
      'noscript',
    ]);

    // 2) Strip AEM grid/layout wrapper divs that add no semantic content,
    //    unwrapping their children so authorable content is preserved.
    //    cleaned.html: div.root.responsivegrid (2), div.cmp-container (3),
    //    div.aem-Grid (4), div.container.responsivegrid (9).
    //    Repeat a few passes because these wrappers are deeply nested.
    //
    //    NOTE: div.aem-GridColumn is intentionally NOT unwrapped. In AEM Core
    //    Components `aem-GridColumn` is not a standalone wrapper -- it is a
    //    positioning class applied to each component's own root div. The
    //    block-identifying divs the parsers match (e.g. div.carousel.cmp-carousel--hero,
    //    div.teaser.cmp-teaser--featured, div.image-list.list per page-templates.json)
    //    carry this class themselves, so unwrapping aem-GridColumn would flatten
    //    authorable block structure. Unwrapping the pure containers below already
    //    removes the meaningless grid scaffolding.
    const wrapperSelectors = [
      'div.aem-Grid',
      'div.cmp-container',
      'div.root.responsivegrid',
      'div.container.responsivegrid',
    ];
    for (let pass = 0; pass < 6; pass += 1) {
      const wrappers = element.querySelectorAll(wrapperSelectors.join(','));
      if (wrappers.length === 0) break;
      wrappers.forEach((wrapper) => {
        // Unwrap: move all children up into the parent, then remove the wrapper.
        while (wrapper.firstChild) {
          wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
        }
        wrapper.remove();
      });
    }
  }
}
