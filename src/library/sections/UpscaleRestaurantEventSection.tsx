import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";

import * as React from "react";
import type { ImageType } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getSurfaceColorStyle,
  Image,
  VisibilityWrapper,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
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
  resolveSelectedColor,
  type StyledRtfProps,
  type StyledTextProps,
} from "../shared/sectionHelpers";

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

const eventOverlayBackground = makeThemeColor(
  "palette-quaternary",
  "palette-quaternary-contrast",
);

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

const defaultProps: EventSectionProps = {
  section: {
    visibleOnLivePage: true,
  },
  event: {
    image: makeImage(
      "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
      1267,
      1900,
      "Event image",
    ),
    heading: makeText("Host Your Next Group Event at [[name]]"),
    description: makeRtf(
      "Planning a birthday dinner, team happy hour, or weekend gathering in [[address.city]]? [[name]] makes group dining easy.\n\nIndoor + patio seating available\nCustomizable food & cocktail packages\nConvenient onsite parking in [[geomodifier]] [[address.city]]\nFlexible group size accommodations from 10-150 guests",
    ),
    cta: {
      data: {
        actionType: "link",
        cta: {
          field: "",
          constantValue: {
            label: "Plan your event",
            link: "/group-events",
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
    },
  },
  event: {
    label: msg("fields.eventBanner", "Event Banner"),
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
      cta: {
        label: msg("fields.callToAction", "Call To Action"),
        type: "comprehensiveCTA",
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-event-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-event-shell * { box-sizing: border-box; }
.fb-event-shell p,
.fb-event-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-event-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-event-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-event-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-event-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-event-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-event-shell h6 {
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
  padding: 24px 32px;
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
    resolveSelectedColor(props.event.heading.fontColor) ?? "currentColor";
  const headingStyle: React.CSSProperties = {
    ...getTextStyle(props.event.heading.styles),
    color: headingColor,
  };
  const descriptionStyles = {
    ...props.event.description.styles,
    color: resolveSelectedColor(props.event.description.fontColor),
  };
  const description = resolveComponentData(
    props.event.description.text,
    locale,
    streamDocument,
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
  const overlaySurfaceStyle = getSurfaceColorStyle(
    eventOverlayBackground,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <div className="fb-event-shell">
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-event-banner">
          {hasImageSource(image) ? (
            <EntityField
              displayName={pt("image", "Image")}
              fieldId={props.event.image.image.field}
              constantValueEnabled={
                props.event.image.image.constantValueEnabled
              }
            >
              <Image
                image={image}
                className="fb-event-image-frame fb-event-image"
              />
            </EntityField>
          ) : null}
          <Background
            background={eventOverlayBackground}
            className="fb-event-overlay"
            style={overlaySurfaceStyle}
          >
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.event.heading.text.field}
              constantValueEnabled={
                props.event.heading.text.constantValueEnabled
              }
            >
              <h2 style={headingStyle}>{heading}</h2>
            </EntityField>
            <EntityField
              displayName={pt("description", "Description")}
              fieldId={props.event.description.text.field}
              constantValueEnabled={
                props.event.description.text.constantValueEnabled
              }
            >
              <div className="fb-event-description">
                {renderRichText(description, descriptionStyles)}
              </div>
            </EntityField>
            <div className="fb-event-cta">
              <Background background={eventOverlayBackground}>
                <EntityField
                  displayName={pt("callToAction", "Call To Action")}
                  fieldId={props.event.cta.data.cta.field}
                  constantValueEnabled={
                    props.event.cta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA value={ctaValue} />
                </EntityField>
              </Background>
            </div>
          </Background>
        </section>
      </div>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantEventSection: YextComponentConfig<EventSectionProps> =
  {
    label: msg("components.eventSection", "Event Section"),
    fields: eventFields,
    defaultProps,
    render: EventSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantEventSection",
  displayName: "Event Section",
  description: "Event Section",
  pageSetTypes: ["ENTITY"],
};
