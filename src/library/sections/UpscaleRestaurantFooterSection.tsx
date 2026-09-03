import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { Link, type ImageType } from "@yext/pages-components";
import {
  EntityField,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  msg,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableCTA,
  type TranslatableString,
  type YextComponentConfig,
  type YextArrayField,
  type YextEntityField,
  type YextFields,
  Background,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor;
};

type StyledImageProps = {
  image: YextEntityField<ImageType>;
};

type LinkItemProps = TranslatableCTA;
type FooterLinkProps = TranslatableCTA;

type SocialLinkItemProps = {
  label: TranslatableString;
  link: TranslatableString;
};

type SocialLinkProps = SocialLinkItemProps & {
  icon: StyledImageProps;
};

type FooterSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  brandName: StyledTextProps;
  socialLinks: SocialLinkProps[];
  footer: {
    description: StyledRtfProps;
    quickLinksHeading: StyledTextProps;
    linkStyles: StyledTextStyleProps;
    quickLinks: LinkItemProps[];
    copyrightText: StyledTextProps;
    legalLinks: FooterLinkProps[];
  };
};

type FooterStyle = React.CSSProperties & Record<`--${string}`, string>;

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

const makeText = (text: string, field = ""): StyledTextProps => ({
  text: {
    field,
    constantValue: text,
    constantValueEnabled: field === "",
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeTextStyle = (): StyledTextStyleProps => ({
  styles: defaultTextStyles,
  fontColor: undefined,
});

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
};

const linkTypeOptions = () => [
  { label: "URL", value: "URL" },
  { label: "Email", value: "Email" },
  { label: "Phone", value: "Phone" },
  { label: "Driving Directions", value: "DRIVING_DIRECTIONS" },
  { label: "Click To Website", value: "CLICK_TO_WEBSITE" },
  { label: "Other", value: "OTHER" },
];

const createTranslatableString = (value: string): TranslatableString => ({
  defaultValue: value,
  hasLocalizedValue: "true",
});

const resolveTranslatableStringValue = (
  value: TranslatableString | undefined,
  locale: string,
  streamDocument: Record<string, any>,
  fallback = "",
) =>
  value
    ? String(resolveComponentData(value, locale, streamDocument) ?? fallback)
    : fallback;

const defaultLink: LinkItemProps = {
  label: createTranslatableString("Link"),
  link: createTranslatableString("#"),
  linkType: "URL",
  normalizeLink: true,
  openInNewTab: false,
};

const linkFieldConfig: YextArrayField<TranslatableCTA[]> = {
  type: "array",
  arrayFields: {
    label: {
      type: "translatableString",
      label: msg("fields.label", "Label"),
      filter: { types: ["type.string"] },
    },
    link: {
      type: "translatableString",
      label: msg("fields.link", "Link"),
    },
    linkType: {
      type: "basicSelector",
      label: msg("fields.linkType", "Link Type"),
      options: linkTypeOptions(),
    },
    normalizeLink: {
      label: msg("fields.normalizeLink", "Normalize Link"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    },
    openInNewTab: {
      label: msg("fields.openInNewTab", "Open in new tab"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    },
  },
  defaultItemProps: defaultLink satisfies TranslatableCTA,
  getItemSummary: (item) =>
    typeof item.label === "string" ? item.label : "Link",
};

const makeRtf = (text: string): StyledRtfProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(text),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontColor: undefined,
});

const getCssTextStyle = (styles: StyledTextValue): React.CSSProperties => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const resolveTextColor = (color: ThemeColor | undefined): string =>
  getThemeColorCssValue(color) ?? "currentColor";

const makeImage = (url: string, alternateText: string): StyledImageProps => ({
  image: {
    field: "",
    constantValue: {
      url,
      width: 196,
      height: 196,
      alternateText,
    },
    constantValueEnabled: true,
  },
});

const defaultProps: FooterSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor(
      "palette-primary",
      "palette-primary-contrast",
    ),
  },
  brandName: makeText("[[name]]", "name"),
  socialLinks: [
    {
      label: "Facebook",
      link: "#",
      icon: makeImage(
        "https://a.mktgcdn.com/p/7tT2mgF7Uz5xFTl-R7a6dQd9CvX7EzacDF6BlpTO71c/196x196.png",
        "Facebook",
      ),
    },
    {
      label: "Instagram",
      link: "#",
      icon: makeImage(
        "https://a.mktgcdn.com/p/yTPPH5E_uAQyzqBbeK3FqmsFtBJXzbz_zWKkkz3F3pg/196x196.png",
        "Instagram",
      ),
    },
    {
      label: "Yelp",
      link: "#",
      icon: makeImage(
        "https://a.mktgcdn.com/p/5somDf8PPy-sFAiMAtBBvW0k_MfdIluteCfmjQ42sgc/196x245.png",
        "Yelp",
      ),
    },
  ],
  footer: {
    description: makeRtf(
      "Neighborhood burgers, cocktails, and brunch in [[address.city]].",
    ),
    quickLinksHeading: makeText("Quick links"),
    linkStyles: makeTextStyle(),
    quickLinks: [
      { ...defaultLink, label: createTranslatableString("Menu") },
      { ...defaultLink, label: createTranslatableString("Order Online") },
      { ...defaultLink, label: createTranslatableString("Reservations") },
      { ...defaultLink, label: createTranslatableString("Group Events") },
      { ...defaultLink, label: createTranslatableString("Catering") },
      { ...defaultLink, label: createTranslatableString("Careers") },
      { ...defaultLink, label: createTranslatableString("Gift Cards") },
      { ...defaultLink, label: createTranslatableString("Contact") },
    ],
    copyrightText: makeText("(c) 2026 [[name]] All rights reserved."),
    legalLinks: [
      {
        ...defaultLink,
        label: createTranslatableString("Privacy"),
      },
      {
        ...defaultLink,
        label: createTranslatableString("Terms"),
      },
      {
        ...defaultLink,
        label: createTranslatableString("Accessibility"),
      },
    ],
  },
};

const footerFields: YextFields<FooterSectionProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  brandName: {
    label: "Brand Name",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: { label: "Label", type: "translatableString" },
      link: { label: "Link", type: "translatableString" },
      icon: {
        label: "Icon",
        type: "object",
        objectFields: {
          image: {
            type: "entityField",
            label: "Image",
            filter: {
              types: ["type.image"],
            },
          },
        },
      },
    },
    defaultItemProps: {
      label: createTranslatableString("Social"),
      link: createTranslatableString("#"),
      icon: makeImage("", ""),
    },
    getItemSummary: (item: SocialLinkProps) =>
      typeof item.label === "string" ? item.label : item.label.defaultValue,
  },
  footer: {
    label: "Footer",
    type: "object",
    objectFields: {
      description: {
        label: "Description",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.rich_text_v2"],
            },
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      quickLinksHeading: {
        label: "Quick Links Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
            },
          },
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      linkStyles: {
        label: "Link Styles",
        type: "object",
        objectFields: {
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      quickLinks: {
        label: "Quick Links",
        ...linkFieldConfig,
      },
      copyrightText: {
        label: "Copyright Text",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
            },
          },
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      legalLinks: {
        label: "Legal Links",
        ...linkFieldConfig,
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-footer-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-footer-shell * { box-sizing: border-box; }
.fb-footer-shell p,
.fb-footer-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-footer-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-footer-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-footer-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-footer-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-footer-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-footer-shell h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.fb-footer-links-grid a,
.fb-footer-bottom a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.fb-footer-shell h2,
.fb-footer-shell h3,
.fb-footer-shell p {
  margin: 0;
}
.fb-footer {
  background: var(--fb-footer-bg);
  color: var(--fb-footer-text);
  padding: 64px 0 22px;
  overflow-x: clip;
}
.fb-container {
  width: min(1540px, calc(100% - 32px));
  margin: 0 auto;
}
.fb-footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 1.2fr;
  gap: 40px;
}
.fb-footer p {
  color: inherit;
  margin: 0 0 14px;
}
.fb-footer h3 {
  color: inherit;
  margin-bottom: 28px;
}
.fb-footer-brand {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.07em;
  line-height: 1;
  margin-bottom: 14px;
}
.fb-footer-socials {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.fb-footer-socials a {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.fb-footer-socials img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.fb-footer-links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}
.fb-footer-links-grid > * {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.fb-footer-links-grid a,
.fb-footer-bottom a {
  font-size: 13px;
  margin-bottom: 10px;
  overflow-wrap: anywhere;
}
.fb-footer-link {
  color: var(--fb-footer-link-color);
  transition: color 160ms ease;
}
.fb-footer-link:hover {
  color: var(--fb-footer-link-hover);
}
.fb-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 34px;
  padding-top: 14px;
  border-top: 1px solid var(--fb-footer-border);
}
.fb-footer-bottom div {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  min-width: 0;
}
@media (max-width: 1100px) {
  .fb-footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .fb-footer-grid section:last-child {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1101px) {
  .fb-footer-grid section:last-child {
    grid-column: 2 / span 2;
  }
  .fb-footer-links-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-footer {
    padding-top: 52px;
  }
  .fb-footer-grid {
    grid-template-columns: 1fr;
  }
  .fb-footer-bottom {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

const FooterSection: PuckComponent<FooterSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const descriptionRichTextStyleOverrides = {
    color: resolveTextColor(props.footer.description.fontColor),
  };
  const brandName = resolveComponentData(
    props.brandName.text,
    locale,
    streamDocument,
  );
  const description = resolveComponentData(
    props.footer.description.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: descriptionRichTextStyleOverrides,
    },
  );
  const quickLinksHeading = resolveComponentData(
    props.footer.quickLinksHeading.text,
    locale,
    streamDocument,
  ) as string;
  const copyrightText = resolveComponentData(
    props.footer.copyrightText.text,
    locale,
    streamDocument,
  );
  const footerLinkTextStyle: React.CSSProperties = {
    ...getCssTextStyle(props.footer.linkStyles.styles),
  };
  const pageStyle: FooterStyle = {
    ...sectionSurfaceStyle,
    "--fb-footer-text": "currentColor",
    "--fb-footer-border": "currentColor",
    "--fb-footer-link-color": resolveTextColor(
      props.footer.linkStyles.fontColor,
    ),
    "--fb-footer-link-hover": "currentColor",
  };
  const brandNameStyle: React.CSSProperties = {
    ...getCssTextStyle(props.brandName.styles),
    color: resolveTextColor(props.brandName.fontColor),
  };
  const quickLinksHeadingStyle: React.CSSProperties = {
    ...getCssTextStyle(props.footer.quickLinksHeading.styles),
    color: resolveTextColor(props.footer.quickLinksHeading.fontColor),
  };
  const copyrightTextStyle: React.CSSProperties = {
    ...getCssTextStyle(props.footer.copyrightText.styles),
    color: resolveTextColor(props.footer.copyrightText.fontColor),
  };
  const renderLink = (
    link: FooterLinkProps,
    index: number,
    eventName: string,
  ) => {
    const label = resolveTranslatableStringValue(
      link.label,
      locale,
      streamDocument,
      "Link",
    );
    const resolvedLink = resolveTranslatableStringValue(
      link.link,
      locale,
      streamDocument,
      "#",
    );

    return (
      <Link
        key={`${label}-${index}`}
        cta={{
          link: resolvedLink,
          linkType: link.linkType,
        }}
        target={link.openInNewTab ? "_blank" : undefined}
        rel={link.openInNewTab ? "noopener noreferrer" : undefined}
        eventName={eventName}
        className="fb-footer-link"
      >
        <span style={footerLinkTextStyle}>{label}</span>
      </Link>
    );
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-footer-shell"
        style={pageStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <footer className="fb-footer">
          <div className="fb-container fb-footer-grid">
            <section>
              <EntityField
                displayName="Brand Name"
                fieldId={props.brandName.text.field}
                constantValueEnabled={props.brandName.text.constantValueEnabled}
              >
                <p className="fb-footer-brand" style={brandNameStyle}>
                  {brandName}
                </p>
              </EntityField>
              <EntityField
                displayName="Description"
                fieldId={props.footer.description.text.field}
                constantValueEnabled={
                  props.footer.description.text.constantValueEnabled
                }
              >
                {typeof description === "string" ? (
                  <MaybeRTF
                    data={description}
                    richTextStyleOverrides={descriptionRichTextStyleOverrides}
                  />
                ) : React.isValidElement(description) ? (
                  description
                ) : null}
              </EntityField>
              <div className="fb-footer-socials">
                {props.socialLinks.map((link, index) => {
                  const socialIcon = resolveComponentData(
                    link.icon.image,
                    locale,
                    streamDocument,
                  );
                  const iconImage = socialIcon ?? link.icon.image.constantValue;
                  const label = resolveTranslatableStringValue(
                    link.label,
                    locale,
                    streamDocument,
                    "Social",
                  );
                  const resolvedLink = resolveTranslatableStringValue(
                    link.link,
                    locale,
                    streamDocument,
                    "#",
                  );

                  if (!hasImageSource(iconImage)) {
                    return null;
                  }

                  return (
                    <Link
                      key={`${label}-${index}`}
                      cta={{ link: resolvedLink, linkType: "URL" }}
                      eventName={`footerSocial${index}`}
                      aria-label={label}
                    >
                      <EntityField
                        displayName={`Social Icon ${index + 1}`}
                        fieldId={link.icon.image.field}
                        constantValueEnabled={
                          link.icon.image.constantValueEnabled
                        }
                      >
                        <Image image={iconImage} className="fb-social-icon" />
                      </EntityField>
                    </Link>
                  );
                })}
              </div>
            </section>
            <section>
              <EntityField
                displayName="Quick Links Heading"
                fieldId={props.footer.quickLinksHeading.text.field}
                constantValueEnabled={
                  props.footer.quickLinksHeading.text.constantValueEnabled
                }
              >
                <h3 style={quickLinksHeadingStyle}>{quickLinksHeading}</h3>
              </EntityField>
              <div className="fb-footer-links-grid">
                {props.footer.quickLinks.map((link, index) =>
                  renderLink(link, index, `footerQuickLink${index}`),
                )}
              </div>
            </section>
          </div>
          <div className="fb-container fb-footer-bottom">
            <EntityField
              displayName="Copyright Text"
              fieldId={props.footer.copyrightText.text.field}
              constantValueEnabled={
                props.footer.copyrightText.text.constantValueEnabled
              }
            >
              <p style={copyrightTextStyle}>{copyrightText}</p>
            </EntityField>
            <div>
              {props.footer.legalLinks.map((link, index) =>
                renderLink(link, index, `footerLegal${index}`),
              )}
            </div>
          </div>
        </footer>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantFooterSection: YextComponentConfig<FooterSectionProps> =
  {
    label: "Footer Section",
    fields: footerFields,
    defaultProps,
    render: FooterSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFooterSection",
  displayName: "Footer Section",
  description: "Footer Section",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
