import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";

import * as React from "react";
import { useTranslation } from "react-i18next";
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
  VisibilityWrapper,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type ThemeColor,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import {
  getTextStyle,
  hasImageSource,
  makeRtf,
  makeText,
  makeThemeColor,
  renderRichText,
  type StyledRtfProps,
  type StyledTextProps,
} from "../shared/sectionHelpers";

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

const isOpen24h = (params: StatusParams): boolean =>
  params.currentInterval?.is24h?.() || false;

const isIndefinitelyClosed = (params: StatusParams): boolean =>
  !params.futureInterval;

const hoursCurrentTemplateOverride = (
  params: StatusParams,
  t: ReturnType<typeof useTranslation>["t"],
): React.ReactNode => {
  if (params.comingSoon) {
    return (
      <span className="HoursStatus-current">
        {t("comingSoon", "Coming Soon")}
      </span>
    );
  }

  if (isOpen24h(params)) {
    return (
      <span className="HoursStatus-current">
        {t("open24Hours", "Open 24 Hours")}
      </span>
    );
  }

  if (isIndefinitelyClosed(params)) {
    return (
      <span className="HoursStatus-current">
        {t("temporarilyClosed", "Temporarily Closed")}
      </span>
    );
  }

  return (
    <span className="HoursStatus-current">
      {params.isOpen ? t("openNow", "Open Now") : t("closed", "Closed")}
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
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
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
  hero: {
    label: msg("fields.hero", "Hero"),
    type: "object",
    objectFields: {
      image: {
        label: msg("fields.image", "Image"),
        type: "object",
        objectFields: {
          image: {
            label: msg("fields.image", "Image"),
            type: "entityField",
            filter: { types: ["type.image"] },
          },
          styles: {
            label: msg("fields.imageStyles", "Image Styles"),
            type: "styledImage",
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
          text: {
            label: msg("fields.text", "Text"),
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
          },
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      ctas: {
        label: msg("fields.ctas", "CTAs"),
        type: "array",
        arrayFields: {
          cta: {
            label: msg("fields.callToAction", "Call To Action"),
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
    label: msg("fields.hours", "Hours"),
    type: "entityField",
    filter: { types: ["type.hours"] },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: msg("fields.hoursStyles", "Hours Styles"),
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: msg("fields.showCurrentStatus", "Show Current Status"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      timeFormat: {
        label: msg("fields.timeFormat", "Time Format"),
        type: "select",
        options: [
          { label: msg("fields.options.hour12Label", "12 Hour"), value: "12h" },
          { label: msg("fields.options.hour24Label", "24 Hour"), value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: msg("fields.dayOfWeekFormatLabel", "Day Of Week Format"),
        type: "select",
        options: [
          { label: msg("fields.options.short", "Short"), value: "short" },
          { label: msg("fields.options.long", "Long"), value: "long" },
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
  const { t } = useTranslation();
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const timezone = streamDocument.timezone ?? "UTC";
  const heading = resolveComponentData(
    props.hero.heading.text,
    locale,
    streamDocument,
  );
  const headingStyle = getTextStyle(
    props.hero.heading.styles,
    props.hero.heading.fontColor,
    "currentColor",
  );
  const descriptionStyles = {
    ...props.hero.description.styles,
    color: getThemeColorCssValue(props.hero.description.fontColor),
  };
  const description = resolveComponentData(
    props.hero.description.text,
    locale,
    streamDocument,
  );
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
                displayName={pt("image", "Image")}
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
                displayName={pt("heading", "Heading")}
                fieldId={props.hero.heading.text.field}
                constantValueEnabled={
                  props.hero.heading.text.constantValueEnabled
                }
              >
                <h1 style={headingStyle}>{heading}</h1>
              </EntityField>
              <EntityField
                displayName={pt("description", "Description")}
                fieldId={props.hero.description.text.field}
                constantValueEnabled={
                  props.hero.description.text.constantValueEnabled
                }
              >
                <span className="fb-hero-description">
                  {renderRichText(description, descriptionStyles)}
                </span>
              </EntityField>
              <EntityField
                displayName={pt("hours", "Hours")}
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
                        if (params.isOpen) {
                          statusText = dayOfWeek
                            ? t(
                                "closesAtTimeWeek",
                                "Closes at {{time}} {{dayOfWeek}}",
                                { time, dayOfWeek },
                              )
                            : t("closesAtTime", "Closes at {{time}}", { time });
                        } else {
                          statusText = dayOfWeek
                            ? t(
                                "opensAtTimeWeek",
                                "Opens at {{time}} {{dayOfWeek}}",
                                { time, dayOfWeek },
                              )
                            : t("opensAtTime", "Opens at {{time}}", { time });
                        }
                      }

                      return (
                        <div>
                          {(props.hoursStyles.showCurrentStatus || params.comingSoon)
                            ? hoursCurrentTemplateOverride(params, t)
                            : null}
                          {!params.comingSoon && props.hoursStyles.showCurrentStatus
                            ? defaultSeparatorTemplate(params)
                            : null}
                          {!params.comingSoon && statusText ? (
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
                    displayName={pt(
                      "callToActionIndex",
                      "Call To Action {{index}}",
                      { index: index + 1 },
                    )}
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
    label: msg("components.heroSection", "Hero Section"),
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
