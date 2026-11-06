import "../shared/typography.css";
import {
  defaultTextStyles,
  hasImageSource,
  makeRtfField,
  makeText,
  renderRichText,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { getThemeColorCssValue, msg, pt } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType, LinkType } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  VisibilityWrapper,
  createItemSource,
  resolveComponentData,
  useDocument,
  type ResolvedComprehensiveCTAValue,
  type StyledImageValue,
  type StyledLinkValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

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

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
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

const featuredItemsSource = createItemSource<FeaturedItemProps>({
  label: msg("fields.featuredItems", "Featured Items"),
  mappingFields: {
    title: {
      label: msg("fields.title", "Title"),
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    description: {
      label: msg("fields.description", "Description"),
      type: "entityField",
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      label: msg("fields.image", "Image"),
      type: "entityField",
      filter: { types: ["type.image"] },
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      type: "object",
      objectFields: {
        label: {
          label: msg("fields.label", "Label"),
          type: "entityField",
          filter: { types: ["type.string"] },
        },
        link: {
          label: msg("fields.link", "Link"),
          type: "entityField",
          filter: { types: ["type.string"] },
        },
        linkType: {
          label: msg("fields.linkType", "Link Type"),
          type: "select",
          options: [
            { label: msg("fields.url", "URL"), value: "URL" },
            { label: msg("fields.phone", "Phone"), value: "PHONE" },
            { label: msg("fields.email", "Email"), value: "EMAIL" },
          ],
        },
        normalizeLink: {
          label: msg("fields.normalizeLink", "Normalize Link"),
          type: "radio",
          options: [
            { label: msg("fields.yes", "Yes"), value: true },
            { label: msg("fields.no", "No"), value: false },
          ],
        },
        openInNewTab: {
          label: msg("fields.openInNewTab", "Open in New Tab"),
          type: "radio",
          options: [
            { label: msg("fields.yes", "Yes"), value: true },
            { label: msg("fields.no", "No"), value: false },
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
      description: makeRtfField(
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
      description: makeRtfField(
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
      description: makeRtfField(
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
    backgroundColor: { selectedColor: "white", contrastingColor: "palette-quaternary" },
    cardBackgroundColor: { selectedColor: "white", contrastingColor: "black" },
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

type FeaturedItemsSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<FeaturedItemsSectionProps, typeof featuredItemsFields>>
>;

const featuredItemsFields = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.yes", "Yes"), value: true },
          { label: msg("fields.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardBackgroundColor: {
        label: msg("fields.cardBackgroundColor", "Card Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        label: msg("fields.text", "Text"),
        type: "entityField",
        filter: { types: ["type.string"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
        transform: true,
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  featuredItems: {
    label: msg("fields.featuredItems", "Featured Items"),
    type: "object",
    objectFields: {
      data: featuredItemsSource.field,
      styles: {
        label: msg("fields.styles", "Styles"),
        type: "object",
        objectFields: {
          title: {
            label: msg("fields.title", "Title"),
            type: "object",
            objectFields: {
              styles: {
                label: msg("fields.textStyles", "Text Styles"),
                type: "styledText",
                transform: true,
              },
              fontColor: {
                label: msg("fields.fontColor", "Font Color"),
                type: "basicSelector",
                options: "SITE_COLOR",
              },
            },
          },
          description: {
            label: msg("fields.description", "Description"),
            type: "object",
            objectFields: {
              styles: {
                label: msg("fields.textStyles", "Text Styles"),
                type: "styledText",
                transform: true,
              },
              fontColor: {
                label: msg("fields.fontColor", "Font Color"),
                type: "basicSelector",
                options: "SITE_COLOR",
              },
            },
          },
          image: {
            label: msg("fields.image", "Image"),
            type: "object",
            objectFields: {
              styles: {
                label: msg("fields.imageStyles", "Image Styles"),
                type: "styledImage",
                transform: true,
              },
            },
          },
          cta: {
            label: msg("fields.cta", "CTA"),
            type: "object",
            objectFields: {
              styles: {
                label: msg("fields.linkStyles", "Link Styles"),
                type: "styledLink",
                transform: true,
                showIncludeCaretField: false,
              },
              fontColor: {
                label: msg("fields.fontColor", "Font Color"),
                type: "basicSelector",
                options: "SITE_COLOR",
              },
              variant: {
                label: msg("fields.variant", "Variant"),
                type: "select",
                options: [
                  { label: msg("fields.primary", "Primary"), value: "primary" },
                  {
                    label: msg("fields.secondary", "Secondary"),
                    value: "secondary",
                  },
                  { label: msg("fields.link", "Link"), value: "link" },
                ],
              },
              color: {
                label: msg("fields.color", "Color"),
                type: "basicSelector",
                options: "BACKGROUND_COLOR",
              },
            },
          },
        },
      },
    },
  },
} satisfies YextFields<FeaturedItemsSectionProps>;

const UpscaleRestaurantCss = `
.fb-featured-shell * { box-sizing: border-box; }
.fb-featured-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-featured-shell .fb-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
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
  border-radius: var(--borderRadius-image-borderRadius);
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

const FeaturedItemsSection: React.FC<FeaturedItemsSectionRenderProps> = (props) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const heading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    ...props.heading.styles,
    margin: "0 0 28px",
    color: getThemeColorCssValue(props.heading.fontColor),
  };
  const items = featuredItemsSource.resolveItems(
    props.featuredItems.data,
    { ...streamDocument, locale },
  );

  // resolveItems already interpolates manual content in the selected locale.
  // Mapped item content still needs the page document during manual resolution.
  const itemInterpolationDocument =
    props.featuredItems.data.constantValueEnabled || !props.featuredItems.data.field
      ? undefined
      : streamDocument;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        background={props.section.backgroundColor}
        className="fb-featured-shell"
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-featured-section">
          <div className="fb-container">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2 style={headingStyle}>{heading}</h2>
            </EntityField>
            <EntityField
              displayName={pt("featuredItems", "Featured Items")}
              fieldId={props.featuredItems.data.field}
              constantValueEnabled={
                props.featuredItems.data.constantValueEnabled
              }
            >
              <div className="fb-featured-grid">
                {items.map((item, index) => {
                  const title = item.title
                    ? resolveComponentData(item.title, locale, itemInterpolationDocument)
                    : "";
                  const titleStyle: React.CSSProperties = {
                    ...props.featuredItems.styles.title.styles,
                    color: getThemeColorCssValue(
                      props.featuredItems.styles.title.fontColor,
                    ),
                  };
                  const descriptionStyles = {
                    ...props.featuredItems.styles.description.styles,
                    color: getThemeColorCssValue(
                      props.featuredItems.styles.description.fontColor,
                    ),
                  };
                  const description = item.description
                    ? resolveComponentData(
                        item.description,
                        locale,
                        itemInterpolationDocument,
                        { color: props.featuredItems.styles.description.fontColor },
                      )
                    : "";
                  const resolvedImage = item.image
                    ? resolveComponentData(item.image, locale, itemInterpolationDocument)
                    : "";
                  const ctaLabel = item.cta.label
                    ? resolveComponentData(
                        item.cta.label,
                        locale,
                        itemInterpolationDocument,
                      )
                    : "";
                  const ctaLink = item.cta.link
                    ? resolveComponentData(
                        item.cta.link,
                        locale,
                        itemInterpolationDocument,
                      )
                    : "";
                  const featureImage = hasImageSource(resolvedImage)
                    ? resolvedImage
                    : undefined;
                  const hasFeatureImage = Boolean(featureImage);
                  const hasCta = Boolean(ctaLabel) && Boolean(ctaLink);
                  const ctaValue: ResolvedComprehensiveCTAValue | undefined =
                    hasCta
                      ? {
                          data: {
                            actionType: "link",
                            cta: {
                              label: String(ctaLabel),
                              link: String(ctaLink),
                              linkType: item.cta.linkType,
                              normalizeLink: item.cta.normalizeLink,
                              openInNewTab: item.cta.openInNewTab,
                              ctaType: "textAndLink",
                            },
                            openInNewTab: item.cta.openInNewTab,
                          },
                          styles: {
                            variant: props.featuredItems.styles.cta.variant,
                            color:
                              props.featuredItems.styles.cta.color ??
                              props.featuredItems.styles.cta.fontColor,
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
                          style={props.featuredItems.styles.image.styles}
                        >
                          <Image
                            image={featureImage as ImageType}
                            className="fb-feature-image"
                            style={props.featuredItems.styles.image.styles}
                          />
                        </div>
                      ) : null}
                      <Background
                        background={props.section.cardBackgroundColor}
                        className="fb-feature-overlay"
                      >
                        <h3 style={titleStyle}>{title}</h3>
                        <div className="fb-feature-description">
                          {renderRichText(description, descriptionStyles)}
                        </div>
                        {ctaValue ? (
                          <div className="fb-feature-cta">
                            <ComprehensiveCTA
                              value={ctaValue}
                              style={props.featuredItems.styles.cta.styles}
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

export const UpscaleRestaurantFeaturedItemsSection: YextComponentConfig<
  FeaturedItemsSectionProps,
  typeof featuredItemsFields
> =
  {
    label: msg("components.featuredItemsLabel", "Featured Items"),
    fields: featuredItemsFields,
    defaultProps,
    render: (props) => (
      <FeaturedItemsSection {...(props as FeaturedItemsSectionRenderProps)} />
    ),
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFeaturedItemsSection",
  displayName: "Featured Items",
  description: "Featured Items Section",
  pageSetTypes: ["ENTITY"],
};
