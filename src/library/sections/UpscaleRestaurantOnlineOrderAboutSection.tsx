import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  EntityField,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  getDefaultRTF,
  getDefaultForegroundColor,
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
  styles: StyledTextValue;
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

const makeMultiParagraphRtf = (
  paragraphs: string[],
): ReturnType<typeof getDefaultRTF> => ({
  html: paragraphs
    .map(
      (paragraph) =>
        `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>${paragraph}</span></p>`,
    )
    .join(""),
  json: JSON.stringify({
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      })),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  }),
});

const defaultAboutParagraphs = [
  "At [[name]], we believe great burgers start with great ingredients and a sense of place. Nestled in the heart of [[address.city]], our burger restaurant brings together wood-fired flavor, chef-driven comfort food, and the laid-back energy that makes [[address.region]] unforgettable. From locally sourced beef and scratch-made sauces to craft cocktails and rotating [[address.region]] drafts, every detail is designed for guests who appreciate elevated casual dining without the pretension.",
  "Whether you're grabbing brunch before exploring [[address.city]], meeting friends for happy hour after work downtown, dining in with family, or ordering online for a night in [[address.city]], [[name]] makes it easy to enjoy your favorites wherever you are. Our streamlined online ordering platform offers convenient curbside pickup and fast delivery, so guests can order burgers, fries, shakes, cocktails, and weekend brunch directly from our website in just a few clicks.",
  "Conveniently located at [[address.line1]] in [[geomodifier]] [[address.city]], [[name]] offers dine-in, online ordering, curbside pickup, delivery, catering, and private group accommodations for locals and visitors looking for one of the best upscale burger restaurants in [[address.city]], [[address.region]].",
];

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

const defaultProps: AboutSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "palette-quaternary"),
  },
  about: {
    heading: makeText("What is [[name]]?"),
    content: {
      text: {
        field: "",
        constantValue: {
          defaultValue: makeMultiParagraphRtf(defaultAboutParagraphs),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      styles: defaultTextStyles,
      fontColor: undefined,
    },
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
            type: "basicSelector",
            label: "Aspect Ratio",
            options: [
              { label: "1:1", value: 1 },
              { label: "5:4", value: 1.25 },
              { label: "4:3", value: 1.33 },
              { label: "3:2", value: 1.5 },
              { label: "5:3", value: 1.67 },
              { label: "16:9", value: 1.78 },
              { label: "2:1", value: 2 },
              { label: "3:1", value: 3 },
              { label: "4:1", value: 4 },
              { label: "4:5", value: 0.8 },
              { label: "3:4", value: 0.75 },
              { label: "2:3", value: 0.67 },
              { label: "3:5", value: 0.6 },
              { label: "9:16", value: 0.56 },
              { label: "1:2", value: 0.5 },
              { label: "1:3", value: 0.33 },
              { label: "1:4", value: 0.25 },
            ],
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
.fb-about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 72px;
}
.fb-about-text {
  max-width: 520px;
}
.fb-about-text h2 {
  line-height: 1.08;
  margin-bottom: 14px;
  text-align: left;
}
.fb-about-text p {
  line-height: 1.5;
  margin: 14px 0 16px;
}
.fb-about-art {
  overflow: visible;
}
.fb-about-image {
  width: 125%;
  max-width: none;
  min-height: 360px;
  object-fit: cover;
  object-position: left center;
}
@media (max-width: 1100px) {
  .fb-about-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .fb-about-text {
    max-width: none;
  }
  .fb-about-image {
    width: 100%;
    min-height: 0;
    object-position: center;
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-about-text {
    max-width: none;
  }
  .fb-about-image {
    aspect-ratio: unset !important;
  }
  .fb-about-image img {
    max-height: 360px;
    width: auto !important;
  }
  .fb-about-art {
    margin: 0 auto;
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
  const sectionForegroundColor =
    getThemeColorCssValue(
      getDefaultForegroundColor(props.section.backgroundColor, streamDocument),
    ) ?? "currentColor";
  const headingColor = getThemeColorCssValue(props.about.heading.fontColor);
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.about.heading),
    textAlign: "left",
    marginBottom: "14px",
    color: headingColor ?? sectionForegroundColor,
  };
  const contentColor = getThemeColorCssValue(props.about.content.fontColor);
  const contentStyleOverrides = {
    ...props.about.content.styles,
    color: contentColor ?? sectionForegroundColor,
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
  const pageStyle: AboutStyle = {
    "--fb-muted": sectionForegroundColor,
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

export const UpscaleRestaurantOnlineOrderAboutSection: YextComponentConfig<AboutSectionProps> =
  {
    label: "About Section",
    fields: aboutSectionFields,
    defaultProps,
    render: AboutSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderAboutSection",
  displayName: "About Section",
  description: "About Section",
  pageSetTypes: ["ENTITY"],
};
