import "../shared/typography.css";
import {
  resolveSelectedColor,
  makeText,
  makeThemeColor,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { msg, pt } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  VisibilityWrapper,
  getDefaultForegroundColor,
  type ComprehensiveCTAValue,
  type ThemeColor,
  type YextComponentConfig,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { resolveComponentData, useDocument } from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

type DeliveryPartnersSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  ctas: {
    cta: ComprehensiveCTAValue;
  }[];
};

type DeliveryPartnersStyle = React.CSSProperties &
  Record<`--${string}`, string>;

const makeCta = (
  label: string,
  link: string,
  variant: "primary" | "secondary" | "link",
): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label,
        link,
        openInNewTab: false,
        normalizeLink: false,
        ctaType: "presetImage",
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
  },
  styles: {
    presetImage: label.includes("DoorDash")
      ? label.includes("Uber")
        ? "uber-eats"
        : "grubhub"
      : "doordash",
    variant,
    color:
      variant === "primary"
        ? makeThemeColor("palette-primary", "palette-primary-contrast")
        : variant === "secondary"
          ? makeThemeColor("palette-secondary", "palette-secondary-contrast")
          : undefined,
  },
});

const defaultProps: DeliveryPartnersSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor(
      "palette-tertiary",
      "palette-tertiary-contrast",
    ),
  },
  heading: makeText("Order delivery from our delivery partners"),
  ctas: [
    { cta: makeCta("Order on DoorDash", "#", "primary") },
    { cta: makeCta("Order on Uber Eats", "#", "secondary") },
    { cta: makeCta("Order on Grubhub", "#", "link") },
  ],
};

type DeliveryPartnersSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<DeliveryPartnersSectionProps, typeof deliveryPartnersFields>>
>;

const deliveryPartnersFields = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
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
  ctas: {
    label: msg("fields.callToActions", "Call To Actions"),
    type: "array",
    arrayFields: {
      cta: {
        label: msg("fields.callToAction", "Call To Action"),
        type: "comprehensiveCTA",
        transform: true,
      },
    },
    defaultItemProps: {
      cta: makeCta("Order", "#", "primary"),
    },
    getItemSummary: () => "CTA",
  },
} satisfies YextFields<DeliveryPartnersSectionProps>;

const UpscaleRestaurantCss = `
.fb-page * { box-sizing: border-box; }
.fb-page .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-page .fb-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
  margin: 0 auto;
}
.fb-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 22px;
}
@media (max-width: 760px) {
  .fb-page h2 {
    text-align: left;
  }
}
`;

const DeliveryPartnersSection: React.FC<DeliveryPartnersSectionRenderProps> = (props) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const heading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const sectionForegroundColor =
    resolveSelectedColor(
      getDefaultForegroundColor(props.section.backgroundColor, streamDocument),
    ) ?? "currentColor";
  const pageStyle: DeliveryPartnersStyle = {
    "--fb-text": sectionForegroundColor,
    "--fb-muted": sectionForegroundColor,
    "--fb-white-bg":
      resolveSelectedColor(makeThemeColor("white", "black")) ?? "currentColor",
    "--fb-card-bg":
      resolveSelectedColor(makeThemeColor("white", "black")) ?? "currentColor",
    "--fb-primary": "var(--colors-palette-primary)",
    "--fb-secondary": "var(--colors-palette-secondary)",
    "--fb-tertiary": "var(--colors-palette-tertiary)",
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
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section">
          <div className="fb-container">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                style={{
                  textAlign: "center",
                  ...props.heading.styles,
                  color:
                    resolveSelectedColor(props.heading.fontColor) ??
                    sectionForegroundColor,
                }}
              >
                {heading}
              </h2>
            </EntityField>
            <div className="fb-actions">
              {props.ctas.map((item, index) => (
                <ComprehensiveCTA key={index} value={item.cta} />
              ))}
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantDeliveryPartnersSection: YextComponentConfig<
  DeliveryPartnersSectionProps,
  typeof deliveryPartnersFields
> =
  {
    label: msg("components.deliveryPartnersLabel", "Delivery Partners Section"),
    fields: deliveryPartnersFields,
    defaultProps,
    render: (props) => (
      <DeliveryPartnersSection {...(props as DeliveryPartnersSectionRenderProps)} />
    ),
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantDeliveryPartnersSection",
  displayName: "Delivery Partners Section",
  description: "Delivery Partners Section",
  pageSetTypes: ["ENTITY"],
};
