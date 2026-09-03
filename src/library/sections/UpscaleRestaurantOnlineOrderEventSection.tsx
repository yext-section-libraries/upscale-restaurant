import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  BackgroundProvider,
  ComprehensiveCTA,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type RichText,
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

type StyledImageProps = {
  image: YextEntityField<ImageType>;
};

type EventSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
  };
  event: {
    image: StyledImageProps;
    heading: StyledTextProps;
    description: StyledRtfProps;
    cta: ComprehensiveCTAValue;
  };
};

type EventStyle = React.CSSProperties & Record<`--${string}`, string>;

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
});

const makeRtf = (text: string): StyledRtfProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: makeRichText(text),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeRichText = (text: string): RichText => {
  const paragraphs = text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const children = paragraphs.map((paragraph) => ({
    children: [
      {
        detail: 0,
        format: 0,
        mode: "normal" as const,
        style: "",
        text: paragraph,
        type: "text" as const,
        version: 1,
      },
    ],
    direction: "ltr" as const,
    format: "",
    indent: 0,
    type: "paragraph" as const,
    version: 1,
  }));

  return {
    html: paragraphs
      .map(
        (paragraph) =>
          `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>${paragraph}</span></p>`,
      )
      .join(""),
    json: JSON.stringify({
      root: {
        children,
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    }),
  };
};

const makeImage = (
  url: string,
  width: number,
  height: number,
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
});

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
};

const defaultProps: EventSectionProps = {
  section: {
    visibleOnLivePage: true,
  },
  event: {
    image: makeImage(
      "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
      1267,
      1900,
      "Event image",
    ),
    heading: makeText("Catering available for groups of all sizes"),
    description: makeRtf(
      "Bring the burger bar to your next event with our new catering service, stacked burgers, crispy fries, and crowd favorites made fresh for groups of any size. Whether it’s a corporate lunch, game day party, or late-night gathering, we handle the food so you can focus on your guests.",
    ),
    cta: {
      data: {
        actionType: "link",
        cta: {
          field: "",
          constantValue: {
            label: "Learn More",
            link: "#",
            openInNewTab: false,
            normalizeLink: false,
          },
          constantValueEnabled: true,
        },
        openInNewTab: false,
      },
      styles: {
        variant: "primary",
        color: makeThemeColor("palette-primary", "palette-primary-contrast"),
      },
    },
  },
};

const eventFields: YextFields<EventSectionProps> = {
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
    },
  },
  event: {
    label: "Event Banner",
    type: "object",
    objectFields: {
      image: {
        label: "Image",
        type: "object",
        objectFields: {
          image: {
            label: "Image",
            type: "entityField",
            filter: { types: ["type.image"] },
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
      description: {
        label: "Description",
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
      cta: {
        label: "Call To Action",
        type: "comprehensiveCTA",
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
.fb-event-banner {
  position: relative;
  height: 560px;
  overflow: hidden;
}
.fb-event-image-frame,
.fb-event-image {
  width: 100%;
  height: 100%;
}
.fb-event-image {
  object-fit: cover;
}
.fb-event-banner::after {
  content: "";
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0.6;
}
.fb-event-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 64px;
  z-index: 1;
  width: min(760px, calc(100% - 48px));
  margin: 0 auto;
  color: var(--fb-light);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.fb-event-overlay h2 {
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
}
.fb-event-description {
  font-size: 16px;
}
.fb-event-cta {
  display: flex;
  justify-content: center;
}
@media (max-width: 760px) {
  .fb-event-banner {
    display: grid;
    position: relative;
    height: auto;
    min-height: 0;
    overflow: visible;
  }
  .fb-event-image-frame,
  .fb-event-image {
    grid-area: 1 / 1;
    align-self: stretch;
    width: 100%;
    height: 100%;
  }
  .fb-event-overlay {
    grid-area: 1 / 1;
    align-self: end;
    position: relative;
    bottom: auto;
    z-index: 1;
    width: 100%;
    box-sizing: border-box;
    padding: 72px 16px;
  }
}
`;

const EventSection: PuckComponent<EventSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.event.heading.text,
    locale,
    streamDocument,
  );
  const headingColor =
    getThemeColorCssValue(props.event.heading.fontColor) ??
    getThemeColorCssValue(makeThemeColor("white", "black"));
  const headingStyle: React.CSSProperties = {
    ...makeTextStyle(props.event.heading),
    color: headingColor,
  };
  const description = resolveComponentData(
    props.event.description.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.event.description.styles,
        color:
          getThemeColorCssValue(props.event.description.fontColor) ??
          getThemeColorCssValue(makeThemeColor("white", "black")),
      },
    },
  );
  const image = resolveComponentData(
    props.event.image.image,
    locale,
    streamDocument,
  );
  const ctaValue: ComprehensiveCTAValue = {
    data: props.event.cta.data,
    styles: props.event.cta.styles,
  };
  const pageStyle: EventStyle = {
    "--fb-light":
      getThemeColorCssValue(makeThemeColor("white", "black")) ??
      "currentColor",
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <div className="fb-page" style={pageStyle}>
        <style>{UpscaleRestaurantOnlineOrderCss}</style>
        <section className="fb-event-banner">
          {hasImageSource(image) ? (
            <Image
              image={image}
              className="fb-event-image-frame fb-event-image"
            />
          ) : null}
          <div className="fb-event-overlay">
            <h2 style={headingStyle}>{heading}</h2>
            <div className="fb-event-description">
              {typeof description === "string" ? (
                <MaybeRTF
                  data={description}
                  richTextStyleOverrides={{
                    ...props.event.description.styles,
                    color:
                      getThemeColorCssValue(props.event.description.fontColor) ??
                      getThemeColorCssValue(makeThemeColor("white", "black")),
                  }}
                />
              ) : React.isValidElement(description) ? (
                description
              ) : null}
            </div>
            <div className="fb-event-cta">
              <BackgroundProvider
                value={{
                  selectedColor: "palette-primary-dark",
                  contrastingColor: "white",
                  isDarkColor: true,
                }}
              >
                <ComprehensiveCTA value={ctaValue} />
              </BackgroundProvider>
            </div>
          </div>
        </section>
      </div>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOnlineOrderEventSection: YextComponentConfig<EventSectionProps> =
  {
    label: "Event Section",
    fields: eventFields,
    defaultProps,
    render: EventSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderEventSection",
  displayName: "Event Section",
  description: "Event Section",
  pageSetTypes: ["ENTITY"],
};
