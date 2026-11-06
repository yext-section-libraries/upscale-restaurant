import "../shared/typography.css";
import {
  makeText,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { getThemeColorCssValue, msg, pt } from "@yext/visual-editor";

import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Background,
  EntityField,
  VisibilityWrapper,
  getAggregateRating,
  resolveComponentData,
  useDocument,
  type ThemeColor,
  type YextComponentConfig,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";

type ReviewsSectionProps = {
  puck?: {
    isEditing?: boolean;
  };
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  reviews: {
    heading: StyledTextProps;
    recentHeading: StyledTextProps;
  };
};

type ReviewsStyle = React.CSSProperties & Record<`--${string}`, string>;

type StreamDocumentWithReviews = {
  locale?: string;
  timezone?: string;
  ref_reviewsAgg?: {
    publisher?: string;
    topReviews?: {
      authorName?: string;
      rating?: number;
      content?: string;
      reviewDate?: string;
      comments?: { content?: string; commentDate?: string }[];
    }[];
  }[];
};

const defaultProps: ReviewsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: { selectedColor: "palette-tertiary", contrastingColor: "palette-tertiary-contrast" },
    cardBackgroundColor: { selectedColor: "white", contrastingColor: "black" },
  },
  reviews: {
    heading: makeText("Reviews"),
    recentHeading: makeText("Recent Reviews:"),
  },
};

type ReviewsSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<ReviewsSectionProps, typeof reviewsFields>>
>;

const reviewsFields = {
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
  reviews: {
    label: msg("fields.reviews", "Reviews"),
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
            transform: true,
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      recentHeading: {
        label: msg("fields.recentHeading", "Recent Heading"),
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
    },
  },
} satisfies YextFields<ReviewsSectionProps>;

const UpscaleRestaurantCss = `
.fb-reviews-shell * { box-sizing: border-box; }
.fb-reviews-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-reviews-shell .fb-tint-section {
  background: var(--fb-tint-bg);
}
.fb-reviews-shell .fb-wide-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
  margin: 0 auto;
}
.fb-review-summary,
.fb-recent-heading {
  text-align: center;
}
.fb-review-summary {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 0 0 28px;
}
.fb-stars {
  color: var(--fb-stars);
}
.fb-recent-heading {
  margin: 0 0 16px;
}
.fb-review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.fb-review-card {
  border: 1px solid currentColor;
  border-radius: 10px;
  padding: 14px 16px 16px;
}
.fb-review-head,
.fb-review-author {
  display: flex;
  align-items: center;
}
.fb-review-head {
  justify-content: space-between;
  gap: 12px;
}
.fb-review-author {
  gap: 10px;
}
.fb-review-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.fb-review-card time {
  color: currentColor;
  opacity: 0.7;
}
.fb-review-card p {
  margin: 0;
}
.fb-review-author p {
  color: currentColor;
  opacity: 0.7;
}
.fb-review-stars-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 8px !important;
}
.fb-review-response {
  border-left: 3px solid var(--fb-primary);
  margin-top: 14px;
  padding-left: 12px;
}
.fb-review-response strong {
  display: block;
}
@media (max-width: 1100px) {
  .fb-review-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-review-grid {
    grid-template-columns: 1fr;
  }
}
`;

const formatReviewDate = (date?: string, locale?: string): string => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.valueOf())) {
    return "";
  }

  return parsedDate.toLocaleDateString(locale ?? "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getReviewItems = (streamDocument: StreamDocumentWithReviews) => {
  const firstPartyReviews =
    streamDocument.ref_reviewsAgg?.find(
      (aggregate) => aggregate.publisher === "FIRSTPARTY",
    )?.topReviews ?? [];

  return firstPartyReviews;
};

const editorFallbackReviews: NonNullable<
  StreamDocumentWithReviews["ref_reviewsAgg"]
>[number]["topReviews"] = [
  {
    authorName: pt("sampleReviewAuthorJordan", "Jordan"),
    rating: 5,
    reviewDate: "2025-03-18",
    content: pt(
      "sampleReviewContentBurger",
      "The burger was excellent and the service felt polished without being stiff.",
    ),
    comments: [
      {
        commentDate: "2025-03-20",
        content: pt(
          "sampleReviewOwnerResponse",
          "Thanks for stopping by. We hope to see you again soon.",
        ),
      },
    ],
  },
  {
    authorName: pt("sampleReviewAuthorAvery", "Avery"),
    rating: 4.8,
    reviewDate: "2025-02-07",
    content: pt(
      "sampleReviewContentCocktails",
      "Great cocktails, great fries, and a really comfortable room for a long dinner.",
    ),
  },
];

const ReviewsSection = (props: ReviewsSectionRenderProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument<StreamDocumentWithReviews>();
  const locale = i18n.language;
  const heading = resolveComponentData(
    props.reviews.heading.text,
    locale,
    streamDocument,
  );
  const recentHeading = resolveComponentData(
    props.reviews.recentHeading.text,
    locale,
    streamDocument,
  );
  const isEditing = props.puck?.isEditing ?? false;
  const liveReviewItems = getReviewItems(streamDocument);
  const reviewItems =
    liveReviewItems.length > 0
      ? liveReviewItems
      : isEditing
        ? (editorFallbackReviews ?? [])
        : [];
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const showFallbackReviews = liveReviewItems.length === 0 && isEditing;
  const hideSection = reviewItems.length === 0 && !isEditing;
  const pageStyle: ReviewsStyle = {
    "--fb-primary": "var(--colors-palette-primary)",
    "--fb-stars": "var(--colors-palette-primary)",
  };

  if (hideSection) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={isEditing}
    >
      <Background
        className="fb-reviews-shell"
        style={pageStyle}
        background={props.section.backgroundColor}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section fb-tint-section">
          <div className="fb-wide-container">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.reviews.heading.text.field}
              constantValueEnabled={
                props.reviews.heading.text.constantValueEnabled
              }
            >
              <h2
                style={{
                  ...props.reviews.heading.styles,
                  color: getThemeColorCssValue(props.reviews.heading.fontColor),
                  textAlign: "center",
                }}
              >
                {heading}
              </h2>
            </EntityField>
            {showFallbackReviews && (
              <p>
                {pt(
                  "noLiveReviewsEditorOnly",
                  "No live reviews were found yet. These sample cards are editor-only.",
                )}
              </p>
            )}
            {reviewCount > 0 && !showFallbackReviews && (
              <p className="fb-review-summary">
                {typeof averageRating === "number" ? (
                  <>
                    <span>{averageRating.toFixed(1)}</span>
                    <span className="fb-stars">{"★".repeat(5)}</span>
                  </>
                ) : (
                  <></>
                )}
                {typeof averageRating === "number" && reviewCount ? (
                  <span>|</span>
                ) : (
                  <></>
                )}
                {reviewCount ? (
                  <span>
                    {t("reviews", "{{count}} Reviews", { count: reviewCount })}
                  </span>
                ) : (
                  <></>
                )}
              </p>
            )}
            {reviewItems.length > 0 && (
              <EntityField
                displayName={pt("recentHeading", "Recent Heading")}
                fieldId={props.reviews.recentHeading.text.field}
                constantValueEnabled={
                  props.reviews.recentHeading.text.constantValueEnabled
                }
              >
                <p
                  className="fb-recent-heading"
                  style={{
                    ...props.reviews.recentHeading.styles,
                    color: getThemeColorCssValue(
                      props.reviews.recentHeading.fontColor,
                    ),
                  }}
                >
                  {recentHeading}
                </p>
              </EntityField>
            )}
            <div className="fb-review-grid">
              {reviewItems.map((review, index) => {
                const reviewDate = formatReviewDate(review.reviewDate, locale);
                const responseDate = formatReviewDate(
                  review.comments?.[0]?.commentDate,
                  locale,
                );

                return (
                  <Background
                    background={props.section.cardBackgroundColor}
                    className="fb-review-card"
                    key={`${review.authorName ?? "review"}-${index}`}
                  >
                    <div className="fb-review-head">
                      <div className="fb-review-author">
                        <span
                          className="fb-review-avatar"
                          style={{
                            backgroundColor: "var(--colors-palette-primary)",
                            color: "var(--colors-palette-primary-contrast)",
                          }}
                        >
                          {(review.authorName ?? "R").charAt(0)}
                        </span>
                        <div>
                          <h3>{review.authorName}</h3>
                          {reviewDate ? (
                            <time dateTime={review.reviewDate}>
                              {reviewDate}
                            </time>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                    {typeof review.rating === "number" ? (
                      <p className="fb-review-stars-line">
                        <span>{review.rating.toFixed(1)}</span>
                        <span className="fb-stars">{"★".repeat(5)}</span>
                      </p>
                    ) : (
                      <></>
                    )}
                    {review.content ? <p>{review.content}</p> : <></>}
                    {review.comments?.[0]?.content ? (
                      <div className="fb-review-response">
                        <strong>
                          {t("responseFromTheOwner", "Response from the owner")}
                        </strong>
                        {responseDate ? (
                          <time dateTime={review.comments[0].commentDate}>
                            {responseDate}
                          </time>
                        ) : (
                          <></>
                        )}
                        <p>{review.comments[0].content}</p>
                      </div>
                    ) : (
                      <></>
                    )}
                  </Background>
                );
              })}
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantReviewsSection: YextComponentConfig<
  ReviewsSectionProps,
  typeof reviewsFields
> =
  {
    label: msg("components.reviewsLabel", "Reviews"),
    fields: reviewsFields,
    defaultProps,
    render: (props) => <ReviewsSection {...props} />,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantReviewsSection",
  displayName: "Reviews",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
