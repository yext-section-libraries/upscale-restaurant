import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  EntityField,
  Image,
  MaybeRTF,
  ThemeOptions,
  VisibilityWrapper,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
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
  fontColor?: ThemeColor;
};

type AboutSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  about: {
    heading: StyledTextProps;
    content: StyledRtfProps;
    image: {
      image: YextEntityField<ImageType>;
      aspectRatio: number;
      styles: StyledImageValue;
    };
  };
};

type AboutStyle = React.CSSProperties & Record<`--${string}`, string>;
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

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
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
  image: AboutSectionProps["about"]["image"],
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

const defaultProps: AboutSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "palette-quaternary"),
  },
  about: {
    heading: makeText("What is [[name]]?"),
    content: makeRtf(
      "At [[name]], we believe great burgers start with great ingredients and a sense of place. Nestled in the heart of [[address.region]], our [[address.city]] burger restaurant brings together wood-fired flavor, chef-driven comfort food, and the laid-back energy that makes [[address.city]] unforgettable. From locally sourced beef and scratch-made sauces to craft cocktails and rotating [[address.region]] drafts, every detail is designed for guests who appreciate elevated casual dining without the pretension.\n\nWhether you're grabbing brunch before exploring [[address.city]], meeting friends for happy hour after work downtown, or ordering takeout for a night in [[address.geomodifier]] [[address.city]], [[name]] delivers a distinctly [[address.city]] experience rooted in quality, hospitality, and bold flavor. Our menu blends classic American favorites with modern [[address.region]] influences, making us a favorite for burgers, weekend brunch, date nights, and group dining alike.\n\nConveniently located on [[address.line1]] in [[geomodifier]] [[address.city]], [[name]] offers dine-in, curbside pickup, delivery, and private group accommodations for locals and visitors looking for one of the best upscale burger restaurants in [[address.city]], [[address.region]].",
    ),
    image: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
          alternateText: "About image",
        },
        constantValueEnabled: true,
      },
      aspectRatio: 1,
      styles: defaultImageStyles,
    },
  },
};

const aboutSectionFields: YextFields<AboutSectionProps> = {
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
  about: {
    label: "About",
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
      content: {
        label: "Content",
        type: "object",
        objectFields: {
          text: {
            label: "Text",
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
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
            type: "basicSelector",
            label: "Aspect Ratio",
            options: ThemeOptions.ASPECT_RATIO,
          },
          styles: {
            label: "Image Styles",
            type: "styledImage",
          },
        },
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-about-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-about-shell * { box-sizing: border-box; }
.fb-about-shell p,
.fb-about-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-about-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-about-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-about-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-about-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-about-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-about-shell h6 {
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
.fb-about-section {
  padding-block: 0;
  padding-inline: var(--padding-pageSection-horizontalPadding);
}
.fb-container {
  width: min(1540px, 100%);
  margin: 0 auto;
}
.fb-about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 72px;
}
.fb-about-text {
  max-width: 520px;
  align-self: center;
}
.fb-about-text h2 {
  font-size: clamp(34px, 4vw, 54px);
  line-height: 1.08;
  margin-bottom: 14px;
  text-align: left;
}
.fb-about-text p {
  color: currentColor;
  font-size: 16px;
  line-height: 1.5;
  margin: 14px 0 16px;
}
.fb-about-art {
  display: flex;
  align-items: center;
  min-width: 0;
}
.fb-about-image {
  width: 100%;
}
@media (max-width: 1100px) {
  .fb-about-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .fb-about-text {
    max-width: none;
  }
  .fb-about-art {
    align-items: center;
    margin-right: 0;
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-about-section {
    padding-inline: var(--padding-pageSection-horizontalPadding);
  }
  .fb-about-text {
    max-width: none;
  }
  .fb-about-image {
    aspect-ratio: unset !important;
  }
  .fb-about-art {
    margin: 0 auto;
  }
  .fb-about-image img {
    max-height: 360px;
    width: auto !important;
  }
}
`;

const AboutSection: PuckComponent<AboutSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.about.heading.text,
    locale,
    streamDocument,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.about.heading),
    textAlign: "left",
    marginBottom: "14px",
    color: getThemeColorCssValue(props.about.heading.fontColor),
  };
  const contentStyleOverrides = {
    color: getThemeColorCssValue(props.about.content.fontColor),
  };
  const content = resolveComponentData(
    props.about.content.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: contentStyleOverrides,
    },
  );
  const contentIsElement = React.isValidElement(content);
  const image = resolveComponentData(
    props.about.image.image,
    locale,
    streamDocument,
  );
  const currentImage = image ?? props.about.image.image.constantValue;
  const hasImage = hasImageSource(currentImage);
  const imageStyles = makeImageStyle(props.about.image);

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-about-shell"
        style={sectionSurfaceStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-about-section">
          <div
            className="fb-container fb-about-grid"
            style={{ gridTemplateColumns: hasImage ? undefined : "1fr" }}
          >
            <article
              className="fb-about-text"
              style={hasImage ? undefined : { maxWidth: "none", width: "100%" }}
            >
              <EntityField
                displayName="Heading"
                fieldId={props.about.heading.text.field}
                constantValueEnabled={
                  props.about.heading.text.constantValueEnabled
                }
              >
                <h2 style={headingStyle}>{heading}</h2>
              </EntityField>
              <EntityField
                displayName="Content"
                fieldId={props.about.content.text.field}
                constantValueEnabled={
                  props.about.content.text.constantValueEnabled
                }
              >
                {contentIsElement ? (
                  content
                ) : typeof content === "string" ? (
                  <MaybeRTF
                    data={content}
                    richTextStyleOverrides={contentStyleOverrides}
                  />
                ) : null}
              </EntityField>
            </article>
            {hasImage ? (
              <div className="fb-about-art">
                <EntityField
                  displayName="Image"
                  fieldId={props.about.image.image.field}
                  constantValueEnabled={
                    props.about.image.image.constantValueEnabled
                  }
                >
                  <div className="fb-about-image" style={imageStyles.wrapper}>
                    <Image image={currentImage} style={imageStyles.image} />
                  </div>
                </EntityField>
              </div>
            ) : null}
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantAboutSection: YextComponentConfig<AboutSectionProps> =
  {
    label: "About Section",
    fields: aboutSectionFields,
    defaultProps,
    render: AboutSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantAboutSection",
  displayName: "About Section",
  description: "About Section",
  pageSetTypes: ["ENTITY"],
};
