import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  HoursStatus,
  type HoursType,
  type ImageType,
  type StatusParams,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  VisibilityWrapper,
  getDefaultRTF,
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

type StyledImageProps = {
  image: YextEntityField<ImageType>;
  styles: StyledImageValue;
};

type HeroCtaValue = {
  data: {
    actionType: "link";
    cta: {
      field: string;
      constantValue: {
        label: string;
        link: string;
        openInNewTab: boolean;
        normalizeLink: boolean;
      };
      constantValueEnabled: boolean;
    };
    openInNewTab: boolean;
  };
  styles: {
    variant: "primary" | "secondary" | "link";
    color: ThemeColor | undefined;
  };
};

type HeroSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  hero: {
    image: StyledImageProps;
    heading: StyledTextProps;
    description: StyledRtfProps;
    ctas: {
      cta: HeroCtaValue;
    }[];
  };
  hours: YextEntityField<HoursType>;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
  };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const makeText = (text: string, field = ""): StyledTextProps => ({
  text: {
    field,
    constantValue: text,
    constantValueEnabled: field === "",
  },
  styles: defaultTextStyles,
  fontColor: undefined,
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
  styles: {
    borderRadius: "default",
  },
});

const hasImageSource = (image: unknown): image is ImageType => {
  if (!image || typeof image !== "object") {
    return false;
  }

  const url = (image as { url?: unknown }).url;
  return typeof url === "string" && url.trim().length > 0;
};

const makeCta = (
  label: string,
  link: string,
  variant: "primary" | "secondary" | "link",
): HeroCtaValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label,
        link,
        openInNewTab: false,
        normalizeLink: false,
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
  },
  styles: {
    variant,
    color: undefined,
  },
});

const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

const isOpen24h = (params: StatusParams): boolean =>
  params.currentInterval?.is24h?.() || false;

const isIndefinitelyClosed = (params: StatusParams): boolean =>
  !params.futureInterval;

const hoursCurrentTemplateOverride = (
  params: StatusParams,
): React.ReactNode => {
  if (isOpen24h(params)) {
    return <span className="HoursStatus-current">Open 24 Hours</span>;
  }

  if (isIndefinitelyClosed(params)) {
    return <span className="HoursStatus-current">Temporarily Closed</span>;
  }

  return (
    <span className="HoursStatus-current">
      {params.isOpen ? "Open Now" : "Closed"}
    </span>
  );
};

const defaultSeparatorTemplate = (params: StatusParams): React.ReactNode => {
  if (isOpen24h(params) || isIndefinitelyClosed(params)) {
    return null;
  }

  return <span className="HoursStatus-separator"> • </span>;
};

const defaultProps: HeroSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("palette-primary-dark", "white"),
    cardBackgroundColor: makeThemeColor("white", "black"),
  },
  hero: {
    image: makeImage(
      "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
      1900,
      1267,
      "Hero image",
    ),
    heading: makeText("[[name]]", "name"),
    description: makeRtf(
      "[[name]] is an upscale burger restaurant located in [[address.city]], [[address.region]]. They offer dine-in, takeout, delivery, and curbside pickup options. The location serves lunch, dinner, and brunch, with happy hour available on weekdays.",
    ),
    ctas: [
      { cta: makeCta("Call Ahead", "#", "primary") },
      { cta: makeCta("Order Online", "#", "secondary") },
      { cta: makeCta("View Menu", "#", "link") },
    ],
  },
  hours: {
    field: "hours",
    constantValue: {},
    constantValueEnabled: false,
  },
  hoursStyles: {
    showCurrentStatus: true,
    timeFormat: "12h",
    dayOfWeekFormat: "short",
  },
};

const heroFields: YextFields<HeroSectionProps> = {
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
  hero: {
    label: "Hero",
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
          styles: {
            label: "Image Styles",
            type: "styledImage",
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
      ctas: {
        label: "CTAs",
        type: "array",
        arrayFields: {
          cta: {
            label: "Call To Action",
            type: "comprehensiveCTA",
          },
        },
        defaultItemProps: {
          cta: makeCta("CTA", "#", "primary"),
        },
        getItemSummary: () => "CTA",
      },
    },
  },
  hours: {
    label: "Hours",
    type: "entityField",
    filter: { types: ["type.hours"] },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: "Show Current Status",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      timeFormat: {
        label: "Time Format",
        type: "select",
        options: [
          { label: "12 Hour", value: "12h" },
          { label: "24 Hour", value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: "Day Of Week Format",
        type: "select",
        options: [
          { label: "Short", value: "short" },
          { label: "Long", value: "long" },
        ],
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-hero-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-hero-shell * { box-sizing: border-box; }
.fb-hero-shell p,
.fb-hero-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-hero-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-hero-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-hero-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-hero-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-hero-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-hero-shell h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.fb-hero {
  min-height: 660px;
  position: relative;
}
.fb-hero-image-frame,
.fb-hero-image {
  width: 100%;
  height: 660px;
}
.fb-hero-image-frame {
  overflow: hidden;
}
.fb-hero-image {
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  display: block;
}
.fb-hero-card {
  position: absolute;
  left: 0;
  bottom: 50px;
  z-index: 5;
  width: min(720px, calc(100% - 56px));
  padding: 24px 26px;
  border-radius: 0 8px 8px 0;
}
.fb-hero-card h1 {
  line-height: 1.18;
  margin: 0;
}
.fb-hero-description {
  margin: 6px 0 0;
}
.fb-hero-meta {
  padding-top: 8px;
  margin: 0;
}
.fb-open-now {
  color: var(--fb-open-now);
  font-weight: 700;
}
.fb-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.fb-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
}
@media (max-width: 760px) {
  .fb-hero,
  .fb-hero-image,
  .fb-hero-image-frame {
    height: auto;
    min-height: 0;
  }
  .fb-hero {
    display: grid;
    position: relative;
    overflow: visible;
  }
  .fb-hero-image-frame,
  .fb-hero-image {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
  }
  .fb-hero-card {
    grid-area: 1 / 1;
    align-self: end;
    position: relative;
    bottom: auto;
    z-index: 5;
    width: 100%;
    padding: 16px;
    border-radius: 0;
  }
  .fb-hero-actions .fb-pill {
    width: 100%;
  }
}
.fb-hero-no-image {
  min-height: 0;
}
.fb-hero-no-image .fb-hero-card {
  position: relative;
  left: auto;
  bottom: auto;
  width: 100%;
  max-width: none;
  border-radius: 8px;
}
`;

const HeroSection: PuckComponent<HeroSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const timezone = streamDocument.timezone ?? "UTC";
  const heading = resolveComponentData(
    props.hero.heading.text,
    locale,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    fontFamily:
      props.hero.heading.styles.fontFamily === "default"
        ? undefined
        : props.hero.heading.styles.fontFamily,
    fontSize:
      props.hero.heading.styles.fontSize === "default"
        ? undefined
        : props.hero.heading.styles.fontSize,
    fontWeight:
      props.hero.heading.styles.fontWeight === "default"
        ? undefined
        : props.hero.heading.styles.fontWeight,
    fontStyle:
      props.hero.heading.styles.fontStyle === "default"
        ? undefined
        : props.hero.heading.styles.fontStyle,
    textTransform:
      props.hero.heading.styles.textTransform === "default"
        ? undefined
        : props.hero.heading.styles.textTransform,
    color:
      getThemeColorCssValue(props.hero.heading.fontColor) ?? "currentColor",
  };
  const descriptionStyles = {
    ...props.hero.description.styles,
    color: getThemeColorCssValue(props.hero.description.fontColor),
  };
  const description = resolveComponentData(
    props.hero.description.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: descriptionStyles,
    },
  );
  const descriptionText =
    typeof description === "string" ? description : undefined;
  const image = resolveComponentData(
    props.hero.image.image,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  );
  const displayHours = resolvedHours ?? props.hours.constantValue;
  const hasHeroImage = hasImageSource(image);

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-hero-shell"
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <header className="fb-site-header">
          <section
            className={hasHeroImage ? "fb-hero" : "fb-hero fb-hero-no-image"}
          >
            {hasImageSource(image) ? (
              <EntityField
                displayName="Image"
                fieldId={props.hero.image.image.field}
                constantValueEnabled={
                  props.hero.image.image.constantValueEnabled
                }
              >
                <div className="fb-hero-image-frame">
                  <Image
                    image={image}
                    className="fb-hero-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </EntityField>
            ) : null}
            <Background
              background={props.section.cardBackgroundColor}
              className="fb-hero-card"
            >
              <EntityField
                displayName="Heading"
                fieldId={props.hero.heading.text.field}
                constantValueEnabled={
                  props.hero.heading.text.constantValueEnabled
                }
              >
                <h1 style={headingStyle}>{heading}</h1>
              </EntityField>
              <EntityField
                displayName="Description"
                fieldId={props.hero.description.text.field}
                constantValueEnabled={
                  props.hero.description.text.constantValueEnabled
                }
              >
                <span className="fb-hero-description">
                  {descriptionText ? (
                    <MaybeRTF
                      data={descriptionText}
                      richTextStyleOverrides={descriptionStyles}
                    />
                  ) : React.isValidElement(description) ? (
                    description
                  ) : null}
                </span>
              </EntityField>
              <EntityField
                displayName="Hours"
                fieldId={props.hours.field}
                constantValueEnabled={props.hours.constantValueEnabled}
              >
                <p className="fb-hero-meta">
                  <HoursStatus
                    hours={displayHours}
                    timezone={timezone}
                    comingSoon={streamDocument.comingSoon}
                    dayOptions={{ weekday: props.hoursStyles.dayOfWeekFormat }}
                    timeOptions={{
                      hour12: props.hoursStyles.timeFormat === "12h",
                    }}
                    statusTemplate={(params: StatusParams) => {
                      const interval = params.isOpen
                        ? params.currentInterval
                        : params.futureInterval;
                      const time = params.isOpen
                        ? (interval?.getEndTime(locale, params.timeOptions) ??
                          "")
                        : (interval?.getStartTime(locale, params.timeOptions) ??
                          "");
                      const showDayOfWeek =
                        !isOpen24h(params) && !isIndefinitelyClosed(params);
                      const dayOfWeek = showDayOfWeek
                        ? params.isOpen
                          ? (interval?.end
                              ?.setLocale(locale)
                              .toLocaleString(params.dayOptions) ?? "")
                          : (interval?.start
                              ?.setLocale(locale)
                              .toLocaleString(params.dayOptions) ?? "")
                        : "";

                      let statusText = "";
                      if (!isOpen24h(params) && !isIndefinitelyClosed(params)) {
                        statusText = params.isOpen
                          ? dayOfWeek
                            ? `Closes at ${time} ${dayOfWeek}`
                            : `Closes at ${time}`
                          : dayOfWeek
                            ? `Opens at ${time} ${dayOfWeek}`
                            : `Opens at ${time}`;
                      }

                      return (
                        <div>
                          {props.hoursStyles.showCurrentStatus
                            ? hoursCurrentTemplateOverride(params)
                            : null}
                          {props.hoursStyles.showCurrentStatus
                            ? defaultSeparatorTemplate(params)
                            : null}
                          {statusText ? (
                            <span className="HoursStatus-future">
                              {statusText}
                            </span>
                          ) : null}
                        </div>
                      );
                    }}
                  />
                </p>
              </EntityField>
              <div className="fb-hero-actions">
                {props.hero.ctas.map((cta, index) => (
                  <EntityField
                    key={index}
                    displayName={`Call To Action ${index + 1}`}
                    fieldId={cta.cta.data.cta.field}
                    constantValueEnabled={cta.cta.data.cta.constantValueEnabled}
                  >
                    <ComprehensiveCTA value={cta.cta} className="fb-pill" />
                  </EntityField>
                ))}
              </div>
            </Background>
          </section>
        </header>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantHeroSection: YextComponentConfig<HeroSectionProps> =
  {
    label: "Hero Section",
    fields: heroFields,
    defaultProps,
    render: HeroSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantHeroSection",
  displayName: "Hero Section",
  description: "Hero Section",
  pageSetTypes: ["ENTITY"],
};
