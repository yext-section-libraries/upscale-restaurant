import "../shared/typography.css";
import {
  makeText,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { getThemeColorCssValue, msg, pt } from "@yext/visual-editor";

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
  type ThemeColor,
  type YextComponentConfig,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

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

const UpscaleRestaurantBreadcrumbsCss = `
.fb-breadcrumbs-shell * { box-sizing: border-box; }
.fb-breadcrumbs-shell {
  border-bottom: 1px solid var(--fb-breadcrumb-border-color);
}
.fb-breadcrumbs-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-breadcrumbs-shell .fb-container {
  width: min(100%, var(--maxWidth-pageSection-contentWidth, 1200px));
  margin: 0 auto;
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
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
.fb-breadcrumb-separator {
  display: inline-flex;
  align-items: center;
  margin: 0 10px;
  color: var(--fb-breadcrumb-color);
}
@media (max-width: 767px) {
  .fb-breadcrumbs-shell .fb-container {
    padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
  }
  .fb-breadcrumbs-list {
    row-gap: 8px;
  }
  .fb-breadcrumb-separator {
    margin: 0 8px;
  }
}
`;

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

const defaultProps: BreadcrumbsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: { selectedColor: "white", contrastingColor: "black" },
  },
  breadcrumbs: {
    rootLabel: makeText("All Locations"),
    currentPage: makeText("", "name", false),
    includeCurrentPage: true,
  },
};

type BreadcrumbsSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<BreadcrumbsSectionProps, typeof breadcrumbsFields>>
>;

const breadcrumbsFields = {
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
    },
  },
  breadcrumbs: {
    label: msg("fields.breadcrumbs", "Breadcrumbs"),
    type: "object",
    objectFields: {
      rootLabel: {
        label: msg("fields.rootLabel", "Root Label"),
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
      currentPage: {
        label: msg("fields.currentPage", "Current Page"),
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
      includeCurrentPage: {
        label: msg("fields.includeCurrentLocation", "Include Current Location"),
        type: "radio",
        options: [
          { label: msg("fields.yes", "Yes"), value: true },
          { label: msg("fields.no", "No"), value: false },
        ],
      },
    },
  },
} satisfies YextFields<BreadcrumbsSectionProps>;

const BreadcrumbsSection: React.FC<BreadcrumbsSectionRenderProps> = (props) => {
  const streamDocument = useDocument<StreamDocumentWithBreadcrumbs>();
  const { i18n } = useTranslation();
  const locale = i18n.language;
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
          padding: "18px 24px",
        }}
      >
        {pt(
          "noBreadcrumbsEditorOnly",
          "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
        )}
      </p>
    ) : (
      <></>
    );
  }

  const pageStyle: BreadcrumbsStyle = {
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
  const rootTextStyles = {
    ...props.breadcrumbs.rootLabel.styles,
    color: getThemeColorCssValue(props.breadcrumbs.rootLabel.fontColor) ?? "currentColor",
  };
  const currentPageStyles = {
    ...props.breadcrumbs.currentPage.styles,
    color: getThemeColorCssValue(props.breadcrumbs.currentPage.fontColor) ?? "currentColor",
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
                const href = `${relativePrefixToRoot ?? ""}${breadcrumb.slug ?? ""}`;

                let crumbNode: React.ReactNode;
                if (isCurrentPage && !isRoot) {
                  crumbNode = (
                    <EntityField
                      displayName={pt("currentPage", "Current Page")}
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
                      displayName={pt("rootLabel", "Root Label")}
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

export const UpscaleRestaurantBreadcrumbsSection: YextComponentConfig<
  BreadcrumbsSectionProps,
  typeof breadcrumbsFields
> =
  {
    label: msg("components.breadcrumbsLabel", "Breadcrumbs"),
    fields: breadcrumbsFields,
    defaultProps,
    render: (props) => <BreadcrumbsSection {...props} />,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantBreadcrumbsSection",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs Section",
  pageSetTypes: ["ENTITY"],
};
