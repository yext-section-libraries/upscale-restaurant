import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { Link } from "@yext/pages-components";
import {
  Background,
  EntityField,
  VisibilityWrapper,
  getSurfaceColorStyle,
  getThemeColorCssValue,
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
  fontColor?: ThemeColor;
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
    currentPage: StyledTextProps;
    includeCurrentPage: boolean;
  };
};

type StreamDocumentWithBreadcrumbs = {
  locale?: string;
  name?: string;
  address?: {
    line1?: string;
  };
};

type BreadcrumbItem = {
  name?: string;
  slug?: string;
};

type BreadcrumbsStyle = React.CSSProperties & {
  "--fb-breadcrumb-color"?: string;
  "--fb-breadcrumb-muted-color"?: string;
  "--fb-breadcrumb-border-color"?: string;
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const UpscaleRestaurantBreadcrumbsCss = `
.fb-breadcrumbs-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-breadcrumbs-shell * { box-sizing: border-box; }
.fb-breadcrumbs-shell a,
.fb-breadcrumbs-shell span,
.fb-breadcrumbs-shell li {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.fb-breadcrumbs-shell {
  border-bottom: 1px solid var(--fb-breadcrumb-border-color);
}
.fb-section {
  padding: 18px 0;
}
.fb-container {
  width: min(100%, var(--maxWidth-pageSection-contentWidth, 1200px));
  margin: 0 auto;
  padding: 0 24px;
}
.fb-breadcrumbs-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 0;
  margin: 0;
  padding: 0;
}
.fb-breadcrumbs-item {
  display: inline-flex;
  align-items: center;
  color: var(--fb-breadcrumb-muted-color);
}
.fb-breadcrumb-link,
.fb-breadcrumb-current {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--fb-breadcrumb-color);
}
.fb-breadcrumb-link {
  transition: color 0.2s ease;
}
.fb-breadcrumb-link:hover {
  color: var(--fb-breadcrumb-color);
}
.fb-breadcrumb-current {
  font-weight: 600;
}
.fb-breadcrumb-separator {
  display: inline-flex;
  align-items: center;
  margin: 0 10px;
  color: var(--fb-breadcrumb-color);
}
@media (max-width: 767px) {
  .fb-section {
    padding: 14px 0;
  }

  .fb-container {
    padding: 0 16px;
  }

  .fb-breadcrumbs-list {
    row-gap: 8px;
  }

  .fb-breadcrumb-separator {
    margin: 0 8px;
  }
}
`;

const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({
  selectedColor,
  contrastingColor,
});

const makeText = (
  text: string,
  field = "",
  constantValueEnabled = true,
): StyledTextProps => ({
  text: {
    field,
    constantValue: text,
    constantValueEnabled,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const getTextStyles = (
  text: StyledTextProps,
  fallbackColor: string,
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
  color: getThemeColorCssValue(text.fontColor) ?? fallbackColor,
});

const resolveCurrentPageLabel = (
  currentPage: StyledTextProps["text"],
  locale: string,
  streamDocument: StreamDocumentWithBreadcrumbs,
): string => {
  if (currentPage.field === "address.line1") {
    return streamDocument.address?.line1 ?? "";
  }

  return (
    resolveComponentData(currentPage, locale, streamDocument) ||
    streamDocument.name ||
    ""
  );
};

const getPrefixedHref = (
  slug: string | undefined,
  relativePrefixToRoot?: string,
): string => {
  const resolvedSlug = slug ?? "";

  return relativePrefixToRoot
    ? `${relativePrefixToRoot}${resolvedSlug}`
    : resolvedSlug;
};

const defaultProps: BreadcrumbsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor("white", "black"),
  },
  breadcrumbs: {
    rootLabel: makeText("All Locations"),
    currentPage: makeText("", "name", false),
    includeCurrentPage: true,
  },
};

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
      currentPage: {
        label: "Current Page",
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
      includeCurrentPage: {
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

const BreadcrumbsSection: PuckComponent<BreadcrumbsSectionProps> = (props) => {
  const streamDocument = useDocument<StreamDocumentWithBreadcrumbs>();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const breadcrumbs = (resolveBreadcrumbs(streamDocument) ??
    []) as BreadcrumbItem[];
  const visibleBreadcrumbs =
    props.breadcrumbs.includeCurrentPage || breadcrumbs.length <= 1
    ? breadcrumbs
    : breadcrumbs.slice(0, -1);

  if (!visibleBreadcrumbs.length) {
    return props.puck.isEditing ? (
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

  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const pageStyle: BreadcrumbsStyle = {
    ...sectionSurfaceStyle,
    "--fb-breadcrumb-color": "currentColor",
    "--fb-breadcrumb-muted-color": "currentColor",
    "--fb-breadcrumb-border-color": "currentColor",
  };
  const rootLabel =
    resolveComponentData(
      props.breadcrumbs.rootLabel.text,
      locale,
      streamDocument,
    ) ||
    visibleBreadcrumbs[0]?.name ||
    "";
  const currentPageLabel = resolveCurrentPageLabel(
    props.breadcrumbs.currentPage.text,
    locale,
    streamDocument,
  );
  const rootTextStyles = getTextStyles(
    props.breadcrumbs.rootLabel,
    "currentColor",
  );
  const currentPageStyles = {
    ...getTextStyles(props.breadcrumbs.currentPage, "currentColor"),
    fontWeight:
      props.breadcrumbs.currentPage.styles.fontWeight === "default"
        ? 600
        : props.breadcrumbs.currentPage.styles.fontWeight,
  } satisfies React.CSSProperties;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        className="fb-breadcrumbs-shell"
        style={pageStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantBreadcrumbsCss}</style>
        <section className="fb-section">
          <div className="fb-container">
            <ol className="fb-breadcrumbs-list">
              {visibleBreadcrumbs.map((breadcrumb, index) => {
                const isRoot = index === 0;
                const isCurrentPage =
                  props.breadcrumbs.includeCurrentPage &&
                  index === visibleBreadcrumbs.length - 1;
                const label = isRoot
                  ? rootLabel
                  : isCurrentPage
                    ? currentPageLabel || breadcrumb.name || ""
                    : breadcrumb.name || "";
                const href = getPrefixedHref(
                  breadcrumb.slug,
                  relativePrefixToRoot,
                );

                let crumbNode: React.ReactNode;
                if (isCurrentPage && !isRoot) {
                  crumbNode = (
                    <EntityField
                      displayName="Current Page"
                      fieldId={props.breadcrumbs.currentPage.text.field}
                      constantValueEnabled={
                        props.breadcrumbs.currentPage.text.constantValueEnabled
                      }
                    >
                      <span
                        aria-current="page"
                        className="fb-breadcrumb-current"
                        style={currentPageStyles}
                      >
                        {label}
                      </span>
                    </EntityField>
                  );
                } else if (isRoot) {
                  crumbNode = (
                    <EntityField
                      displayName="Root Label"
                      fieldId={props.breadcrumbs.rootLabel.text.field}
                      constantValueEnabled={
                        props.breadcrumbs.rootLabel.text.constantValueEnabled
                      }
                    >
                      <Link
                        href={isCurrentPage ? "" : href}
                        eventName={`breadcrumb${index}`}
                        className={
                          isCurrentPage
                            ? "fb-breadcrumb-current"
                            : "fb-breadcrumb-link"
                        }
                        style={
                          isCurrentPage ? currentPageStyles : rootTextStyles
                        }
                      >
                        {label}
                      </Link>
                    </EntityField>
                  );
                } else {
                  crumbNode = (
                    <Link
                      href={href}
                      eventName={`breadcrumb${index}`}
                      className="fb-breadcrumb-link"
                    >
                      {label}
                    </Link>
                  );
                }

                return (
                  <li
                    key={`${breadcrumb.slug ?? "breadcrumb"}-${index}`}
                    className="fb-breadcrumbs-item"
                  >
                    {crumbNode}
                    {index < visibleBreadcrumbs.length - 1 ? (
                      <span className="fb-breadcrumb-separator" aria-hidden>
                        /
                      </span>
                    ) : null}
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

export const UpscaleRestaurantBreadcrumbsSection: YextComponentConfig<BreadcrumbsSectionProps> =
  {
    label: "Breadcrumbs Section",
    fields: breadcrumbsFields,
    defaultProps,
    render: BreadcrumbsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantBreadcrumbsSection",
  displayName: "Breadcrumbs Section",
  description: "Breadcrumbs Section",
  pageSetTypes: ["ENTITY"],
};
