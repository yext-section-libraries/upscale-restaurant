import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  Address,
  HoursTable,
  type AddressType,
  type HoursType,
} from "@yext/pages-components";
import {
  Background,
  CTA,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  VisibilityWrapper,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StreamDocument,
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

type LinkItemProps = {
  cta: ComprehensiveCTAValue;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: YextEntityField<TranslatableString>;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink: boolean;
};

type TextListProps = {
  text: YextEntityField<TranslatableString[]>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type DetailsSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  details: {
    heading: StyledTextProps;
    addressHeading: StyledTextProps;
    address: YextEntityField<AddressType>;
    showRegion: boolean;
    showCountry: boolean;
    phoneHeading: StyledTextProps;
    phones: PhoneFieldProps;
    links: LinkItemProps[];
    hoursHeading: StyledTextProps;
    hours: YextEntityField<HoursType>;
    hoursStyles: {
      startOfWeek: keyof DayOfWeekNames | "today";
      collapseDays: boolean;
      showAdditionalHoursText: boolean;
    };
    showThirdColumn: boolean;
    thirdColumnHeading: StyledTextProps;
    thirdColumnDetails: TextListProps;
  };
};

type DayOfWeekNames = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  today?: string;
};

type DetailsStyle = React.CSSProperties & Record<`--${string}`, string>;

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

const makeStringField = (value: string): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: value,
  constantValueEnabled: true,
});

const makeTextList = (items: string[]): TextListProps => ({
  text: {
    field: "",
    constantValue: items,
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeTextStyle = (
  text: StyledTextProps,
  sectionBackgroundColor: ThemeColor,
  streamDocument: StreamDocument,
): React.CSSProperties => ({
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
  color:
    getThemeColorCssValue(text.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(sectionBackgroundColor, streamDocument),
    ),
});

const makeTextListStyle = (
  text: TextListProps,
  sectionBackgroundColor: ThemeColor,
  streamDocument: StreamDocument,
): React.CSSProperties => ({
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
  color:
    getThemeColorCssValue(text.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(sectionBackgroundColor, streamDocument),
    ),
});

const makeCta = (label: string, link: string): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        label,
        link,
        normalizeLink: false,
        openInNewTab: false,
        ctaType: label === "Get Directions" ? "getDirections" : "textAndLink",
      },
      constantValueEnabled: true,
    },
    openInNewTab: false,
  },
  styles: {
    variant: "link",
  },
});

const defaultProps: DetailsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "black"),
  },
  details: {
    heading: makeText("Restaurant Details"),
    addressHeading: makeText("Address"),
    address: {
      field: "address",
      constantValue: {
        line1: "",
        line2: "",
        city: "",
        region: "",
        postalCode: "",
        countryCode: "",
      },
      constantValueEnabled: false,
    } satisfies YextEntityField<AddressType>,
    showRegion: true,
    showCountry: false,
    phoneHeading: makeText("Phone"),
    phones: {
      items: [
        {
          number: {
            field: "",
            constantValue: "+1 (512) 555-0148",
            constantValueEnabled: true,
          },
          label: makeStringField(""),
        },
      ],
      phoneFormat: "domestic",
      includeHyperlink: false,
    },
    links: [
      {
        cta: makeCta("Website", "#"),
      },
      { cta: makeCta("Get Directions", "#") },
    ],
    hoursHeading: makeText("Online Ordering Hours"),
    hours: {
      field: "hours",
      constantValue: {},
      constantValueEnabled: false,
    } satisfies YextEntityField<HoursType>,
    hoursStyles: {
      startOfWeek: "monday",
      collapseDays: false,
      showAdditionalHoursText: false,
    },
    showThirdColumn: true,
    thirdColumnHeading: makeText("Order Online Details"),
    thirdColumnDetails: makeTextList([
      "Delivery, pickup, and curbside pickup are available",
      "Free delivery to zip codes 78613, 78617, 78620, 78628, 78641, 78645, 78652, 78701",
      "Typical delivery time: 25 min",
      "Typical pickup wait time: 15 min",
      "Minimum $30 order for delivery",
    ]),
  },
};

const detailsFields: YextFields<DetailsSectionProps> = {
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
  details: {
    label: "Restaurant Details",
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
      addressHeading: {
        label: "Address Heading",
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
      address: {
        label: "Address",
        type: "entityField",
        filter: {
          types: ["type.address"],
        },
      },
      showRegion: {
        label: "Show Region",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showCountry: {
        label: "Show Country",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      phoneHeading: {
        label: "Phone Heading",
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
      phones: {
        label: "Phones",
        type: "object",
        objectFields: {
          items: {
            label: "Items",
            type: "array",
            arrayFields: {
              number: {
                label: "Number",
                type: "entityField",
                filter: { types: ["type.string"] },
              },
              label: {
                label: "Label",
                type: "entityField",
                filter: { types: ["type.string"] },
              },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              },
              label: makeStringField(""),
            },
            getItemSummary: (item: PhoneItemProps) =>
              typeof item.label?.constantValue === "string" &&
              item.label.constantValue.trim()
                ? item.label.constantValue
                : "Phone",
          },
          phoneFormat: {
            label: "Phone Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      links: {
        label: "Links",
        type: "array",
        arrayFields: {
          cta: {
            label: "Call To Action",
            type: "comprehensiveCTA",
          },
        },
        defaultItemProps: {
          cta: makeCta("Link", "#"),
        },
        getItemSummary: () => "CTA",
      },
      hoursHeading: {
        label: "Hours Heading",
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
          startOfWeek: {
            label: "Start Of Week",
            type: "select",
            options: [
              { label: "Monday", value: "monday" },
              { label: "Tuesday", value: "tuesday" },
              { label: "Wednesday", value: "wednesday" },
              { label: "Thursday", value: "thursday" },
              { label: "Friday", value: "friday" },
              { label: "Saturday", value: "saturday" },
              { label: "Sunday", value: "sunday" },
              { label: "Today", value: "today" },
            ],
          },
          collapseDays: {
            label: "Collapse Days",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showAdditionalHoursText: {
            label: "Show Additional Hours Text",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      showThirdColumn: {
        label: "Show Third Column",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      thirdColumnHeading: {
        label: "Third Column Heading",
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
      thirdColumnDetails: {
        label: "Third Column Details",
        type: "object",
        objectFields: {
          text: {
            label: "Text List",
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
            },
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
  width: min(var(--fb-content-width, var(--maxWidth-pageSection-contentWidth)), calc(100% - 48px));
  max-width: 1200px;
  margin: 0 auto;
}
.fb-details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.fb-details-grid.fb-details-grid-three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.fb-panel {
  border-radius: 8px;
  min-width: 0;
  padding: 26px 24px;
}
.fb-panel h3 {
  margin: 28px 0 16px;
  font-size: var(--fontSize-h3-fontSize);
}
.fb-panel h3:first-child { margin-top: 0; }
.fb-panel p {
  margin: 3px 0 0;
  opacity: 0.82;
}
.fb-detail-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0;
  min-width: 0;
}
.fb-hours-shell {
  display: flex;
  min-width: 0;
  max-width: 100%;
}
.fb-hours-scroll {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}
.fb-hours-table {
  min-width: 0;
}
.fb-hours-shell.items-center { justify-content: center; }
.fb-hours-shell.items-end { justify-content: flex-end; }
.fb-hours-shell.items-start { justify-content: flex-start; }
.fb-phone {
  color: var(--fb-text);
  text-decoration: none;
}
.fb-detail-group + .fb-detail-group {
  margin-top: 14px;
}
.fb-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.fb-detail-list li {
  position: relative;
  margin-bottom: 12px;
  padding-left: 24px;
  color: var(--fb-text);
}
.fb-detail-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--fb-list-bullet);
}
@media (max-width: 1100px) {
  .fb-details-grid,
  .fb-details-grid.fb-details-grid-three-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-details-grid,
  .fb-details-grid.fb-details-grid-three-columns {
    grid-template-columns: 1fr;
  }
}
`;

const formatPhoneForDisplay = (
  phoneNumber: string,
  format: PhoneFieldProps["phoneFormat"],
): string => {
  const parsedPhoneNumber = parsePhoneNumber(
    phoneNumber.replace(/(?!^\+)\+|[^\d+]/g, ""),
  );
  if (!parsedPhoneNumber.valid || !parsedPhoneNumber.number) {
    return phoneNumber;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international || phoneNumber
    : parsedPhoneNumber.number.national || phoneNumber;
};

const DetailsSectionComponent: PuckComponent<DetailsSectionProps> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.details.heading.text,
    locale,
    streamDocument,
  );
  const cardBackgroundColor = {
    selectedColor: "[#f6f4ef]",
    contrastingColor: "black",
    isDarkColor: false,
  };
  const sectionHeadingStyle = makeTextStyle(
    props.details.heading,
    props.section.backgroundColor,
    streamDocument,
  );
  const addressHeading = resolveComponentData(
    props.details.addressHeading.text,
    locale,
    streamDocument,
  );
  const addressHeadingStyle = makeTextStyle(
    props.details.addressHeading,
    cardBackgroundColor,
    streamDocument,
  );
  const phoneHeading = resolveComponentData(
    props.details.phoneHeading.text,
    locale,
    streamDocument,
  );
  const phoneHeadingStyle = makeTextStyle(
    props.details.phoneHeading,
    cardBackgroundColor,
    streamDocument,
  );
  const hoursHeading = resolveComponentData(
    props.details.hoursHeading.text,
    locale,
    streamDocument,
  );
  const hoursHeadingStyle = makeTextStyle(
    props.details.hoursHeading,
    cardBackgroundColor,
    streamDocument,
  );
  const thirdColumnHeading = resolveComponentData(
    props.details.thirdColumnHeading.text,
    locale,
    streamDocument,
  );
  const thirdColumnHeadingStyle = makeTextStyle(
    props.details.thirdColumnHeading,
    cardBackgroundColor,
    streamDocument,
  );
  const thirdColumnDetailsStyle = makeTextListStyle(
    props.details.thirdColumnDetails,
    cardBackgroundColor,
    streamDocument,
  );
  const resolvedAddress = resolveComponentData(
    props.details.address,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(
    props.details.hours,
    locale,
    streamDocument,
  );
  const thirdColumnDetails = resolveComponentData(
    props.details.thirdColumnDetails.text,
    locale,
    streamDocument,
  );
  const pageStyle: DetailsStyle = {
    "--fb-card-bg":
      getThemeColorCssValue(cardBackgroundColor) ?? "currentColor",
    "--fb-muted":
      getThemeColorCssValue(
        getDefaultForegroundColor(cardBackgroundColor, streamDocument),
      ) ?? "currentColor",
    "--fb-light":
      getThemeColorCssValue(makeThemeColor("white", "black")) ?? "currentColor",
    "--fb-white-bg":
      getThemeColorCssValue(makeThemeColor("white", "black")) ?? "currentColor",
    "--fb-list-bullet":
      getThemeColorCssValue(
        getDefaultForegroundColor(cardBackgroundColor, streamDocument),
      ) ?? "currentColor",
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
        <section className="fb-section fb-details-section">
          <div className="fb-container">
            <EntityField
              displayName="Heading"
              fieldId={props.details.heading.text.field}
              constantValueEnabled={
                props.details.heading.text.constantValueEnabled
              }
            >
              <h2
                className="fb-details-heading pb-4"
                style={sectionHeadingStyle}
              >
                {heading}
              </h2>
            </EntityField>
            <div
              className={`fb-details-grid${
                props.details.showThirdColumn
                  ? " fb-details-grid-three-columns"
                  : ""
              }`}
            >
              <Background background={cardBackgroundColor} className="fb-panel">
                <div className="fb-detail-group">
                  <EntityField
                    displayName="Address Heading"
                    fieldId={props.details.addressHeading.text.field}
                    constantValueEnabled={
                      props.details.addressHeading.text.constantValueEnabled
                    }
                  >
                    <h3 style={addressHeadingStyle}>{addressHeading}</h3>
                  </EntityField>
                  <Address
                    address={
                      resolvedAddress ?? props.details.address.constantValue
                    }
                    showRegion={props.details.showRegion}
                    showCountry={props.details.showCountry}
                  />
                </div>
                <div className="fb-detail-group">
                  <EntityField
                    displayName="Phone Heading"
                    fieldId={props.details.phoneHeading.text.field}
                    constantValueEnabled={
                      props.details.phoneHeading.text.constantValueEnabled
                    }
                  >
                    <h3 style={phoneHeadingStyle}>{phoneHeading}</h3>
                  </EntityField>
                  {props.details.phones.items.map((phone, index) => {
                    const phoneNumber = resolveComponentData(
                      phone.number,
                      locale,
                      streamDocument,
                    );
                    const phoneLabel = phone.label
                      ? resolveComponentData(phone.label, locale, streamDocument) ?? ""
                      : "";
                    const normalizedNumber = (phoneNumber ?? "").trim();
                    const phoneText = formatPhoneForDisplay(
                      normalizedNumber,
                      props.details.phones.phoneFormat,
                    );

                    if (!props.details.phones.includeHyperlink) {
                      return (
                        <p key={`${phoneText}-${index}`} className="fb-phone">
                          {phoneLabel} {phoneText}
                        </p>
                      );
                    }

                    return (
                      <p
                        key={`${phoneText}-${index}`}
                        className="fb-phone flex"
                      >
                        {phoneLabel}{" "}
                        <CTA
                          link={`tel:${normalizedNumber.replace(/\D/g, "")}`}
                          label={phoneText}
                          linkType="PHONE"
                          normalizeLink={false}
                          variant="link"
                          eventName={"details-phone"}
                          alwaysHideCaret={true}
                        />
                      </p>
                    );
                  })}
                </div>
                <div className="fb-detail-links">
                  {props.details.links.map((link, index) => (
                    <ComprehensiveCTA
                      key={`${link.cta.data.cta.constantValue.label}-${index}`}
                      value={link.cta as Partial<ComprehensiveCTAValue>}
                    />
                  ))}
                </div>
              </Background>
              <Background background={cardBackgroundColor} className="fb-panel">
                <EntityField
                  displayName="Hours Heading"
                  fieldId={props.details.hoursHeading.text.field}
                  constantValueEnabled={
                    props.details.hoursHeading.text.constantValueEnabled
                  }
                >
                  <h3 style={hoursHeadingStyle}>{hoursHeading}</h3>
                </EntityField>
                <div className="fb-hours-shell">
                  <div className="fb-hours-scroll">
                    <HoursTable
                      className="fb-hours-table"
                      hours={resolvedHours ?? props.details.hours.constantValue}
                      comingSoon={streamDocument.comingSoon}
                      startOfWeek={props.details.hoursStyles.startOfWeek}
                      collapseDays={props.details.hoursStyles.collapseDays}
                    />
                  </div>
                </div>
              </Background>
              {props.details.showThirdColumn ? (
                <Background
                  background={cardBackgroundColor}
                  className="fb-panel"
                >
                  <div className="fb-detail-group">
                    <EntityField
                      displayName="Third Column Heading"
                      fieldId={props.details.thirdColumnHeading.text.field}
                      constantValueEnabled={
                        props.details.thirdColumnHeading.text
                          .constantValueEnabled
                      }
                    >
                      <h3 style={thirdColumnHeadingStyle}>
                        {thirdColumnHeading}
                      </h3>
                    </EntityField>
                    <EntityField
                      displayName="Third Column Details"
                      fieldId={props.details.thirdColumnDetails.text.field}
                      constantValueEnabled={
                        props.details.thirdColumnDetails.text
                          .constantValueEnabled
                      }
                    >
                      <ul
                        className="fb-detail-list"
                        style={thirdColumnDetailsStyle}
                      >
                        {thirdColumnDetails?.map((detail, index) => (
                          <li key={`${index}`}>
                            {typeof detail === "string"
                              ? detail
                              : (detail?.defaultValue ?? "")}
                          </li>
                        ))}
                      </ul>
                    </EntityField>
                  </div>
                </Background>
              ) : null}
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOnlineOrderDetailsSection: YextComponentConfig<DetailsSectionProps> =
  {
    label: "Details Section",
    fields: detailsFields,
    defaultProps,
    render: DetailsSectionComponent,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderDetailsSection",
  displayName: "Details Section",
  description: "Details Section",
  pageSetTypes: ["ENTITY"],
};
