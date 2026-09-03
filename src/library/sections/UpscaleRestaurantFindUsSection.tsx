import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  HoursStatus,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  MapboxStaticMapComponent,
  EntityField,
  VisibilityWrapper,
  CTA,
  getThemeColorCssValue,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  mapboxStaticMapStyleOptions,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  Background,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type NearbyLocationCardStyles = {
  cardBackgroundColor: string | ThemeColor;
  cardTitleColor?: string | ThemeColor;
  showHours: boolean;
  showPhone: boolean;
  showAddress: boolean;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
    showDayNames: boolean;
  };
  phone: {
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  address: {
    showRegion: boolean;
    showCountry: boolean;
  };
};

type FindUsSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  findUs: {
    nearbyLocationCardStyles: NearbyLocationCardStyles;
    heading: StyledTextProps;
    map: {
      coordinate: YextEntityField<{ latitude: number; longitude: number }>;
      mapStyle: (typeof mapboxStaticMapStyleOptions)[number]["value"];
      zoom: number;
    };
  };
};

type StreamDocumentWithLocation = {
  locale?: string;
  timezone?: string;
  comingSoon?: boolean;
  _env?: Record<string, any>;
  yextDisplayCoordinate?: { latitude?: number; longitude?: number };
};

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

const makeNearbyLocationCardStyles = (): NearbyLocationCardStyles => ({
  cardBackgroundColor: makeThemeColor("white", "black"),
  cardTitleColor: undefined,
  showHours: true,
  showPhone: true,
  showAddress: true,
  hoursStyles: {
    showCurrentStatus: true,
    timeFormat: "12h",
    dayOfWeekFormat: "short",
    showDayNames: true,
  },
  phone: {
    phoneFormat: "domestic",
    includeHyperlink: false,
  },
  address: {
    showRegion: true,
    showCountry: false,
  },
});

const defaultProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "black"),
  },
  findUs: {
    nearbyLocationCardStyles: makeNearbyLocationCardStyles(),
    heading: makeText("Where To Find Us"),
    map: {
      coordinate: {
        field: "yextDisplayCoordinate",
        constantValue: {
          latitude: 0,
          longitude: 0,
        },
        constantValueEnabled: false,
      },
      mapStyle: "streets-v12",
      zoom: 15,
    },
  },
} satisfies FindUsSectionProps;

const findUsFields: YextFields<FindUsSectionProps> = {
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
  findUs: {
    label: "Where To Find Us",
    type: "object",
    objectFields: {
      nearbyLocationCardStyles: {
        label: "Nearby Location Card Styles",
        type: "object",
        objectFields: {
          cardBackgroundColor: {
            label: "Card Background Color",
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
          cardTitleColor: {
            label: "Card Title Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
          showHours: {
            label: "Show Hours",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showPhone: {
            label: "Show Phone",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showAddress: {
            label: "Show Address",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
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
              showDayNames: {
                label: "Show Day Names",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
            },
          },
          phone: {
            label: "Phone",
            type: "object",
            objectFields: {
              phoneFormat: {
                label: "Phone Format",
                type: "select",
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
          address: {
            label: "Address",
            type: "object",
            objectFields: {
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
            },
          },
        },
      },
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: {
              types: ["type.string"],
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
      map: {
        label: "Map",
        type: "object",
        objectFields: {
          coordinate: {
            label: "Coordinates",
            type: "entityField",
            filter: {
              types: ["type.coordinate"],
            },
          },
          mapStyle: {
            label: "Mapbox Map Style",
            type: "select",
            options: mapboxStaticMapStyleOptions,
          },
          zoom: {
            label: "Zoom",
            type: "number",
            min: 0,
            max: 22,
          },
        },
      },
    },
  },
};

const UpscaleRestaurantCss = `
.fb-find-us-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-find-us-shell * { box-sizing: border-box; }
.fb-find-us-shell p,
.fb-find-us-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-find-us-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-find-us-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-find-us-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-find-us-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-find-us-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-find-us-shell h6 {
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
.fb-find-section h2 {
  margin-bottom: 28px;
  text-align: center;
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.25;
}
.fb-panel {
  border-radius: 8px;
  min-width: 0;
  padding: 26px 24px;
}
.fb-location-grid .fb-panel {
  height: 100%;
}
.fb-map-frame {
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-radius: var(--borderRadius-image-borderRadius);
}
.fb-map-frame .mapbox-static-map-shell,
.fb-map-frame .mapbox-static-map-picture,
.fb-map-frame .mapbox-static-map-image {
  width: 100%;
  height: 100%;
}
.fb-map-frame .mapbox-static-map-image {
  object-fit: cover;
  object-position: center;
}
.fb-location-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 24px;
}
.fb-location-grid h3 {
  margin-bottom: 10px;
  font-size: 24px;
  line-height: 1.2;
}
.fb-location-grid p {
  margin: 0 0 6px;
}
.fb-location-grid a {
  color: var(--fb-text);
  font-weight: 600;
  text-underline-offset: 4px;
}
.fb-location-hours {
  margin-top: 10px;
}
.fb-location-phone,
.fb-location-address {
  margin-top: 10px;
}
@media (max-width: 1100px) {
  .fb-location-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
  .fb-location-grid {
    grid-template-columns: 1fr;
  }
}
`;

const formatPhoneForDisplay = (
  phoneNumber: string,
  format: NearbyLocationCardStyles["phone"]["phoneFormat"],
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

const toCssColor = (color?: string | ThemeColor): string | undefined => {
  if (!color) {
    return undefined;
  }

  if (typeof color === "string") {
    return color;
  }

  return getThemeColorCssValue(color);
};

const toBackgroundColor = (color: string | ThemeColor): ThemeColor => {
  if (typeof color !== "string") {
    return color;
  }

  return {
    selectedColor: color,
    contrastingColor: "black",
  };
};

type NearbyLocationData = {
  id?: string;
  name?: string;
  mainPhone?: string;
  timezone?: string;
  hours?: HoursType;
  address?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
  };
};

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

const renderHoursStatus = (
  hours: HoursType,
  locale: string,
  timezone: string,
  comingSoon: boolean,
  showCurrentStatus: boolean,
  timeFormat: "12h" | "24h",
  dayOfWeekFormat: "short" | "long",
  showDayNames: boolean,
): React.ReactNode => (
  <HoursStatus
    hours={hours}
    timezone={timezone}
    comingSoon={comingSoon}
    dayOptions={{ weekday: dayOfWeekFormat }}
    timeOptions={{ hour12: timeFormat === "12h" }}
    statusTemplate={(params: StatusParams) => {
      const interval = params.isOpen
        ? params.currentInterval
        : params.futureInterval;
      const time = params.isOpen
        ? (interval?.getEndTime(locale, params.timeOptions) ?? "")
        : (interval?.getStartTime(locale, params.timeOptions) ?? "");
      const dayOfWeek = showDayNames
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
          {showCurrentStatus ? hoursCurrentTemplateOverride(params) : null}
          {showCurrentStatus ? defaultSeparatorTemplate(params) : null}
          {statusText ? (
            <span className="HoursStatus-future">{statusText}</span>
          ) : null}
        </div>
      );
    }}
  />
);

const renderNearbyLocationCard = (
  locationData: NearbyLocationData,
  index: number,
  streamDocument: StreamDocumentWithLocation,
  cardStyles: NearbyLocationCardStyles,
  relativePrefixToRoot: string,
  isEditing: boolean,
): React.ReactNode => {
  const resolvedUrl = resolveUrlTemplate(
    mergeMeta(locationData, streamDocument),
    relativePrefixToRoot,
  );
  const locale = streamDocument.locale;
  const titleColor = toCssColor(cardStyles.cardTitleColor);
  const timezone = locationData.timezone ?? streamDocument.timezone ?? "UTC";
  const addressParts = [
    locationData.address?.city,
    cardStyles.address.showRegion ? locationData.address?.region : undefined,
    locationData.address?.postalCode,
    cardStyles.address.showCountry
      ? locationData.address?.countryCode
      : undefined,
  ].filter(Boolean);

  return (
    <Background
      key={locationData.id ?? locationData.name ?? index}
      background={toBackgroundColor(cardStyles.cardBackgroundColor)}
      className="fb-panel"
    >
      <article>
        <h3 style={{ color: titleColor }}>{locationData.name}</h3>
        {cardStyles.showAddress ? (
          <p className="fb-location-address">
            {locationData.address?.line1 ??
              (isEditing ? "Address will appear here" : "")}
            {locationData.address?.line1 ? (
              <>
                <br />
                {addressParts.join(", ")}
              </>
            ) : null}
          </p>
        ) : null}
        {cardStyles.showPhone ? (
          locationData.mainPhone ? (
            <p className="fb-location-phone">
              {cardStyles.phone.includeHyperlink ? (
                <CTA
                  link={`tel:${locationData.mainPhone.replace(/\D/g, "")}`}
                  label={formatPhoneForDisplay(
                    locationData.mainPhone,
                    cardStyles.phone.phoneFormat,
                  )}
                  linkType="PHONE"
                  normalizeLink={false}
                  variant="link"
                  eventName={`locationPhone${index}`}
                  alwaysHideCaret={true}
                />
              ) : (
                formatPhoneForDisplay(
                  locationData.mainPhone,
                  cardStyles.phone.phoneFormat,
                )
              )}
            </p>
          ) : isEditing ? (
            <p className="fb-location-phone">Phone number will appear here</p>
          ) : null
        ) : null}
        {cardStyles.showHours ? (
          locationData.hours ? (
            <p className="fb-location-hours">
              {renderHoursStatus(
                locationData.hours,
                locale ?? "en",
                timezone,
                streamDocument.comingSoon ?? false,
                cardStyles.hoursStyles.showCurrentStatus,
                cardStyles.hoursStyles.timeFormat,
                cardStyles.hoursStyles.dayOfWeekFormat,
                cardStyles.hoursStyles.showDayNames,
              )}
            </p>
          ) : isEditing ? (
            <p className="fb-location-hours">Hours will appear here</p>
          ) : null
        ) : null}
        <CTA
          link={resolvedUrl}
          label="Learn More"
          linkType="URL"
          normalizeLink={false}
          variant="link"
          eventName={`locationLink${index}`}
          alwaysHideCaret={true}
        />
      </article>
    </Background>
  );
};

const FindUsSection: PuckComponent<FindUsSectionProps> = (props) => {
  const streamDocument = useDocument<StreamDocumentWithLocation>();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const isEditing = props.puck?.isEditing ?? false;
  const coordinate = resolveComponentData(
    props.findUs.map.coordinate,
    locale,
    streamDocument,
  );
  const enabled =
    coordinate?.latitude !== undefined && coordinate?.longitude !== undefined;
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude,
      radiusMi: 25,
      limit: 3,
      enabled,
    });
  const nearbyLocations = nearbyLocationsData?.response?.docs ?? [];
  const hasNearbyLocations = nearbyLocations.length > 0;
  const hasCoordinate = Boolean(enabled);

  const shouldHideSection = !isEditing && !hasNearbyLocations && !hasCoordinate;
  const heading = resolveComponentData(
    props.findUs.heading.text,
    locale,
    streamDocument,
  );
  if (shouldHideSection) {
    return <></>;
  }

  const shouldShowMap = true;
  const shouldShowNearbyCards = isEditing || hasNearbyLocations;
  const cardStyles = props.findUs.nearbyLocationCardStyles;
  const resolvedMapProps = {
    ...props.findUs.map,
    coordinate: {
      field: "",
      constantValue: coordinate ?? { latitude: 0, longitude: 0 },
      constantValueEnabled: true,
    },
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={isEditing}
    >
      <Background
        className="fb-find-us-shell"
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-find-section">
          <div className="fb-container">
            <EntityField
              displayName="Heading"
              fieldId={props.findUs.heading.text.field}
              constantValueEnabled={
                props.findUs.heading.text.constantValueEnabled
              }
            >
              <h2
                style={{
                  marginBottom: 28,
                  color: getThemeColorCssValue(props.findUs.heading.fontColor),
                }}
              >
                {heading}
              </h2>
            </EntityField>
            {shouldShowMap ? (
              <EntityField
                displayName="Map Coordinate"
                fieldId={props.findUs.map.coordinate.field}
                constantValueEnabled={
                  props.findUs.map.coordinate.constantValueEnabled
                }
              >
                <div className="fb-map-frame">
                  {hasCoordinate ? (
                    <MapboxStaticMapComponent
                      {...resolvedMapProps}
                      id={`${props.id ?? "find-us"}-map`}
                      puck={props.puck}
                    />
                  ) : isEditing ? (
                    <p>Choose coordinates to preview the map.</p>
                  ) : null}
                </div>
              </EntityField>
            ) : null}
            {shouldShowNearbyCards ? (
              isEditing && !hasNearbyLocations ? (
                <div className="fb-location-grid">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Background
                      key={`nearby-placeholder-${index}`}
                      background={toBackgroundColor(
                        cardStyles.cardBackgroundColor,
                      )}
                      className="fb-panel"
                    >
                      <article>
                        <h3
                          style={{
                            color: toCssColor(cardStyles.cardTitleColor),
                          }}
                        >
                          Nearby location
                        </h3>
                        {cardStyles.showAddress ? (
                          <p className="fb-location-address">
                            Address will appear here
                          </p>
                        ) : null}
                        {cardStyles.showPhone ? (
                          <p className="fb-location-phone">
                            Phone number will appear here
                          </p>
                        ) : null}
                        {cardStyles.showHours ? (
                          <p className="fb-location-hours">
                            Hours will appear here
                          </p>
                        ) : null}
                        <CTA
                          link="#"
                          label="Get directions"
                          linkType="URL"
                          normalizeLink={false}
                          variant="link"
                          eventName="locationLinkPlaceholder"
                          alwaysHideCaret={true}
                        />
                      </article>
                    </Background>
                  ))}
                </div>
              ) : nearbyLocationsStatus === "pending" ? (
                <p>Loading nearby locations</p>
              ) : nearbyLocations.length ? (
                <div className="fb-location-grid">
                  {nearbyLocations.map((locationData, index) => {
                    return renderNearbyLocationCard(
                      locationData as NearbyLocationData,
                      index,
                      streamDocument,
                      cardStyles,
                      relativePrefixToRoot ?? "",
                      isEditing,
                    );
                  })}
                </div>
              ) : null
            ) : null}
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantFindUsSection: YextComponentConfig<FindUsSectionProps> =
  {
    label: "Find Us Section",
    fields: findUsFields,
    defaultProps,
    render: FindUsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFindUsSection",
  displayName: "Find Us Section",
  description: "Find Us Section",
  pageSetTypes: ["ENTITY"],
};
