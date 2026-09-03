import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  VisibilityWrapper,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { resolveComponentData, useDocument } from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

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

const deliveryPartnersFields: YextFields<DeliveryPartnersSectionProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
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
  ctas: {
    label: "Call To Actions",
    type: "array",
    arrayFields: {
      cta: {
        label: "Call To Action",
        type: "comprehensiveCTA",
      },
    },
    defaultItemProps: {
      cta: makeCta("Order", "#", "primary"),
    },
    getItemSummary: () => "CTA",
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
  padding: 64px 0;
}
.fb-container {
  width: min(1200px, calc(100% - 48px));
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

const DeliveryPartnersSection: PuckComponent<DeliveryPartnersSectionProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const sectionForegroundColor =
    getThemeColorCssValue(
      getDefaultForegroundColor(props.section.backgroundColor, streamDocument),
    ) ?? "currentColor";
  const pageStyle: DeliveryPartnersStyle = {
    "--fb-text": sectionForegroundColor,
    "--fb-muted": sectionForegroundColor,
    "--fb-white-bg":
      getThemeColorCssValue(makeThemeColor("white", "black")) ?? "currentColor",
    "--fb-card-bg":
      getThemeColorCssValue(makeThemeColor("white", "black")) ?? "currentColor",
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
        <style>{UpscaleRestaurantOnlineOrderCss}</style>
        <section className="fb-section">
          <div className="fb-container">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontFamily:
                    props.heading.styles.fontFamily === "default"
                      ? undefined
                      : props.heading.styles.fontFamily,
                  fontSize:
                    props.heading.styles.fontSize === "default"
                      ? undefined
                      : props.heading.styles.fontSize,
                  fontWeight:
                    props.heading.styles.fontWeight === "default"
                      ? undefined
                      : props.heading.styles.fontWeight,
                  fontStyle:
                    props.heading.styles.fontStyle === "default"
                      ? undefined
                      : props.heading.styles.fontStyle,
                  textTransform:
                    props.heading.styles.textTransform === "default"
                      ? undefined
                      : props.heading.styles.textTransform,
                  color:
                    getThemeColorCssValue(props.heading.fontColor) ??
                    sectionForegroundColor,
                }}
              >
                {heading}
              </h2>
            </EntityField>
            <div className="fb-actions">
              {props.ctas.map((item, index) => {
                const ctaValue: Partial<ComprehensiveCTAValue> = {
                  data: item.cta.data,
                  styles: item.cta.styles,
                };

                return <ComprehensiveCTA key={index} value={ctaValue} />;
              })}
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOnlineOrderDeliveryPartnersSection: YextComponentConfig<DeliveryPartnersSectionProps> =
  {
    label: "Delivery Partners Section",
    fields: deliveryPartnersFields,
    defaultProps,
    render: DeliveryPartnersSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderDeliveryPartnersSection",
  displayName: "Delivery Partners Section",
  description: "Delivery Partners Section",
  pageSetTypes: ["ENTITY"],
};
