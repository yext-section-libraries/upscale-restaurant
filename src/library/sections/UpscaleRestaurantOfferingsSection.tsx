import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  EntityField,
  Image,
  ThemeOptions,
  VisibilityWrapper,
  createItemSource,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
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
  label: "Items",
  mappingFields: {
    label: {
      label: "Label",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    unavailable: {
      label: "Unavailable",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
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

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
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

const makeTextStyle = (text: StyledTextProps): React.CSSProperties => ({
  fontFamily:
    text.styles.fontFamily === "default" ? undefined : text.styles.fontFamily,
  fontSize:
    text.styles.fontSize === "default" ? undefined : text.styles.fontSize,
  fontWeight:
    text.styles.fontWeight === "default" ? undefined : text.styles.fontWeight,
  fontStyle:
    text.styles.fontStyle === "default" ? undefined : text.styles.fontStyle,
  textTransform:
    text.styles.textTransform === "default"
      ? undefined
      : text.styles.textTransform,
  color: getThemeColorCssValue(text.fontColor),
});

const makeImageStyle = (
  image: StyledImageProps,
): {
  wrapper: ResponsiveImageStyle;
  image: React.CSSProperties;
} => {
  const hasCustomRadius = image.styles.borderRadius !== "default";
  const aspectRatio = image.aspectRatio > 0 ? image.aspectRatio : undefined;
  const borderRadius = hasCustomRadius ? image.styles.borderRadius : undefined;

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

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
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

const offeringsFields: YextFields<OfferingsSectionProps> = {
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
  offerings: {
    label: "Offerings",
    type: "object",
    objectFields: {
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
      image: {
        label: "Image",
        type: "object",
        objectFields: {
          image: {
            label: "Image",
            type: "entityField",
            filter: { types: ["type.image"] },
          },
          aspectRatio: {
            label: "Aspect Ratio",
            type: "basicSelector",
            options: ThemeOptions.ASPECT_RATIO,
          },
          styles: {
            label: "Image Styles",
            type: "styledImage",
          },
        },
      },
      items: {
        label: "Items",
        ...offeringsItemSource.field,
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-offerings-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-offerings-shell * { box-sizing: border-box; }
.fb-offerings-shell p,
.fb-offerings-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-offerings-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-offerings-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-offerings-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-offerings-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-offerings-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-offerings-shell h6 {
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
.fb-tint-section {
  background: var(--fb-tint-bg);
}
.fb-container {
  width: min(1200px, calc(100% - 48px));
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
  .fb-section {
    padding-block: 72px;
  }
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

const OfferingsSection: PuckComponent<OfferingsSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.offerings.heading.text,
    locale,
    streamDocument,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const headingColor = getThemeColorCssValue(props.offerings.heading.fontColor);
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.offerings.heading),
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
                displayName="Image"
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
                displayName="Heading"
                fieldId={props.offerings.heading.text.field}
                constantValueEnabled={
                  props.offerings.heading.text.constantValueEnabled
                }
              >
                <h2 style={headingStyle}>{heading}</h2>
              </EntityField>
              <EntityField
                displayName="Items"
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

export const UpscaleRestaurantOfferingsSection: YextComponentConfig<OfferingsSectionProps> =
  {
    label: "Offerings Section",
    fields: offeringsFields,
    defaultProps,
    render: OfferingsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOfferingsSection",
  displayName: "Offerings Section",
  description: "Offerings Section",
  pageSetTypes: ["ENTITY"],
};
