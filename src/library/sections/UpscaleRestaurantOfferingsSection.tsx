import "../shared/typography.css";
import {
  resolveSelectedColor,
  getSurfaceColorStyle,
  aspectRatioOptions,
  hasImageSource,
  makeText,
  makeThemeColor,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  EntityField,
  Image,
  VisibilityWrapper,
  createItemSource,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

type StyledImageProps = {
  image: YextEntityField<ImageType>;
  aspectRatio: number;
  styles: StyledImageValue;
};

type OfferingsMenuItemProps = {
  label: YextEntityField<TranslatableString>;
  unavailable?: boolean;
};

const offeringsItemSource = createItemSource<OfferingsMenuItemProps>({
  label: msg("fields.items", "Items"),
  mappingFields: {
    label: {
      label: msg("fields.label", "Label"),
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    unavailable: {
      label: msg("fields.unavailable", "Unavailable"),
      type: "radio",
      options: [
        { label: msg("fields.yes", "Yes"), value: true },
        { label: msg("fields.no", "No"), value: false },
      ],
    },
  },
  defaultValues: [
    {
      label: {
        field: "",
        constantValue:
          "Menu: Appetizers, Salads, Soups, Entree's, Dessert, Draft Beer, Cocktails",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Dine-in",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Takeout",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Delivery",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Curbside pickup",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Call-Ahead",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Reservations via Opentable",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Handicap Access",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
    {
      label: {
        field: "",
        constantValue: "Wi-Fi",
        constantValueEnabled: true,
      },
      unavailable: true,
    },
    {
      label: {
        field: "",
        constantValue: "Safe handling",
        constantValueEnabled: true,
      },
      unavailable: false,
    },
  ],
});

type OfferingsSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  offerings: {
    heading: StyledTextProps;
    image: StyledImageProps;
    items: typeof offeringsItemSource.value;
  };
};

type OfferingsStyle = React.CSSProperties & Record<`--${string}`, string>;
type ResponsiveImageStyle = React.CSSProperties & {
  "--fb-mobile-image-width"?: string;
};

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
};

const makeImageStyle = (
  image: OfferingsSectionRenderProps["offerings"]["image"],
): {
  wrapper: ResponsiveImageStyle;
  image: React.CSSProperties;
} => {
  const hasCustomRadius = image.styles.borderRadius !== undefined;
  const aspectRatio = image.aspectRatio > 0 ? image.aspectRatio : undefined;
  const borderRadius = image.styles.borderRadius;

  return {
    wrapper: {
      aspectRatio,
      borderRadius,
      overflow: hasCustomRadius ? "hidden" : undefined,
      width: "100%",
      "--fb-mobile-image-width":
        aspectRatio !== undefined ? `${360 * aspectRatio}px` : undefined,
    },
    image: {
      display: "block",
      aspectRatio,
      width: "100%",
      height: "auto",
      borderRadius,
      objectFit: "cover",
      objectPosition: "center",
    },
  };
};

const makeImage = (
  url: string,
  width: number,
  height: number,
  aspectRatio: number,
  alternateText: string,
): StyledImageProps => ({
  image: {
    field: "",
    constantValue: {
      url,
      width,
      height,
      alternateText,
    },
    constantValueEnabled: true,
  },
  aspectRatio: aspectRatio,
  styles: defaultImageStyles,
});

const defaultProps: OfferingsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor(
      "palette-tertiary",
      "palette-tertiary-contrast",
    ),
  },
  offerings: {
    heading: makeText("Offerings"),
    image: makeImage(
      "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
      1267,
      1900,
      1,
      "Offerings image",
    ),
    items: offeringsItemSource.defaultValue,
  },
};

type OfferingsSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<OfferingsSectionProps, typeof offeringsFields>>
>;

const offeringsFields = {
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
    },
  },
  offerings: {
    label: msg("fields.offerings", "Offerings"),
    type: "object",
    objectFields: {
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
      image: {
        label: msg("fields.image", "Image"),
        type: "object",
        objectFields: {
          image: {
            label: msg("fields.image", "Image"),
            type: "entityField",
            filter: { types: ["type.image"] },
          },
          aspectRatio: {
            label: msg("fields.aspectRatio", "Aspect Ratio"),
            type: "basicSelector",
            options: aspectRatioOptions,
          },
          styles: {
            label: msg("fields.imageStyles", "Image Styles"),
            type: "styledImage",
            transform: true,
          },
        },
      },
      items: {
        label: msg("fields.items", "Items"),
        ...offeringsItemSource.field,
      },
    },
  },
} satisfies YextFields<OfferingsSectionProps>;

const UpscaleRestaurantCss = `
.fb-offerings-shell * { box-sizing: border-box; }
.fb-offerings-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-offerings-shell .fb-tint-section {
  background: var(--fb-tint-bg);
}
.fb-offerings-shell .fb-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
  margin: 0 auto;
}
.fb-offerings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 72px;
}
.fb-offerings-image {
  width: 100%;
}
.fb-offerings-image-content {
  width: 100%;
  display: block;
}
.fb-offerings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.fb-offerings-list li {
  position: relative;
  margin-bottom: 12px;
  padding-left: 24px;
  color: var(--fb-text);
}
.fb-offerings-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--fb-list-bullet);
}
.fb-offerings-list .fb-unavailable::before {
  content: "×";
  color: var(--fb-list-unavailable);
}
@media (max-width: 1100px) {
  .fb-offerings-grid {
    gap: 24px;
  }
}
@media (max-width: 760px) {
  .fb-offerings-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .fb-offerings-image {
    aspect-ratio: unset !important;
  }
  .fb-offerings-image .fb-offerings-image-content {
    max-height: 360px;
  }
  .fb-offerings-image .fb-offerings-image-content img {
    margin: 0 auto;
    max-height: 360px;
    width: auto !important;
  }
}
`;

const OfferingsSection: React.FC<OfferingsSectionRenderProps> = (props) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const heading = resolveComponentData(
    props.offerings.heading.text,
    locale,
    streamDocument,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const headingColor = resolveSelectedColor(props.offerings.heading.fontColor);
  const headingStyle: React.CSSProperties = {
    ...props.offerings.heading.styles,
    margin: "0 0 32px",
    color: headingColor,
  };
  const resolvedImage = resolveComponentData(
    props.offerings.image.image,
    locale,
    streamDocument,
  );
  const hasImage = hasImageSource(resolvedImage);
  const imageStyles = makeImageStyle(props.offerings.image);
  const resolvedItems = offeringsItemSource.resolveItems(
    props.offerings.items,
    streamDocument,
  );
  const pageStyle: OfferingsStyle = {
    ...sectionSurfaceStyle,
    "--fb-list-bullet": "currentColor",
    "--fb-list-unavailable": "currentColor",
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-offerings-shell"
        background={props.section.backgroundColor}
        style={pageStyle}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-tint-section">
          <div
            className="fb-container fb-offerings-grid"
            style={{ gridTemplateColumns: hasImage ? undefined : "1fr" }}
          >
            {hasImage ? (
              <EntityField
                displayName={pt("image", "Image")}
                fieldId={props.offerings.image.image.field}
                constantValueEnabled={
                  props.offerings.image.image.constantValueEnabled
                }
              >
                <div className="fb-offerings-image" style={imageStyles.wrapper}>
                  <Image
                    image={resolvedImage}
                    className="fb-offerings-image-content"
                    style={imageStyles.image}
                  />
                </div>
              </EntityField>
            ) : null}
            <article>
              <EntityField
                displayName={pt("heading", "Heading")}
                fieldId={props.offerings.heading.text.field}
                constantValueEnabled={
                  props.offerings.heading.text.constantValueEnabled
                }
              >
                <h2 style={headingStyle}>{heading}</h2>
              </EntityField>
              <EntityField
                displayName={pt("items", "Items")}
                fieldId={props.offerings.items.field}
                constantValueEnabled={
                  props.offerings.items.constantValueEnabled
                }
              >
                <ul className="fb-offerings-list">
                  {resolvedItems.map((item, index) => {
                    const itemLabelValue = item.label ?? "";
                    const resolvedItemLabel = resolveComponentData(
                      itemLabelValue,
                      locale,
                      streamDocument,
                    );

                    return (
                      <li
                        key={`${resolvedItemLabel || "item"}-${index}`}
                        className={
                          item.unavailable ? "fb-unavailable" : undefined
                        }
                        style={item.unavailable ? { opacity: 0.65 } : undefined}
                      >
                        {resolvedItemLabel}
                      </li>
                    );
                  })}
                </ul>
              </EntityField>
            </article>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOfferingsSection: YextComponentConfig<
  OfferingsSectionProps,
  typeof offeringsFields
> =
  {
    label: msg("components.offeringsLabel", "Offerings Section"),
    fields: offeringsFields,
    defaultProps,
    render: (props) => (
      <OfferingsSection {...(props as OfferingsSectionRenderProps)} />
    ),
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOfferingsSection",
  displayName: "Offerings Section",
  description: "Offerings Section",
  pageSetTypes: ["ENTITY"],
};
