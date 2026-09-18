import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  Address,
  HoursTable,
  type AddressType,
  type HoursTableIntervalTranslations,
  type HoursType,
} from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import {
  Background,
  CTA,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  VisibilityWrapper,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  msg,
  pt,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import {
  defaultTextStyles,
  getTextStyle,
  makeText,
  makeThemeColor,
  type StyledTextProps,
} from "../shared/sectionHelpers";

type LinkItemProps = {
  cta: ComprehensiveCTAValue;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: TranslatableString;
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
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  details: {
    heading: StyledTextProps;
    addressHeading: StyledTextProps;
    address: YextEntityField<AddressType>;
    showRegion: boolean;
    showCountry: boolean;
    phoneHeading: StyledTextProps;
    phones: PhoneFieldProps;
    showOtherDetails: boolean;
    otherHeading: StyledTextProps;
    otherDetails: TextListProps;
    links: LinkItemProps[];
    hoursHeading: StyledTextProps;
    hours: YextEntityField<HoursType>;
    hoursStyles: {
      startOfWeek: keyof DayOfWeekNames | "today";
      collapseDays: boolean;
      showAdditionalHoursText: boolean;
    };
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

const makeTextList = (items: string[]): TextListProps => ({
  text: {
    field: "",
    constantValue: items,
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeTextStyle = (text: StyledTextProps): React.CSSProperties =>
  getTextStyle(text.styles, text.fontColor);

const makeTextListStyle = (text: TextListProps): React.CSSProperties =>
  getTextStyle(text.styles, text.fontColor);

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
    cardBackgroundColor: makeThemeColor("[#f6f4ef]", "black"),
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
            constantValue: "(512) 555-0148",
            constantValueEnabled: true,
          },
          label: "",
        },
      ],
      phoneFormat: "domestic",
      includeHyperlink: false,
    },
    showOtherDetails: true,
    otherHeading: makeText("Other Details"),
    otherDetails: makeTextList([
      "Price range: $$",
      "Cuisine: Burgers, American",
      "Meals served: Lunch, Dinner, Brunch",
    ]),
    links: [
      {
        cta: makeCta("Website", "#"),
      },
      { cta: makeCta("Get Directions", "#") },
    ],
    hoursHeading: makeText("Dining Hours"),
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
  },
};

const detailsFields: YextFields<DetailsSectionProps> = {
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
      cardBackgroundColor: {
        label: msg("fields.cardBackgroundColor", "Card Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  details: {
    label: msg("fields.restaurantDetails", "Restaurant Details"),
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
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      addressHeading: {
        label: msg("fields.addressHeading", "Address Heading"),
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
      address: {
        label: msg("fields.address", "Address"),
        type: "entityField",
        filter: {
          types: ["type.address"],
        },
      },
      showRegion: {
        label: msg("fields.showRegion", "Show Region"),
        type: "radio",
        options: [
          { label: msg("fields.yes", "Yes"), value: true },
          { label: msg("fields.no", "No"), value: false },
        ],
      },
      showCountry: {
        label: msg("fields.showCountry", "Show Country"),
        type: "radio",
        options: [
          { label: msg("fields.yes", "Yes"), value: true },
          { label: msg("fields.no", "No"), value: false },
        ],
      },
      phoneHeading: {
        label: msg("fields.phoneHeading", "Phone Heading"),
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
      phones: {
        label: msg("fields.phones", "Phones"),
        type: "object",
        objectFields: {
          items: {
            label: msg("fields.items", "Items"),
            type: "array",
            arrayFields: {
              number: {
                label: msg("fields.number", "Number"),
                type: "entityField",
                filter: { types: ["type.phone"] },
              },
              label: { label: msg("fields.label", "Label"), type: "translatableString" },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              },
              label: "",
            },
            getItemSummary: (item: PhoneItemProps) =>
              typeof item.label === "string"
                ? item.label || "Phone"
                : item.label?.defaultValue || "Phone",
          },
          phoneFormat: {
            label: msg("fields.phoneFormat", "Phone Format"),
            type: "radio",
            options: [
              { label: msg("fields.domestic", "Domestic"), value: "domestic" },
              { label: msg("fields.international", "International"), value: "international" },
            ],
          },
          includeHyperlink: {
            label: msg("fields.includeHyperlink", "Include Hyperlink"),
            type: "radio",
            options: [
              { label: msg("fields.yes", "Yes"), value: true },
              { label: msg("fields.no", "No"), value: false },
            ],
          },
        },
      },
      otherHeading: {
        label: msg("fields.otherHeading", "Other Heading"),
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
      showOtherDetails: {
        label: msg("fields.showOtherDetails", "Show Other Details"),
        type: "radio",
        options: [
          { label: msg("fields.yes", "Yes"), value: true },
          { label: msg("fields.no", "No"), value: false },
        ],
      },
      otherDetails: {
        label: msg("fields.otherDetails", "Other Details"),
        type: "object",
        objectFields: {
          text: {
            label: msg("fields.textList", "Text List"),
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
            },
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
      links: {
        label: msg("fields.links", "Links"),
        type: "array",
        arrayFields: {
          cta: {
            label: msg("fields.callToAction", "Call To Action"),
            type: "comprehensiveCTA",
          },
        },
        defaultItemProps: {
          cta: makeCta("Link", "#"),
        },
        getItemSummary: () => "CTA",
      },
      hoursHeading: {
        label: msg("fields.hoursHeading", "Hours Heading"),
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
          startOfWeek: {
            label: msg("fields.startOfWeek", "Start Of Week"),
            type: "select",
            options: [
              { label: msg("fields.monday", "Monday"), value: "monday" },
              { label: msg("fields.tuesday", "Tuesday"), value: "tuesday" },
              { label: msg("fields.wednesday", "Wednesday"), value: "wednesday" },
              { label: msg("fields.thursday", "Thursday"), value: "thursday" },
              { label: msg("fields.friday", "Friday"), value: "friday" },
              { label: msg("fields.saturday", "Saturday"), value: "saturday" },
              { label: msg("fields.sunday", "Sunday"), value: "sunday" },
              { label: msg("fields.today", "Today"), value: "today" },
            ],
          },
          collapseDays: {
            label: msg("fields.collapseDays", "Collapse Days"),
            type: "radio",
            options: [
              { label: msg("fields.yes", "Yes"), value: true },
              { label: msg("fields.no", "No"), value: false },
            ],
          },
          showAdditionalHoursText: {
            label: msg("fields.showAdditionalHoursText", "Show Additional Hours Text"),
            type: "radio",
            options: [
              { label: msg("fields.yes", "Yes"), value: true },
              { label: msg("fields.no", "No"), value: false },
            ],
          },
        },
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-details-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-details-shell * { box-sizing: border-box; }
.fb-details-shell p,
.fb-details-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-details-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-details-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-details-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-details-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-details-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-details-shell h6 {
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
  width: 100%;
  justify-content: flex-end;
}
.fb-hours-scroll {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}
.fb-hours-table {
  min-width: 0;
  width: 100%;
}
.fb-hours-table .HoursTable-row {
  width: 100%;
}
.fb-hours-table .HoursTable-intervals {
  flex: 1 1 auto;
  align-items: flex-end;
  text-align: right;
}
.fb-hours-note {
  margin-top: 22px !important;
  text-align: right;
}
.fb-phone {
  color: currentColor;
  text-decoration: none;
}
.fb-detail-group + .fb-detail-group {
  margin-top: 14px;
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-details-grid {
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
  const { t, i18n } = useTranslation();
  const dayOfWeekNames = React.useMemo<DayOfWeekNames>(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      timeZone: "UTC",
      weekday: "long",
    });
    const formatWeekday = (day: number) =>
      formatter.format(new Date(Date.UTC(2024, 0, day)));

    return {
      sunday: formatWeekday(7),
      monday: formatWeekday(8),
      tuesday: formatWeekday(9),
      wednesday: formatWeekday(10),
      thursday: formatWeekday(11),
      friday: formatWeekday(12),
      saturday: formatWeekday(13),
    };
  }, [i18n.language]);
  const intervalTranslations: HoursTableIntervalTranslations = {
    isClosed: t("closed", "Closed"),
    open24Hours: t("open24Hours", "Open 24 Hours"),
    reopenDate: t("reopenDate", "Reopen Date"),
    timeFormatLocale: i18n.language,
  };
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const heading = resolveComponentData(
    props.details.heading.text,
    locale,
    streamDocument,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionHeadingStyle = makeTextStyle(props.details.heading);
  const addressHeading = resolveComponentData(
    props.details.addressHeading.text,
    locale,
    streamDocument,
  );
  const addressHeadingStyle = makeTextStyle(props.details.addressHeading);
  const phoneHeading = resolveComponentData(
    props.details.phoneHeading.text,
    locale,
    streamDocument,
  );
  const phoneHeadingStyle = makeTextStyle(props.details.phoneHeading);
  const otherHeading = resolveComponentData(
    props.details.otherHeading.text,
    locale,
    streamDocument,
  );
  const otherHeadingStyle = makeTextStyle(props.details.otherHeading);
  const otherDetailsStyle = makeTextListStyle(props.details.otherDetails);
  const hoursHeading = resolveComponentData(
    props.details.hoursHeading.text,
    locale,
    streamDocument,
  );
  const hoursHeadingStyle = makeTextStyle(props.details.hoursHeading);
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
  const otherDetails = resolveComponentData(
    props.details.otherDetails.text,
    locale,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-details-shell"
        style={sectionSurfaceStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-details-section">
          <div className="fb-container">
            <EntityField
              displayName={pt("heading", "Heading")}
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
            <div className="fb-details-grid">
              <Background
                background={props.section.cardBackgroundColor}
                className="fb-panel"
              >
                <div className="fb-detail-group">
                  <EntityField
                    displayName={pt("addressHeading", "Address Heading")}
                    fieldId={props.details.addressHeading.text.field}
                    constantValueEnabled={
                      props.details.addressHeading.text.constantValueEnabled
                    }
                  >
                    <h3 style={addressHeadingStyle}>{addressHeading}</h3>
                  </EntityField>
                  <EntityField
                    displayName={pt("address", "Address")}
                    fieldId={props.details.address.field}
                    constantValueEnabled={
                      props.details.address.constantValueEnabled
                    }
                  >
                    <Address
                      address={
                        resolvedAddress ?? props.details.address.constantValue
                      }
                      showRegion={props.details.showRegion}
                      showCountry={props.details.showCountry}
                    />
                  </EntityField>
                </div>
                <div className="fb-detail-group">
                  <EntityField
                    displayName={pt("phoneHeading", "Phone Heading")}
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
                    const phoneLabel =
                      typeof phone.label === "string"
                        ? phone.label
                        : phone.label
                          ? resolveComponentData(
                              phone.label,
                              locale,
                              streamDocument,
                            )
                          : "";
                    const normalizedNumber = (phoneNumber ?? "").trim();
                    const phoneText = formatPhoneForDisplay(
                      normalizedNumber,
                      props.details.phones.phoneFormat,
                    );

                    if (!props.details.phones.includeHyperlink) {
                      return (
                        <EntityField
                          key={`${phoneText}-${index}`}
                          displayName={pt("phoneIndex", "Phone {{index}}", {
                            index: index + 1,
                          })}
                          fieldId={phone.number.field}
                          constantValueEnabled={
                            phone.number.constantValueEnabled
                          }
                        >
                          <p className="fb-phone">
                            {phoneLabel} {phoneText}
                          </p>
                        </EntityField>
                      );
                    }

                    return (
                      <EntityField
                        key={`${phoneText}-${index}`}
                        displayName={pt("phoneIndex", "Phone {{index}}", {
                          index: index + 1,
                        })}
                        fieldId={phone.number.field}
                        constantValueEnabled={phone.number.constantValueEnabled}
                      >
                        <p className="fb-phone flex">
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
                      </EntityField>
                    );
                  })}
                </div>
                {props.details.showOtherDetails ? (
                  <div className="fb-detail-group">
                    <EntityField
                      displayName={pt("otherHeading", "Other Heading")}
                      fieldId={props.details.otherHeading.text.field}
                      constantValueEnabled={
                        props.details.otherHeading.text.constantValueEnabled
                      }
                    >
                      <h3 style={otherHeadingStyle}>{otherHeading}</h3>
                    </EntityField>
                  </div>
                ) : null}
                <div className="fb-detail-links">
                  {props.details.links.map((link, index) => (
                    <EntityField
                      key={`${link.cta.data.cta.constantValue.label}-${index}`}
                      displayName={pt("linkIndex", "Link {{index}}", {
                        index: index + 1,
                      })}
                      fieldId={link.cta.data.cta.field}
                      constantValueEnabled={
                        link.cta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={link.cta as Partial<ComprehensiveCTAValue>}
                      />
                    </EntityField>
                  ))}
                </div>
                {props.details.showOtherDetails ? (
                  <EntityField
                    displayName={pt("otherDetails", "Other Details")}
                    fieldId={props.details.otherDetails.text.field}
                    constantValueEnabled={
                      props.details.otherDetails.text.constantValueEnabled
                    }
                  >
                    <div className="fb-detail-list">
                      {otherDetails?.map((detail, index) => (
                        <p key={`${index}`} style={otherDetailsStyle}>
                          {typeof detail === "string"
                            ? detail
                            : (detail?.defaultValue ?? "")}
                        </p>
                      ))}
                    </div>
                  </EntityField>
                ) : null}
              </Background>
              <Background
                background={props.section.cardBackgroundColor}
                className="fb-panel"
              >
                <EntityField
                  displayName={pt("hoursHeading", "Hours Heading")}
                  fieldId={props.details.hoursHeading.text.field}
                  constantValueEnabled={
                    props.details.hoursHeading.text.constantValueEnabled
                  }
                >
                  <h3 style={hoursHeadingStyle}>{hoursHeading}</h3>
                </EntityField>
                <EntityField
                  displayName={pt("hours", "Hours")}
                  fieldId={props.details.hours.field}
                  constantValueEnabled={
                    props.details.hours.constantValueEnabled
                  }
                >
                  <div className="fb-hours-shell">
                    <div className="fb-hours-scroll">
                      <HoursTable
                        className="fb-hours-table"
                        hours={
                          resolvedHours ?? props.details.hours.constantValue
                        }
                        comingSoon={streamDocument.comingSoon}
                        dayOfWeekNames={dayOfWeekNames}
                        startOfWeek={props.details.hoursStyles.startOfWeek}
                        collapseDays={props.details.hoursStyles.collapseDays}
                        intervalTranslations={intervalTranslations}
                      />
                    </div>
                  </div>
                </EntityField>
              </Background>
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantDetailsSection: YextComponentConfig<DetailsSectionProps> =
  {
    label: msg("components.detailsSection", "Details Section"),
    fields: detailsFields,
    defaultProps,
    render: DetailsSectionComponent,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantDetailsSection",
  displayName: "Details Section",
  description: "Details Section",
  pageSetTypes: ["ENTITY"],
};
