import * as React from "react";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Window } from "happy-dom";
import {
  EntityField,
  VisualEditorProvider,
  VisualEditorRender,
  createYextFieldTransforms,
  i18nPageInstance,
} from "@yext/visual-editor";
import { EntityTooltipsProvider } from "@yext/visual-editor/section-library-support";
import { UpscaleRestaurantAboutSection as About } from "../src/library/sections/UpscaleRestaurantAboutSection";
import { UpscaleRestaurantBanner as Banner } from "../src/library/sections/UpscaleRestaurantBanner";
import { UpscaleRestaurantBreadcrumbsSection as Breadcrumbs } from "../src/library/sections/UpscaleRestaurantBreadcrumbsSection";
import { UpscaleRestaurantDeliveryPartnersSection as Delivery } from "../src/library/sections/UpscaleRestaurantDeliveryPartnersSection";
import { UpscaleRestaurantDetailsSection as Details } from "../src/library/sections/UpscaleRestaurantDetailsSection";
import { UpscaleRestaurantEventSection as Event } from "../src/library/sections/UpscaleRestaurantEventSection";
import { UpscaleRestaurantFaqSection as Faq } from "../src/library/sections/UpscaleRestaurantFaqSection";
import { UpscaleRestaurantFeaturedItemsSection as Featured } from "../src/library/sections/UpscaleRestaurantFeaturedItemsSection";
import { UpscaleRestaurantFindUsSection as FindUs } from "../src/library/sections/UpscaleRestaurantFindUsSection";
import { UpscaleRestaurantFooterSection as Footer } from "../src/library/sections/UpscaleRestaurantFooterSection";
import { UpscaleRestaurantHeaderSection as Header } from "../src/library/sections/UpscaleRestaurantHeaderSection";
import { UpscaleRestaurantHeroSection as Hero } from "../src/library/sections/UpscaleRestaurantHeroSection";
import { UpscaleRestaurantOfferingsSection as Offerings } from "../src/library/sections/UpscaleRestaurantOfferingsSection";
import { UpscaleRestaurantReviewsSection as Reviews } from "../src/library/sections/UpscaleRestaurantReviewsSection";
import { getSurfaceColorStyle, renderRichText, resolveSelectedColor } from "../src/library/shared/sectionHelpers";

const sections = { About, Banner, Breadcrumbs, Delivery, Details, Event, Faq, Featured, FindUs, Footer, Header, Hero, Offerings, Reviews };
const document = { name: "[[city]]", city: "Should not interpolate twice", locale: "fr", address: { line1: "1 rue de Paris", city: "Paris", region: "IDF", postalCode: "75001", countryCode: "FR" } };
const localized = (en: string, fr: string) => ({ defaultValue: en, fr, hasLocalizedValue: "true" });
const staticField = (constantValue: unknown) => ({ field: "", constantValueEnabled: true, constantValue });

// Render through the actual page-level integration, including Puck's recursive
// object/array traversal. Captured props let us verify authored bindings survive.
async function renderSection(section: any, props = structuredClone(section.defaultProps), locale = "fr", streamDocument: any = document, tooltips = false) {
  await i18nPageInstance.changeLanguage(locale);
  let received: any;
  const data = { root: { props: {} }, content: [{ type: "Section", props: { ...props, id: "test-section" } }] };
  const before = JSON.stringify(data);
  const fieldBindings: any[] = [];
  const entityField = EntityField as any;
  const originalRender = entityField.render;
  entityField.render = (fieldProps: any, ref: any) => {
    fieldBindings.push(fieldProps);
    return originalRender(fieldProps, ref);
  };
  let html: string;
  try {
    html = renderToStaticMarkup(
    <VisualEditorProvider templateProps={{ document: streamDocument }}>
      <EntityTooltipsProvider>
        <VisualEditorRender config={{ components: { Section: { ...section, render: (renderProps: any) => {
          received = renderProps;
          return section.render({ ...renderProps, puck: { ...renderProps.puck, isEditing: tooltips } });
        } } } }} data={data} />
      </EntityTooltipsProvider>
    </VisualEditorProvider>,
  );
  } finally {
    entityField.render = originalRender;
  }
  assert.equal(JSON.stringify(data), before, "render transforms must not mutate saved data");
  const window = new Window();
  window.document.body.innerHTML = html;
  return { dom: window.document, received, html, fieldBindings };
}

test("migrated standalone style/string fields opt in, while binding-dependent fields stay authored", () => {
  function inspect(fields: any, transformStrings = true) {
    for (const field of Object.values(fields) as any[]) {
      if (["styledText", "styledLink", "styledImage"].includes(field.type)) {
        assert.equal(field.transform, true, field.type);
      }
      if (field.type === "translatableString") {
        assert.equal(field.transform === true, transformStrings, "Header/Footer links must not create automatic tooltip entries");
      }
      if (field.type === "entityField") assert.notEqual(field.transform, true);
      if (!transformStrings && ["ctaSelector", "comprehensiveCTA"].includes(field.type)) {
        assert.notEqual(field.transform, true, "Header/Footer retain local source tooltips instead of component-wide tooltip lists");
      }
      if (field.objectFields) inspect(field.objectFields, transformStrings);
      if (field.arrayFields) inspect(field.arrayFields, transformStrings);
    }
  }
  for (const [name, section] of Object.entries(sections)) {
    inspect(section.fields, name !== "Header" && name !== "Footer");
  }
  assert.equal(Delivery.fields?.ctas.arrayFields.cta.transform, true);
  for (const field of [Hero.fields?.hero.objectFields.ctas.arrayFields.cta, Event.fields?.event.objectFields.cta, Details.fields?.details.objectFields.links.arrayFields.cta, Header.fields?.cta.objectFields.items.arrayFields.cta]) {
    assert.notEqual(field.transform, true, "CTA tooltips require source bindings");
  }
});

test("header and footer resolve locale/interpolation in nested arrays exactly once", async () => {
  for (const locale of ["en", "fr"]) {
    const props = structuredClone(Header.defaultProps!);
    props.navigation.links = [{ label: localized("Menu [[name]]", "Carte [[name]]"), link: localized("/en/menu", "/fr/carte"), linkType: "URL", normalizeLink: true, openInNewTab: true }];
    props.navigation.styles = { ...props.navigation.styles, fontSize: "19px", includeCaret: "none" };
    props.utilities.items[0].label = localized("Call [[name]]", "Appeler [[name]]");
    props.utilities.items[0].link = "+12125551234";
    props.utilities.items[0].linkType = "PHONE";
    props.utilities.items[0].normalizeLink = true;
    const { dom, received } = await renderSection(Header, props, locale);
    assert.deepEqual(received.navigation.links, props.navigation.links);
    assert.deepEqual(received.utilities.items[0].label, props.utilities.items[0].label);
    const link = dom.querySelector(`a[href="${locale === "fr" ? "/fr/carte" : "/en/menu"}"]`)!;
    assert.equal(link.textContent, `${locale === "fr" ? "Carte" : "Menu"} [[city]]`);
    assert.equal(link.getAttribute("target"), "_blank");
    assert.match(link.getAttribute("rel")!, /noopener/);
    assert.equal(link.style.fontSize, "19px");
    assert.equal(received.navigation.styles["--display-link-caret"], "none");
    assert.ok(dom.querySelector('a[href="tel:+12125551234"]'));

    const footerProps = structuredClone(Footer.defaultProps!);
    footerProps.footer.quickLinks[0].label = localized("Explore [[name]]", "Explorer [[name]]");
    footerProps.footer.quickLinks[0].link = localized("/en", "/fr");
    footerProps.socialLinks[0].label = localized("Social [[name]]", "Réseau [[name]]");
    const footer = await renderSection(Footer, footerProps, locale);
    assert.deepEqual(footer.received.footer.quickLinks[0].label, footerProps.footer.quickLinks[0].label);
    assert.deepEqual(footer.received.footer.quickLinks[0].link, footerProps.footer.quickLinks[0].link);
    assert.deepEqual(footer.received.socialLinks[0].label, footerProps.socialLinks[0].label);
    assert.equal(footer.dom.querySelector(`a[href="/${locale}"]`)?.textContent, `${locale === "fr" ? "Explorer" : "Explore"} [[city]]`);
    assert.ok(footer.dom.querySelector(`a[aria-label="${locale === "fr" ? "Réseau" : "Social"} [[city]]"]`));
  }
});

test("page transforms recurse through nested arrays without changing authored data", async () => {
  const fields = { groups: { type: "array", arrayFields: { items: { type: "array", arrayFields: { label: { type: "translatableString", transform: true } } } } } };
  const props = { groups: [{ items: [{ label: localized("Hello [[name]]", "Bonjour [[name]]") }] }] };
  const section = { fields, defaultProps: props, render: ({ groups }: any) => <p>{groups[0].items[0].label}</p> };
  const { received, dom } = await renderSection(section);
  assert.equal(received.groups[0].items[0].label, "Bonjour [[city]]");
  assert.equal(dom.querySelector("p")?.textContent, "Bonjour [[city]]");
});

test("default/custom typography, theme colors, responsive image styles and rich-text descendants survive", async () => {
  for (const { styles, fontFamily, fontSize } of [
    { styles: Footer.defaultProps!.brandName.styles, fontFamily: "", fontSize: "" },
    {
      styles: { ...Footer.defaultProps!.brandName.styles, fontFamily: "Georgia", fontSize: "28px" },
      fontFamily: "Georgia",
      fontSize: "28px",
    },
  ]) {
    const footerProps = structuredClone(Footer.defaultProps!);
    footerProps.brandName.styles = styles;
    const footer = await renderSection(Footer, footerProps);
    const brand = footer.dom.querySelector(".fb-footer-brand")!;
    assert.equal(brand.style.fontFamily, fontFamily);
    assert.equal(brand.style.fontSize, fontSize);
    assert.equal(footer.received.brandName.styles.fontFamily ?? "", fontFamily);
    assert.equal(footer.received.brandName.styles.fontSize ?? "", fontSize);
  }
  const props = structuredClone(About.defaultProps!);
  const defaults = await renderSection(About, props);
  assert.equal(defaults.dom.querySelector("h2")?.style.fontFamily, "");
  assert.equal(defaults.dom.querySelector(".fb-about-art img")?.style.borderRadius, "");
  props.about.heading.styles = { fontFamily: "Georgia", fontSize: "35px", fontWeight: "700", fontStyle: "italic", textTransform: "uppercase" };
  props.about.heading.fontColor = { selectedColor: "palette-primary", contrastingColor: "white" };
  props.about.content.styles = { ...props.about.heading.styles, fontSize: "21px" };
  props.about.content.text = staticField({ html: "<p>Paragraph</p><ul><li>List item</li></ul>" });
  props.about.image.styles.borderRadius = "23px";
  const { dom } = await renderSection(About, props);
  assert.equal(dom.querySelector("h2")?.style.fontFamily, "Georgia");
  assert.equal(dom.querySelector("h2")?.style.color, "var(--colors-palette-primary)");
  const richText = dom.querySelector(".rtf-theme[style]")!;
  assert.equal(richText.style.fontSize, "21px");
  assert.equal(richText.style.getPropertyValue("--fontSize-body-fontSize"), "21px");
  assert.equal(richText.style.getPropertyValue("--fontWeight-body-fontWeight"), "700");
  assert.ok(richText.querySelector("li"));
  const image = dom.querySelector(".fb-about-art img")!;
  assert.equal(image.style.borderRadius, "23px");
  assert.equal(image.style.objectFit, "cover");
  assert.equal(dom.querySelector(".fb-about-image")!.style.overflow, "hidden");
  assert.equal(dom.querySelector(".fb-about-image")!.style.aspectRatio, "1 / 1");

  for (const value of [{ html: "<p>Raw</p>" }, <div className="existing" style={{ lineHeight: 2 }}><p>Element</p></div>]) {
    const html = renderToStaticMarkup(<>{renderRichText(value, { fontSize: "27px", fontStyle: "italic", color: "red" }, "custom")}</>);
    assert.match(html, /--fontSize-body-fontSize:27px/);
    assert.match(html, /--fontStyle-body-fontStyle:italic/);
    assert.match(html, /color:red/);
    assert.match(html, /custom/);
  }
  for (const color of [undefined, { selectedColor: "default", contrastingColor: "white" }]) {
    props.about.content.fontColor = color;
    props.about.content.text = staticField({ html: '<p>Inherited <span style="color: #c00000">Authored</span></p>' });
    const rendered = await renderSection(About, props);
    assert.equal(rendered.dom.querySelector(".rtf-theme")?.style.color, "");
    const authored = rendered.dom.querySelector('.rtf-theme span[style]')!;
    assert.equal(authored.style.color, "#c00000");
    assert.equal(authored.style.getPropertyPriority("color"), "");
  }
  for (const value of [
    { html: '<p style="color: red">Authored</p>' },
    <div><div className="rtf-wrapper" dangerouslySetInnerHTML={{ __html: '<p style="color: red">Authored</p>' }} /></div>,
  ]) {
    const html = renderToStaticMarkup(<>{renderRichText(value)}</>);
    assert.match(html, /color: red/);
    assert.doesNotMatch(html, /!important/);
  }

});

test("Header and Hero image radii survive transforms without changing responsive sizing", async () => {
  const headerProps = structuredClone(Header.defaultProps!);
  headerProps.logoImage.styles = { borderRadius: "17px" };
  headerProps.utilities.items[0].iconImage.styles = { borderRadius: "9px" };
  headerProps.utilities.items[0].iconImage.image = staticField({ url: "https://example.com/icon.png", width: 24, height: 24, alternateText: "Utility" });
  const header = await renderSection(Header, headerProps);
  assert.equal(header.received.logoImage.styles.borderRadius, "17px");
  assert.ok(header.dom.querySelector('[style*="border-radius:17px"]'));
  assert.ok(header.dom.querySelector('[style*="border-radius:9px"]'));
  assert.ok(header.dom.querySelector('nav[aria-label]'));
  const heroProps = structuredClone(Hero.defaultProps!);
  heroProps.hero.image.styles.borderRadius = "31px";
  const hero = await renderSection(Hero, heroProps);
  assert.equal(hero.dom.querySelector('.fb-hero-image-frame')?.style.borderRadius, "31px");
  assert.equal(hero.dom.querySelector('.fb-hero-image img')?.style.objectFit, "cover");
});

test("transformed CTAs contain resolved content and preserve presentation and link behavior", async () => {
  const props = structuredClone(Delivery.defaultProps!);
  props.ctas = [{ cta: { data: { actionType: "link", openInNewTab: true, cta: staticField({ label: localized("Order [[name]]", "Commander [[name]]"), link: "+12125551234", linkType: "PHONE", normalizeLink: true, openInNewTab: true }) }, styles: { variant: "link", link: { fontSize: "24px", includeCaret: "none" } } } }];
  const { dom, received } = await renderSection(Delivery, props);
  assert.equal(received.ctas[0].cta.data.cta.label, "Commander [[city]]");
  assert.equal(received.ctas[0].cta.data.cta.field, undefined);
  const link = dom.querySelector('a[href="tel:+12125551234"]')!;
  assert.ok(link);
  assert.equal(link.textContent, "Commander [[city]]");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.style.fontSize, "24px");
  assert.equal(link.style.getPropertyValue("--display-link-caret"), "none");
});

test("constructed Featured Items CTAs resolve manual/mapped content once in either locale", async () => {
  for (const locale of ["en", "fr"]) {
    for (const mapped of [false, true]) {
      const props = structuredClone(Featured.defaultProps!);
      const label = localized("Order [[name]]", "Commander [[name]]");
      const item = props.featuredItems.data.constantValue[0];
      item.cta.label = staticField(label);
      item.cta.link = staticField("/order");
      props.featuredItems.data.constantValue = [item];
      const streamDocument = { ...document, menu: [{ title: label, url: "/order" }] };
      if (mapped) {
        props.featuredItems.data.field = "menu";
        props.featuredItems.data.constantValueEnabled = false;
        props.featuredItems.data.mappings.cta.label = { field: "title", constantValueEnabled: false, constantValue: "" };
        props.featuredItems.data.mappings.cta.link = { field: "url", constantValueEnabled: false, constantValue: "" };
      }
      props.featuredItems.styles.cta.styles = { ...props.featuredItems.styles.cta.styles, fontSize: "29px", letterSpacing: "2px", includeCaret: "none" };
      const { dom, received } = await renderSection(Featured, props, locale, streamDocument);
      assert.deepEqual(received.featuredItems.data, props.featuredItems.data);
      const link = dom.querySelector('.fb-feature-cta a')!;
      assert.equal(link.textContent, `${locale === "fr" ? "Commander" : "Order"} [[city]]`);
      assert.equal(link.style.fontSize, "29px");
      assert.equal(link.style.letterSpacing, "2px");
      assert.equal(link.style.getPropertyValue("--display-link-caret"), "none");
    }
  }
});

test("bindings, mapping tooltips, empty mapped/static banner behavior and image fallbacks remain", async () => {
  const props = structuredClone(Banner.defaultProps!);
  props.data.text = { field: "missing", constantValueEnabled: false, constantValue: "Do not show static fallback" };
  const mapped = await renderSection(Banner, props, "fr", document, true);
  assert.deepEqual(mapped.received.data.text, props.data.text);
  assert.match(mapped.dom.body.textContent!, /mapped banner field is empty/);
  props.data.text = staticField("");
  const emptyStatic = await renderSection(Banner, props, "fr", document, true);
  assert.doesNotMatch(emptyStatic.dom.body.textContent!, /mapped banner field is empty/);

  const footerProps = structuredClone(Footer.defaultProps!);
  footerProps.socialLinks[0].icon.image.field = "missing";
  footerProps.socialLinks[0].icon.image.constantValueEnabled = false;
  const footer = await renderSection(Footer, footerProps);
  assert.deepEqual(footer.received.socialLinks[0].icon.image, footerProps.socialLinks[0].icon.image);
  assert.ok(footer.dom.querySelector('.fb-social-icon'), "missing mapped image retains existing authored fallback");
  const hero = await renderSection(Hero);
  assert.deepEqual(hero.received.hero.ctas[0], Hero.defaultProps!.hero.ctas[0]);
  assert.ok(hero.received.hero.ctas[0].cta.data.cta.field !== undefined);
  assert.ok(hero.fieldBindings.some(binding =>
    binding.fieldId === Hero.defaultProps!.hero.heading.text.field &&
    binding.constantValueEnabled === Hero.defaultProps!.hero.heading.text.constantValueEnabled
  ));
  assert.ok(footer.fieldBindings.some(binding => binding.fieldId === "missing" && binding.constantValueEnabled === false));
  const faq = await renderSection(Faq);
  assert.deepEqual(faq.received.faqs.items, Faq.defaultProps!.faqs.items);
  assert.ok(faq.dom.querySelector("details summary"));
});

test("installed transforms return CSS properties and leave default theme values inherited", () => {
  const transforms = createYextFieldTransforms(document, "fr");
  const transform = (type: string, value: any) => transforms[type]({ field: { type, transform: true }, value } as any);
  assert.deepEqual(transform("styledText", { fontFamily: "default", fontSize: "default", fontWeight: "default" }), {});
  assert.deepEqual(transform("styledImage", { borderRadius: "default" }), {});
  assert.deepEqual(transform("styledImage", { borderRadius: "13px" }), { borderRadius: "13px" });
  assert.deepEqual(transform("styledLink", { includeCaret: "none", letterSpacing: "3px" }), { "--display-link-caret": "none", letterSpacing: "3px" });
});

test("serialized layouts stay unchanged during rendering", async () => {
  const sectionRoot = new URL("../src/library/sections/", import.meta.url);
  const sectionConfigs = Object.fromEntries(await Promise.all(
    readdirSync(sectionRoot).filter(name => name.startsWith("UpscaleRestaurant") && name.endsWith(".tsx")).map(async file => {
      const name = file.slice(0, -4);
      const module = await import(`../src/library/sections/${file}`);
      return [name, module[name]];
    }),
  ));
  const layoutRoot = new URL("../src/library/layouts/", import.meta.url);
  await i18nPageInstance.changeLanguage("en");
  for (const name of readdirSync(layoutRoot).filter(name => !name.startsWith("."))) {
    const bytes = readFileSync(new URL(`${name}/defaultLayout.json`, layoutRoot));
    const data = JSON.parse(bytes.toString());
    const before = JSON.stringify(data);
    // Exercise each saved custom section, including Header/Footer from the
    // Directory/Locator layouts, without invoking their excluded implementations.
    const visit = async (value: any): Promise<void> => {
      if (Array.isArray(value)) {
        for (const item of value) await visit(item);
      } else if (value && typeof value === "object") {
        if (sectionConfigs[value.type]) await renderSection(sectionConfigs[value.type], value.props, "en", document);
        for (const child of Object.values(value)) await visit(child);
      }
    };
    await visit(data);
    assert.equal(JSON.stringify(data), before, name);
  }
});


test("default foreground follows actual section and nested card backgrounds", async () => {
  for (const [background, foreground] of [["#111111", "#ffffff"], ["#ffffff", "#000000"]]) {
    const color = { selectedColor: background, contrastingColor: foreground === "#ffffff" ? "black" : "white" };
    assert.equal(getSurfaceColorStyle(color).color, foreground, "saved contrast metadata must not control foreground");
    assert.equal(resolveSelectedColor({ selectedColor: "default", contrastingColor: "white" }), undefined);
    for (const [section, selector] of [[About, ".fb-about-shell"], [Hero, ".fb-hero-shell"], [Hero, ".fb-hero-card"], [Details, ".fb-panel"], [Featured, ".fb-feature-overlay"], [Reviews, ".fb-review-card"], [FindUs, ".fb-panel"], [Banner, ".components"], [Header, "header"], [Footer, ".fb-footer-shell"]] as const) {
      const props = structuredClone(section.defaultProps!) as any;
      props.section.backgroundColor = color;
      props.section.cardBackgroundColor = color;
      if (section === FindUs) props.findUs.nearbyLocationCardStyles.cardBackgroundColor = color;
      const { dom } = await renderSection(section, props, "en", document, true);
      assert.equal(dom.querySelector(selector)?.style.color, foreground, selector);
    }
  }
  for (const background of ["#111111", "#ffffff"]) {
    const style = getSurfaceColorStyle(
      { selectedColor: "palette-primary", contrastingColor: "white" },
      { __: { theme: JSON.stringify({ "--colors-palette-primary": background }) } },
    );
    assert.equal(style.color, background === "#111111" ? "#ffffff" : "#000000");
  }
});

test("every Editor translation key exists in every supported locale", () => {
  const root = new URL("../src/library/", import.meta.url);
  const keys = new Set<string>();
  function visit(path: URL) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), path);
      if (entry.isDirectory()) visit(child);
      else if (entry.name.endsWith(".tsx")) {
        for (const match of readFileSync(child, "utf8").matchAll(/\b(?:msg|pt)\(\s*"([^"]+)"/g)) keys.add(match[1]);
      }
    }
  }
  visit(root);
  const locales = new URL("i18n/platform/", root);
  for (const locale of readdirSync(locales).filter(name => name.endsWith(".json"))) {
    const translations = JSON.parse(readFileSync(new URL(locale, locales), "utf8"));
    for (const key of keys) {
      const value = key.split(".").reduce((value, part) => value?.[part], translations);
      assert.equal(typeof value, "string", `${locale}: ${key}`);
    }
  }
});
