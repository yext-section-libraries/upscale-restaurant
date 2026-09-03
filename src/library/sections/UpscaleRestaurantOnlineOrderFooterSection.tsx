import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { Link, type ImageType } from "@yext/pages-components";
import {
  Image,
  MaybeRTF,
  VisibilityWrapper,
  getDefaultRTF,
  getThemeColorCssValue,
  type EnhancedTranslatableCTA,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextCTAField,
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
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledImageProps = {
  image: YextEntityField<ImageType>;
};

type LinkItemProps = {
  cta: YextCTAField;
};

type FooterLinkProps = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
};

type SocialLinkItemProps = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
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

const makeStringField = (value: string): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: value,
  constantValueEnabled: true,
});

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

const makeQuickLinkCta = (label: string, link: string): YextCTAField => {
  const constantValue: EnhancedTranslatableCTA = {
    label,
    link,
    normalizeLink: false,
    openInNewTab: false,
    ctaType: "textAndLink",
  };

  return {
    field: "",
    constantValue,
    constantValueEnabled: true,
    selectedType: "textAndLink",
  };
};

const makeRenderableCta = (
  cta: EnhancedTranslatableCTA,
  locale: string,
  streamDocument: Record<string, any>,
): { label: string; link: string; linkType: "URL" } => ({
  label: String(
    resolveComponentData(cta.label, locale, streamDocument) ?? "Link",
  ),
  link: String(resolveComponentData(cta.link, locale, streamDocument) ?? "#"),
  linkType: "URL",
});

const makeRtf = (text: string): StyledRtfProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(text),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

type RichTextStyleOverrides = NonNullable<
  React.ComponentProps<typeof MaybeRTF>["richTextStyleOverrides"]
>;

const getTextStyle = (
  styles: StyledTextValue,
): Partial<RichTextStyleOverrides> => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const resolveTextColor = (
  color: ThemeColor | undefined,
  isDarkBackground: boolean,
): string =>
  getThemeColorCssValue(color) ?? (isDarkBackground ? "#ffffff" : "#111827");

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
  brandName: makeText("[[name]]"),
  socialLinks: [
    {
      label: makeStringField("Facebook"),
      link: makeStringField("#"),
      icon: makeImage(
        "https://a.mktgcdn.com/p/7tT2mgF7Uz5xFTl-R7a6dQd9CvX7EzacDF6BlpTO71c/196x196.png",
        "Facebook",
      ),
    },
    {
      label: makeStringField("Instagram"),
      link: makeStringField("#"),
      icon: makeImage(
        "https://a.mktgcdn.com/p/yTPPH5E_uAQyzqBbeK3FqmsFtBJXzbz_zWKkkz3F3pg/196x196.png",
        "Instagram",
      ),
    },
    {
      label: makeStringField("Yelp"),
      link: makeStringField("#"),
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
      { cta: makeQuickLinkCta("Menu", "#") },
      { cta: makeQuickLinkCta("Order Online", "#") },
      { cta: makeQuickLinkCta("Reservations", "#") },
      { cta: makeQuickLinkCta("Group Events", "#") },
      { cta: makeQuickLinkCta("Catering", "#") },
      { cta: makeQuickLinkCta("Careers", "#") },
      { cta: makeQuickLinkCta("Gift Cards", "#") },
      { cta: makeQuickLinkCta("Contact", "#") },
    ],
    copyrightText: makeText("© 2026 [[name]]. All rights reserved."),
    legalLinks: [
      { label: makeStringField("Privacy"), link: makeStringField("#") },
      { label: makeStringField("Terms"), link: makeStringField("#") },
      {
        label: makeStringField("Accessibility"),
        link: makeStringField("#"),
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
      label: {
        label: "Label",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      link: {
        label: "Link",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
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
      label: makeStringField("Social"),
      link: makeStringField("#"),
      icon: makeImage("", ""),
    },
    getItemSummary: (item: SocialLinkProps) =>
      typeof item.label.constantValue === "string"
        ? item.label.constantValue
        : "Social",
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
        type: "array",
        arrayFields: {
          cta: {
            label: "Link",
            type: "ctaSelector",
          },
        },
        defaultItemProps: { cta: makeQuickLinkCta("Link", "#") },
        getItemSummary: (item: LinkItemProps) => {
          const label = item.cta.constantValue.label;
          return typeof label === "string" ? label : "Link";
        },
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
        type: "array",
        arrayFields: {
          label: {
            label: "Label",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
          link: {
            label: "Link",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
        },
        defaultItemProps: {
          label: makeStringField("Legal"),
          link: makeStringField("#"),
        },
        getItemSummary: (item: FooterLinkProps) =>
          typeof item.label.constantValue === "string"
            ? item.label.constantValue
            : "Legal",
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-page {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-page * { box-sizing: border-box; }
.fb-page p,
.fb-page li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-page h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-page h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-page h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-page h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-page h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-page h6 {
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
.fb-footer {
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
  font-size: 21px;
  margin-bottom: 28px;
}
.fb-footer-brand {
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
  margin-bottom: 10px;
  overflow-wrap: anywhere;
}
.fb-footer-link {
  transition: color 160ms ease;
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
  const isDarkBackground = isDarkColor(
    props.section.backgroundColor,
    streamDocument,
  );
  const descriptionRichTextStyleOverrides: RichTextStyleOverrides = {
    ...getTextStyle(props.footer.description.styles),
    color: resolveTextColor(
      props.footer.description.fontColor,
      isDarkBackground,
    ),
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
    ...getTextStyle(props.footer.linkStyles.styles),
    color: resolveTextColor(
      props.footer.linkStyles.fontColor,
      isDarkBackground,
    ),
  };
  const pageStyle: FooterStyle = {
    "--fb-footer-border": resolveTextColor(undefined, isDarkBackground),
  };
  const brandNameStyle: React.CSSProperties = {
    ...getTextStyle(props.brandName.styles),
    color: resolveTextColor(props.brandName.fontColor, isDarkBackground),
  };
  const quickLinksHeadingStyle: React.CSSProperties = {
    ...getTextStyle(props.footer.quickLinksHeading.styles),
    color: resolveTextColor(
      props.footer.quickLinksHeading.fontColor,
      isDarkBackground,
    ),
  };
  const copyrightTextStyle: React.CSSProperties = {
    ...getTextStyle(props.footer.copyrightText.styles),
    color: resolveTextColor(
      props.footer.copyrightText.fontColor,
      isDarkBackground,
    ),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-page"
        style={pageStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <footer className="fb-footer">
          <div className="fb-container fb-footer-grid">
            <section>
              <p className="fb-footer-brand" style={brandNameStyle}>
                {brandName}
              </p>
              {typeof description === "string" ? (
                <MaybeRTF
                  data={description}
                  richTextStyleOverrides={descriptionRichTextStyleOverrides}
                />
              ) : React.isValidElement(description) ? (
                description
              ) : null}
              <div className="fb-footer-socials">
                {props.socialLinks.map((link, index) => {
                  const socialLabel =
                    resolveComponentData(link.label, locale, streamDocument) ?? "";
                  const socialLink =
                    resolveComponentData(link.link, locale, streamDocument) ?? "#";
                  const socialIcon = resolveComponentData(
                    link.icon.image,
                    locale,
                    streamDocument,
                  );
                  const iconImage = socialIcon ?? link.icon.image.constantValue;

                  if (!hasImageSource(iconImage)) {
                    return null;
                  }

                  return (
                    <Link
                      key={`${socialLabel}-${index}`}
                      cta={{ link: String(socialLink), linkType: "URL" }}
                      eventName={`footerSocial${index}`}
                      aria-label={String(socialLabel)}
                    >
                      <Image image={iconImage} className="fb-social-icon" />
                    </Link>
                  );
                })}
              </div>
            </section>
            <section>
              <h3 style={quickLinksHeadingStyle}>{quickLinksHeading}</h3>
              <div className="fb-footer-links-grid">
                {props.footer.quickLinks.map((link, index) => {
                  const quickLinkCta =
                    resolveComponentData(link.cta, locale, streamDocument) ??
                    link.cta.constantValue;
                  const renderableQuickLinkCta = makeRenderableCta(
                    quickLinkCta,
                    locale,
                    streamDocument,
                  );

                  return (
                    <Link
                      key={`${renderableQuickLinkCta.label}-${index}`}
                      cta={renderableQuickLinkCta}
                      eventName={`footerQuickLink${index}`}
                    >
                      <span style={footerLinkTextStyle}>
                        {renderableQuickLinkCta.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
          <div className="fb-container fb-footer-bottom">
            <p style={copyrightTextStyle}>{copyrightText}</p>
            <div>
              {props.footer.legalLinks.map((link, index) => (
                <Link
                  key={`footer-legal-${index}`}
                  cta={{
                    link:
                      String(resolveComponentData(link.link, locale, streamDocument) ?? "#"),
                    linkType: "URL",
                  }}
                  eventName={`footerLegal${index}`}
                >
                  <span style={footerLinkTextStyle}>
                    {resolveComponentData(link.label, locale, streamDocument) ?? ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOnlineOrderFooterSection: YextComponentConfig<FooterSectionProps> =
  {
    label: "Footer Section",
    fields: footerFields,
    defaultProps,
    render: FooterSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderFooterSection",
  displayName: "Footer Section",
  description: "Footer Section",
  pageSetTypes: ["ENTITY"],
};
