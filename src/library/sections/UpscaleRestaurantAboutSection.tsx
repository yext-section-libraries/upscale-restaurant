import "../shared/typography.css";
import {
  resolveSelectedColor,
  getSurfaceColorStyle,
  aspectRatioOptions,
  hasImageSource,
  makeRtf,
  makeText,
  makeThemeColor,
  renderRichText,
  type StyledRtfProps,
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
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type ThemeColor,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

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

const defaultImageStyles: StyledImageValue = {
  borderRadius: "default",
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

type AboutSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<AboutSectionProps, typeof aboutSectionFields>>
>;

const aboutSectionFields = {
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
  about: {
    label: msg("fields.about", "About"),
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
      content: {
        label: msg("fields.content", "Content"),
        type: "object",
        objectFields: {
          text: {
            label: msg("fields.text", "Text"),
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
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
            type: "basicSelector",
            label: msg("fields.aspectRatio", "Aspect Ratio"),
            options: aspectRatioOptions,
          },
          styles: {
            label: msg("fields.imageStyles", "Image Styles"),
            type: "styledImage",
            transform: true,
          },
        },
      },
    },
  },
} satisfies YextFields<AboutSectionProps>;

const UpscaleRestaurantCss = `
.fb-about-shell * { box-sizing: border-box; }
.fb-about-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-about-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-about-shell .fb-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
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
  line-height: 1.08;
  margin-bottom: 14px;
  text-align: left;
}
.fb-about-text p {
  color: currentColor;
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
  .fb-about-section {
    padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
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

const AboutSection: React.FC<AboutSectionRenderProps> = (props) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
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
    ...props.about.heading.styles,
    textAlign: "left",
    marginBottom: "14px",
    color: resolveSelectedColor(props.about.heading.fontColor),
  };
  const contentStyleOverrides = {
    ...props.about.content.styles,
    color: resolveSelectedColor(props.about.content.fontColor),
  };
  const content = resolveComponentData(
    props.about.content.text,
    locale,
    streamDocument,
    { color: props.about.content.fontColor },
  );
  const image = resolveComponentData(
    props.about.image.image,
    locale,
    streamDocument,
  );
  const currentImage = image ?? props.about.image.image.constantValue;
  const hasImage = hasImageSource(currentImage);
  const imageStyle = {
    ...props.about.image.styles,
    aspectRatio:
      props.about.image.aspectRatio > 0
        ? props.about.image.aspectRatio
        : undefined,
  };

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
                displayName={pt("heading", "Heading")}
                fieldId={props.about.heading.text.field}
                constantValueEnabled={
                  props.about.heading.text.constantValueEnabled
                }
              >
                <h2 style={headingStyle}>{heading}</h2>
              </EntityField>
              <EntityField
                displayName={pt("content", "Content")}
                fieldId={props.about.content.text.field}
                constantValueEnabled={
                  props.about.content.text.constantValueEnabled
                }
              >
                {renderRichText(content, contentStyleOverrides)}
              </EntityField>
            </article>
            {hasImage ? (
              <div className="fb-about-art">
                <EntityField
                  displayName={pt("image", "Image")}
                  fieldId={props.about.image.image.field}
                  constantValueEnabled={
                    props.about.image.image.constantValueEnabled
                  }
                >
                  <div
                    className="fb-about-image"
                    style={{
                      ...imageStyle,
                      overflow: imageStyle.borderRadius ? "hidden" : undefined,
                    }}
                  >
                    <Image
                      image={currentImage}
                      style={{
                        ...imageStyle,
                        display: "block",
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
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

export const UpscaleRestaurantAboutSection: YextComponentConfig<
  AboutSectionProps,
  typeof aboutSectionFields
> =
  {
    label: msg("components.aboutLabel", "About"),
    fields: aboutSectionFields,
    defaultProps,
    // Puck 0.24 deep slot types expand CSS string unions; the runtime CSS is unchanged.
    render: (props) => (
      <AboutSection {...(props as AboutSectionRenderProps)} />
    ),
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantAboutSection",
  displayName: "About",
  description: "About Section",
  pageSetTypes: ["ENTITY"],
};
