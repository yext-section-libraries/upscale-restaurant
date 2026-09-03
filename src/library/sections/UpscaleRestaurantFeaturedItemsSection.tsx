import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType, LinkType } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  createItemSource,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledImageValue,
  type StyledLinkValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
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

type StyledLinkStyleProps = {
  styles: StyledLinkValue;
  fontColor?: ThemeColor;
  variant: "primary" | "secondary" | "link";
  color?: ThemeColor;
};

type FeaturedItemCtaProps = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
  linkType: LinkType;
  normalizeLink: boolean;
  openInNewTab: boolean;
};

type FeaturedItemProps = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<ImageType>;
  cta: FeaturedItemCtaProps;
};

type FeaturedItemsSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  featuredItems: {
    data: typeof featuredItemsSource.value;
    styles: {
      title: StyledTextStyleProps;
      description: StyledTextStyleProps;
      image: {
        styles: StyledImageValue;
      };
      cta: StyledLinkStyleProps;
    };
  };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultImageStyles: StyledImageValue = {
  borderRadius: "8px",
};

const defaultLinkStyles: StyledLinkValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  letterSpacing: "default",
  includeCaret: "default",
};

const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

const makeText = (text: string): StyledTextProps => ({
  text: {
    field: "",
    constantValue: text,
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeRtf = (text: string): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(text),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const makeImage = (
  url: string,
  width: number,
  height: number,
  alternateText: string,
): YextEntityField<ImageType> => ({
  field: "",
  constantValue: {
    url,
    width,
    height,
    alternateText,
  },
  constantValueEnabled: true,
});

const makeCta = (label: string, link: string): FeaturedItemCtaProps => ({
  label: {
    field: "",
    constantValue: label,
    constantValueEnabled: true,
  },
  link: {
    field: "",
    constantValue: link,
    constantValueEnabled: true,
  },
  linkType: "URL",
  normalizeLink: false,
  openInNewTab: false,
});

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
};

const makeTextStyle = (
  styles?: Partial<StyledTextValue>,
): React.CSSProperties => {
  const resolvedStyles = { ...defaultTextStyles, ...styles };

  return {
    fontFamily:
      resolvedStyles.fontFamily === "default"
        ? undefined
        : resolvedStyles.fontFamily,
    fontSize:
      resolvedStyles.fontSize === "default"
        ? undefined
        : resolvedStyles.fontSize,
    fontWeight:
      resolvedStyles.fontWeight === "default"
        ? undefined
        : resolvedStyles.fontWeight,
    fontStyle:
      resolvedStyles.fontStyle === "default"
        ? undefined
        : resolvedStyles.fontStyle,
    textTransform:
      resolvedStyles.textTransform === "default"
        ? undefined
        : resolvedStyles.textTransform,
  };
};

const makeImageStyle = (
  styles?: Partial<StyledImageValue>,
): React.CSSProperties => {
  const resolvedStyles = { ...defaultImageStyles, ...styles };

  return {
    borderRadius:
      resolvedStyles.borderRadius === "default"
        ? "8px"
        : resolvedStyles.borderRadius,
    overflow: "hidden",
  };
};

const resolveSelectedColor = (color?: ThemeColor): string | undefined => {
  if (!color?.selectedColor || color.selectedColor === "default") {
    return undefined;
  }

  return getThemeColorCssValue(color);
};

const featuredItemsSource = createItemSource<FeaturedItemProps>({
  label: "Featured Items",
  mappingFields: {
    title: {
      label: "Title",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    description: {
      label: "Description",
      type: "entityField",
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      label: "Image",
      type: "entityField",
      filter: { types: ["type.image"] },
    },
    cta: {
      label: "CTA",
      type: "object",
      objectFields: {
        label: {
          label: "Label",
          type: "entityField",
          filter: { types: ["type.string"] },
        },
        link: {
          label: "Link",
          type: "entityField",
          filter: { types: ["type.string"] },
        },
        linkType: {
          label: "Link Type",
          type: "select",
          options: [
            { label: "URL", value: "URL" },
            { label: "Phone", value: "PHONE" },
            { label: "Email", value: "EMAIL" },
          ],
        },
        normalizeLink: {
          label: "Normalize Link",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        openInNewTab: {
          label: "Open in New Tab",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: "Smokehouse Burger",
        constantValueEnabled: true,
      },
      description: makeRtf(
        "A wood-fired double smash burger topped with smoked cheddar, crispy onions, bourbon bacon jam, arugula, and house sauce on a toasted brioche bun. Served with hand-cut fries.",
      ),
      image: makeImage(
        "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      cta: makeCta("Learn More", "#"),
    },
    {
      title: {
        field: "",
        constantValue: "Chicken Sandwich",
        constantValueEnabled: true,
      },
      description: makeRtf(
        "Crispy buttermilk fried chicken layered with hot honey glaze, dill pickles, shredded lettuce, and chipotle aioli on a buttered potato bun. A local favorite during happy hour and weekend brunch.",
      ),
      image: makeImage(
        "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      cta: makeCta("View Menu", "#"),
    },
    {
      title: {
        field: "",
        constantValue: "Craft Cocktails",
        constantValueEnabled: true,
      },
      description: makeRtf(
        "Signature cocktails built with seasonal ingredients, small-batch spirits, and house syrups. Perfect for late-night bites, date nights, and celebratory dinners in downtown [[address.city]].",
      ),
      image: makeImage(
        "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      cta: makeCta("Reserve a Table", "#"),
    },
  ],
});

const defaultProps: FeaturedItemsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "palette-quaternary"),
    cardBackgroundColor: makeThemeColor("white", "black"),
  },
  heading: makeText("Featured Items"),
  featuredItems: {
    data: featuredItemsSource.defaultValue,
    styles: {
      title: {
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      description: {
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      image: {
        styles: defaultImageStyles,
      },
      cta: {
        styles: defaultLinkStyles,
        fontColor: undefined,
        variant: "link",
        color: undefined,
      },
    },
  },
};

const featuredItemsFields: YextFields<FeaturedItemsSectionProps> = {
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
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        label: "Text",
        type: "entityField",
        filter: { types: ["type.string"] },
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
  featuredItems: {
    label: "Featured Items",
    type: "object",
    objectFields: {
      data: featuredItemsSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          title: {
            label: "Title",
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
          description: {
            label: "Description",
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
          image: {
            label: "Image",
            type: "object",
            objectFields: {
              styles: {
                label: "Image Styles",
                type: "styledImage",
              },
            },
          },
          cta: {
            label: "CTA",
            type: "object",
            objectFields: {
              styles: {
                label: "Link Styles",
                type: "styledLink",
                showIncludeCaretField: false,
              },
              fontColor: {
                label: "Font Color",
                type: "basicSelector",
                options: "SITE_COLOR",
              },
              variant: {
                label: "Variant",
                type: "select",
                options: [
                  { label: "Primary", value: "primary" },
                  { label: "Secondary", value: "secondary" },
                  { label: "Link", value: "link" },
                ],
              },
              color: {
                label: "Color",
                type: "basicSelector",
                options: "BACKGROUND_COLOR",
              },
            },
          },
        },
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-featured-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-featured-shell * { box-sizing: border-box; }
.fb-featured-shell p,
.fb-featured-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-featured-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-featured-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-featured-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-featured-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-featured-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-featured-shell h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-container {
  width: min(1540px, calc(100% - 48px));
  margin: 0 auto;
}
.fb-featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.fb-feature-card {
  position: relative;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
}
.fb-feature-image-frame {
  width: 100%;
  height: 210px;
  overflow: hidden;
}
.fb-feature-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fb-feature-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  align-self: center;
  margin-top: -75px;
  left: -1px;
  padding: 14px 14px 12px;
  border-top-right-radius: 64px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.fb-feature-overlay h3 {
  font-size: 18px;
  line-height: 1.25;
}
.fb-feature-overlay h3,
.fb-feature-description {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.fb-feature-description {
  margin: 0;
}
@media (min-width: 761px) {
  .fb-featured-grid {
    grid-auto-rows: 1fr;
  }
  .fb-feature-card {
    height: 100%;
  }
  .fb-feature-overlay {
    flex: 1;
  }
  .fb-feature-cta {
    margin-top: auto;
  }
}
@media (max-width: 1100px) {
  .fb-featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-featured-grid {
    grid-template-columns: 1fr;
  }
  .fb-feature-card {
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
  }
  .fb-feature-image-frame {
    height: 230px;
  }
  .fb-feature-overlay {
    position: relative;
    z-index: 1;
    width: 94%;
    max-width: 100%;
    margin-top: -75px;
    align-self: center;
    padding: 18px 16px 16px;
    box-sizing: border-box;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .fb-feature-overlay h3,
  .fb-feature-overlay .fb-feature-description {
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}
.fb-feature-card-no-image .fb-feature-overlay {
  margin-top: 0;
  width: 100%;
  border-top-right-radius: 8px;
}
`;

const FeaturedItemsSection: PuckComponent<FeaturedItemsSectionProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const heading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.heading.styles),
    margin: "0 0 28px",
    color: resolveSelectedColor(props.heading.fontColor),
  };
  const items = featuredItemsSource.resolveItems(
    props.featuredItems.data,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        background={props.section.backgroundColor}
        className="fb-featured-shell"
        style={sectionSurfaceStyle}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-featured-section">
          <div className="fb-container">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2 style={headingStyle}>{heading}</h2>
            </EntityField>
            <EntityField
              displayName="Featured Items"
              fieldId={props.featuredItems.data.field}
              constantValueEnabled={
                props.featuredItems.data.constantValueEnabled
              }
            >
              <div className="fb-featured-grid">
                {items.map((item, index) => {
                  const title = item.title
                    ? resolveComponentData(item.title, locale, streamDocument)
                    : "";
                  const titleStyle: React.CSSProperties = {
                    ...makeTextStyle(props.featuredItems.styles.title.styles),
                    color: resolveSelectedColor(
                      props.featuredItems.styles.title.fontColor,
                    ),
                  };
                  const descriptionStyles = {
                    ...props.featuredItems.styles.description.styles,
                    color: resolveSelectedColor(
                      props.featuredItems.styles.description.fontColor,
                    ),
                  };
                  const description = item.description
                    ? resolveComponentData(
                        item.description,
                        locale,
                        streamDocument,
                        {
                          richTextStyleOverrides: descriptionStyles,
                        },
                      )
                    : "";
                  const imageStyles = makeImageStyle(
                    props.featuredItems.styles.image.styles,
                  );
                  const resolvedImage = item.image
                    ? resolveComponentData(item.image, locale, streamDocument)
                    : "";
                  const ctaLabel = item.cta.label
                    ? resolveComponentData(
                        item.cta.label,
                        locale,
                        streamDocument,
                      )
                    : "";
                  const ctaLink = item.cta.link
                    ? resolveComponentData(
                        item.cta.link,
                        locale,
                        streamDocument,
                      )
                    : "";
                  const featureImage = hasImageSource(resolvedImage)
                    ? resolvedImage
                    : undefined;
                  const hasFeatureImage = Boolean(featureImage);
                  const hasCta = Boolean(ctaLabel) && Boolean(ctaLink);
                  const ctaValue: Partial<ComprehensiveCTAValue> | undefined =
                    hasCta
                      ? {
                          data: {
                            actionType: "link",
                            cta: {
                              field: "",
                              constantValue: {
                                label: String(ctaLabel),
                                link: String(ctaLink),
                                linkType: item.cta.linkType,
                                normalizeLink: item.cta.normalizeLink,
                                openInNewTab: item.cta.openInNewTab,
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                            openInNewTab: item.cta.openInNewTab,
                          },
                          styles: {
                            variant: props.featuredItems.styles.cta.variant,
                            color:
                              props.featuredItems.styles.cta.color ??
                              props.featuredItems.styles.cta.fontColor,
                            link: props.featuredItems.styles.cta.styles,
                          },
                        }
                      : undefined;

                  return (
                    <article
                      className={
                        hasFeatureImage
                          ? "fb-feature-card"
                          : "fb-feature-card fb-feature-card-no-image"
                      }
                      key={index}
                    >
                      {hasFeatureImage ? (
                        <div
                          className="fb-feature-image-frame"
                          style={imageStyles}
                        >
                          <Image
                            image={featureImage as ImageType}
                            className="fb-feature-image"
                          />
                        </div>
                      ) : null}
                      <Background
                        background={props.section.cardBackgroundColor}
                        className="fb-feature-overlay"
                      >
                        <h3 style={titleStyle}>{title}</h3>
                        <div className="fb-feature-description">
                          {typeof description === "string" ? (
                            <MaybeRTF
                              data={description}
                              richTextStyleOverrides={descriptionStyles}
                            />
                          ) : (
                            description
                          )}
                        </div>
                        {ctaValue ? (
                          <div className="fb-feature-cta">
                            <ComprehensiveCTA value={ctaValue} />
                          </div>
                        ) : null}
                      </Background>
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantFeaturedItemsSection: YextComponentConfig<FeaturedItemsSectionProps> =
  {
    label: "Featured Items Section",
    fields: featuredItemsFields,
    defaultProps,
    render: FeaturedItemsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFeaturedItemsSection",
  displayName: "Featured Items Section",
  description: "Featured Items Section",
  pageSetTypes: ["ENTITY"],
};
