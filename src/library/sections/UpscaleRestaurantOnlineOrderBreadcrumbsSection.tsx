import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { Link } from "@yext/pages-components";
import {
  Background,
  EntityField,
  VisibilityWrapper,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
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
};

type BreadcrumbItem = {
  name: string;
  slug?: string;
  index: number;
};

type StreamDocumentWithBreadcrumbs = {
  locale?: string;
  name?: string;
  address?: {
    line1?: string;
  };
};

type BreadcrumbsSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  breadcrumbs: {
    rootLabel: StyledTextProps;
    includeCurrentLocation: boolean;
  };
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
});

const defaultProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "black"),
  },
  breadcrumbs: {
    rootLabel: makeText("All Locations"),
    includeCurrentLocation: true,
  },
} satisfies BreadcrumbsSectionProps;

const breadcrumbsFields: YextFields<BreadcrumbsSectionProps> = {
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
  breadcrumbs: {
    label: "Breadcrumbs",
    type: "object",
    objectFields: {
      rootLabel: {
        label: "Root Label",
        type: "object",
        objectFields: {
          text: {
            label: "Text",
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          },
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
        },
      },
      includeCurrentLocation: {
        label: "Include Current Location",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
};

const getTextStyle = (
  value: StyledTextProps,
  fallbackColor: string,
): React.CSSProperties => ({
  fontFamily:
    value.styles.fontFamily === "default" ? undefined : value.styles.fontFamily,
  fontSize:
    value.styles.fontSize === "default" ? undefined : value.styles.fontSize,
  fontWeight:
    value.styles.fontWeight === "default" ? undefined : value.styles.fontWeight,
  fontStyle:
    value.styles.fontStyle === "default" ? undefined : value.styles.fontStyle,
  textTransform:
    value.styles.textTransform === "default"
      ? undefined
      : value.styles.textTransform,
  color: fallbackColor,
});

const getBreadcrumbHref = (
  slug: string | undefined,
  relativePrefixToRoot: string | undefined,
): string | undefined => {
  if (!slug || slug.trim().length === 0) {
    return undefined;
  }

  return relativePrefixToRoot ? relativePrefixToRoot + slug : slug;
};

const UpscaleRestaurantOnlineOrderBreadcrumbsCss = `
.fb-breadcrumbs-page {
  font-family: var(--fontFamily-body-fontFamily);
}

.fb-breadcrumbs-page * {
  box-sizing: border-box;
}

.fb-breadcrumbs-shell {
  border-top: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
}

.fb-breadcrumbs-container {
  max-width: var(--maxWidth-pageSection-contentWidth);
  margin: 0 auto;
  padding: 0 24px;
}

.fb-breadcrumbs-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 14px 0;
  list-style: none;
}

.fb-breadcrumbs-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.fb-breadcrumbs-link {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  line-height: 1.4;
  text-decoration: none;
  letter-spacing: 0.01em;
}

.fb-breadcrumbs-link:hover {
  text-decoration: underline;
}

.fb-breadcrumbs-current {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.fb-breadcrumbs-separator {
  color: currentColor;
  font-size: 0.75rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .fb-breadcrumbs-container {
    padding: 0 16px;
  }

  .fb-breadcrumbs-list {
    gap: 6px;
    padding: 12px 0;
  }

  .fb-breadcrumbs-link,
  .fb-breadcrumbs-current {
    font-size: 0.76rem;
  }
}
`;

const UpscaleRestaurantOnlineOrderBreadcrumbsSectionComponent: PuckComponent<
  BreadcrumbsSectionProps
> = (props) => {
    const streamDocument = useDocument<StreamDocumentWithBreadcrumbs>();
    const { relativePrefixToRoot } = useTemplateProps();
    const locale = streamDocument.locale ?? "en";
    const breadcrumbs =
      (resolveBreadcrumbs(streamDocument) as BreadcrumbItem[] | undefined) ?? [];
    const rootLabel =
      resolveComponentData(
        props.breadcrumbs.rootLabel.text,
        locale,
        streamDocument,
      ) || "";
    const currentPageLabel =
      streamDocument.name?.trim() || streamDocument.address?.line1?.trim() || "";
    const displayedBreadcrumbs =
      props.breadcrumbs.includeCurrentLocation || breadcrumbs.length <= 1
        ? breadcrumbs
        : breadcrumbs.slice(0, -1);

  if (!breadcrumbs.length) {
    return props.puck?.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

    return (
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck?.isEditing}
      >
        <Background
          className="fb-breadcrumbs-page"
          background={props.section.backgroundColor}
        >
          <style>{UpscaleRestaurantOnlineOrderBreadcrumbsCss}</style>
          <section className="fb-breadcrumbs-shell">
            <div className="fb-breadcrumbs-container">
              <ol className="fb-breadcrumbs-list" aria-label="Breadcrumb">
                {displayedBreadcrumbs.map((breadcrumb, index) => {
                  const isRoot = index === 0;
                  const isCurrentPage =
                    props.breadcrumbs.includeCurrentLocation &&
                    breadcrumb.index === breadcrumbs.length - 1;
                  const href = getBreadcrumbHref(
                    breadcrumb.slug,
                    relativePrefixToRoot,
                  );
                  const label = isRoot
                    ? rootLabel || breadcrumb.name
                    : isCurrentPage
                      ? currentPageLabel
                      : breadcrumb.name;

                  return (
                    <li
                      key={`${breadcrumb.slug ?? "breadcrumb"}-${breadcrumb.index}`}
                      className="fb-breadcrumbs-item"
                    >
                      {index > 0 ? (
                        <span className="fb-breadcrumbs-separator" aria-hidden>
                          /
                        </span>
                      ) : null}
                      {isCurrentPage || !href ? (
                        <span
                          className="fb-breadcrumbs-current"
                          aria-current={isCurrentPage ? "page" : undefined}
                          style={
                            isCurrentPage
                              ? undefined
                              : isRoot
                                ? getTextStyle(
                                    props.breadcrumbs.rootLabel,
                                    "var(--colors-palette-quaternary)",
                                  )
                                : undefined
                          }
                        >
                          {label}
                        </span>
                      ) : isRoot ? (
                        <EntityField
                          displayName="Root Label"
                          fieldId={props.breadcrumbs.rootLabel.text.field}
                          constantValueEnabled={
                            props.breadcrumbs.rootLabel.text.constantValueEnabled
                          }
                        >
                          <Link
                            href={href}
                            className="fb-breadcrumbs-link"
                            style={getTextStyle(
                              props.breadcrumbs.rootLabel,
                              "var(--colors-palette-primary)",
                            )}
                          >
                            {label}
                          </Link>
                        </EntityField>
                      ) : (
                        <Link href={href} className="fb-breadcrumbs-link">
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </Background>
      </VisibilityWrapper>
    );
  };

export const UpscaleRestaurantOnlineOrderBreadcrumbsSection: YextComponentConfig<BreadcrumbsSectionProps> =
  {
    label: "Breadcrumbs Section",
    fields: breadcrumbsFields,
    defaultProps,
    render: UpscaleRestaurantOnlineOrderBreadcrumbsSectionComponent,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderBreadcrumbsSection",
  displayName: "Breadcrumbs Section",
  description: "Breadcrumbs Section",
  pageSetTypes: ["ENTITY"],
};
