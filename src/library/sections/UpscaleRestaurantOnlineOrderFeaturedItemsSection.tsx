import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  createItemSource,
  getDefaultForegroundColor,
  getDefaultRTF,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledImageValue,
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

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type FeaturedItemFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<ImageType>;
  ctaLabel: YextEntityField<TranslatableString>;
  ctaLink: YextEntityField<TranslatableString>;
  openInNewTab: YextEntityField<boolean>;
};

type FeaturedItemsStyle = React.CSSProperties &
  Record<`--${string}`, string | undefined>;

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

const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

const makeStringField = (
  value: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: value,
  constantValueEnabled: true,
});

const makeRtfField = (text: string): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(text),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const makeImageField = (
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

const makeBooleanField = (value: boolean): YextEntityField<boolean> => ({
  field: "",
  constantValue: value,
  constantValueEnabled: true,
});

const makeHeading = (text: string): StyledTextProps => ({
  text: makeStringField(text),
  styles: defaultTextStyles,
  fontColor: undefined,
});

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

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
};

const featuredItemsSource = createItemSource<FeaturedItemFields>({
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
    ctaLabel: {
      label: "CTA Label",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    ctaLink: {
      label: "CTA Link",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    openInNewTab: {
      label: "Open in New Tab",
      type: "entityField",
      filter: { types: ["type.boolean"] },
    },
  },
  defaultValues: [
    {
      title: makeStringField("Smokehouse Burger"),
      description: makeRtfField(
        "A wood-fired double smash burger topped with smoked cheddar, crispy onions, bourbon bacon jam, arugula, and house sauce on a toasted brioche bun. Served with hand-cut fries.",
      ),
      image: makeImageField(
        "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      ctaLabel: makeStringField("Learn More"),
      ctaLink: makeStringField("#"),
      openInNewTab: makeBooleanField(false),
    },
    {
      title: makeStringField("Chicken Sandwich"),
      description: makeRtfField(
        "Crispy buttermilk fried chicken layered with hot honey glaze, dill pickles, shredded lettuce, and chipotle aioli on a buttered potato bun. A local favorite during happy hour and weekend brunch.",
      ),
      image: makeImageField(
        "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      ctaLabel: makeStringField("Learn More"),
      ctaLink: makeStringField("#"),
      openInNewTab: makeBooleanField(false),
    },
    {
      title: makeStringField("Hill Country Steak Salad"),
      description: makeRtfField(
        "Grilled skirt steak served over mixed greens with roasted corn, avocado, pickled red onions, cotija cheese, tortilla strips, and cilantro-lime vinaigrette. Fresh, hearty, and distinctly Texas-inspired.",
      ),
      image: makeImageField(
        "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      ctaLabel: makeStringField("Learn More"),
      ctaLink: makeStringField("#"),
      openInNewTab: makeBooleanField(false),
    },
    {
      title: makeStringField("Black Truffle Mac & Cheese"),
      description: makeRtfField(
        "Creamy cavatappi pasta tossed in a smoked gouda and white cheddar blend, finished with black truffle oil, toasted breadcrumbs, and fresh herbs. Add grilled chicken or brisket for extra flavor.",
      ),
      image: makeImageField(
        "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
        1267,
        1900,
        "Featured item image",
      ),
      ctaLabel: makeStringField("Learn More"),
      ctaLink: makeStringField("#"),
      openInNewTab: makeBooleanField(false),
    },
  ],
});

type FeaturedItemsSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  featuredItems: {
    data: typeof featuredItemsSource.value;
    styles: {
      title: Pick<StyledTextProps, "styles" | "fontColor">;
      description: Pick<StyledRtfProps, "styles" | "fontColor">;
      image: {
        styles: StyledImageValue;
      };
      cta: {
        variant: "primary" | "secondary" | "link";
        color?: ThemeColor;
      };
    };
  };
};

const makeCtaValue = ({
  label,
  link,
  openInNewTab,
  styles,
}: {
  label: string;
  link: string;
  openInNewTab: boolean;
  styles: FeaturedItemsSectionProps["featuredItems"]["styles"]["cta"];
}): Partial<ComprehensiveCTAValue> => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label,
        link,
        linkType: "URL",
        openInNewTab,
        normalizeLink: false,
      },
      constantValueEnabled: true,
    },
    openInNewTab,
  },
  styles: {
    variant: styles.variant,
    color: styles.color,
  },
});

const defaultProps: FeaturedItemsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "palette-quaternary"),
    cardBackgroundColor: makeThemeColor("white", "black"),
  },
  heading: makeHeading("Featured Menu Items to Order from [[address.city]]"),
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
      data: {
        label: "Items",
        ...featuredItemsSource.field,
      },
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
                options: "SITE_COLOR",
              },
            },
          },
        },
      },
    },
  },
};

const UpscaleRestaurantOnlineOrderCss = `
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
  padding: 14px 14px 12px;
  border-top-right-radius: 64px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.fb-feature-card.fb-feature-card-no-image .fb-feature-overlay {
  margin-top: 0;
  border-top-right-radius: 24px;
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
  .fb-feature-overlay {
    width: 94%;
    max-width: 100%;
    padding: 18px 16px 16px;
  }
  .fb-feature-card.fb-feature-card-no-image .fb-feature-overlay {
    width: 100%;
  }
}
`;

const FeaturedItemsSection: PuckComponent<FeaturedItemsSectionProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const cardForegroundColor =
    getThemeColorCssValue(
      getDefaultForegroundColor(
        props.section.cardBackgroundColor,
        streamDocument,
      ),
    ) ?? "currentColor";
  const heading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.heading.styles),
    margin: "0 0 28px",
    color: getThemeColorCssValue(props.heading.fontColor) ?? "currentColor",
  };
  const titleStyle: React.CSSProperties = {
    ...makeTextStyle(props.featuredItems.styles.title.styles),
    color:
      getThemeColorCssValue(props.featuredItems.styles.title.fontColor) ??
      cardForegroundColor,
  };
  const descriptionStyles = {
    ...props.featuredItems.styles.description.styles,
    color:
      getThemeColorCssValue(props.featuredItems.styles.description.fontColor) ??
      cardForegroundColor,
  };
  const imageStyles = makeImageStyle(props.featuredItems.styles.image.styles);
  const featuredItems = featuredItemsSource.resolveItems(
    props.featuredItems.data,
    streamDocument,
  );
  const pageStyle: FeaturedItemsStyle = {
    "--fb-feature-card-text": cardForegroundColor,
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
        <style>{UpscaleRestaurantOnlineOrderCss}</style>
        <section className="fb-section fb-featured-section">
          <div className="fb-container">
            <h2 style={headingStyle}>{heading}</h2>
            <EntityField
              displayName="Featured Items"
              fieldId={props.featuredItems.data.field}
              constantValueEnabled={
                props.featuredItems.data.constantValueEnabled
              }
            >
              <div className="fb-featured-grid">
                {featuredItems.map((item, index) => {
                  const title = item.title
                    ? resolveComponentData(item.title, locale, streamDocument)
                    : "";
                  const description = item.description
                    ? resolveComponentData(
                        item.description,
                        locale,
                        streamDocument,
                        {
                          richTextStyleOverrides: descriptionStyles,
                        },
                      )
                    : undefined;
                  const image = item.image
                    ? resolveComponentData(item.image, locale, streamDocument)
                    : undefined;
                  const hasImage = hasImageSource(image);
                  const ctaLabel = item.ctaLabel
                    ? resolveComponentData(
                        item.ctaLabel,
                        locale,
                        streamDocument,
                      )
                    : undefined;
                  const ctaLink = item.ctaLink
                    ? resolveComponentData(item.ctaLink, locale, streamDocument)
                    : undefined;

                  return (
                    <article
                      className={`fb-feature-card${
                        hasImage ? "" : " fb-feature-card-no-image"
                      }`}
                      key={`${title || "item"}-${index}`}
                    >
                      {hasImage ? (
                        <div
                          className="fb-feature-image-frame"
                          style={imageStyles}
                        >
                          <Image image={image} className="fb-feature-image" />
                        </div>
                      ) : null}
                      <Background
                        className="fb-feature-overlay"
                        background={props.section.cardBackgroundColor}
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
                        {ctaLabel && ctaLink ? (
                          <div className="fb-feature-cta">
                            <ComprehensiveCTA
                              value={makeCtaValue({
                                label: String(ctaLabel),
                                link: String(ctaLink),
                                openInNewTab: item.openInNewTab ?? false,
                                styles: props.featuredItems.styles.cta,
                              })}
                            />
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

export const UpscaleRestaurantOnlineOrderFeaturedItemsSection: YextComponentConfig<FeaturedItemsSectionProps> =
  {
    label: "Featured Items Section",
    fields: featuredItemsFields,
    defaultProps,
    render: FeaturedItemsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderFeaturedItemsSection",
  displayName: "Featured Items Section",
  description: "Featured Items Section",
  pageSetTypes: ["ENTITY"],
};
