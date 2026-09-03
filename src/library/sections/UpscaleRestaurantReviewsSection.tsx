import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  EntityField,
  VisibilityWrapper,
  getAggregateRating,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

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

const defaultProps: ReviewsSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: makeThemeColor(
      "palette-tertiary",
      "palette-tertiary-contrast",
    ),
    cardBackgroundColor: makeThemeColor("white", "black"),
  },
  reviews: {
    heading: makeText("Reviews"),
    recentHeading: makeText("Recent Reviews:"),
  },
};

const reviewsFields: YextFields<ReviewsSectionProps> = {
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
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  reviews: {
    label: "Reviews",
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
      recentHeading: {
        label: "Recent Heading",
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
    },
  },
};

const UpscaleRestaurantCss = `
.fb-reviews-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-reviews-shell * { box-sizing: border-box; }
.fb-reviews-shell p,
.fb-reviews-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-reviews-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-reviews-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-reviews-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-reviews-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-reviews-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-reviews-shell h6 {
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
.fb-tint-section {
  background: var(--fb-tint-bg);
}
.fb-wide-container {
  width: min(1540px, calc(100% - 48px));
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
  font-size: 16px;
}
.fb-stars {
  color: var(--fb-stars);
  letter-spacing: 0.04em;
}
.fb-recent-heading {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
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
  font-weight: 700;
}
.fb-review-card h3 {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: 15px;
  font-weight: 700;
}
.fb-review-card time {
  color: currentColor;
  opacity: 0.7;
  font-size: 12px;
}
.fb-review-card p {
  margin: 0;
}
.fb-review-author p {
  color: currentColor;
  opacity: 0.7;
  font-size: 12px;
}
.fb-review-stars-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 8px !important;
  font-weight: 700;
}
.fb-review-response {
  border-left: 3px solid var(--fb-primary);
  margin-top: 14px;
  padding-left: 12px;
}
.fb-review-response strong {
  display: block;
  font-size: 13px;
}
@media (max-width: 1100px) {
  .fb-review-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
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
    authorName: "Jordan",
    rating: 5,
    reviewDate: "2025-03-18",
    content:
      "The burger was excellent and the service felt polished without being stiff.",
    comments: [
      {
        commentDate: "2025-03-20",
        content: "Thanks for stopping by. We hope to see you again soon.",
      },
    ],
  },
  {
    authorName: "Avery",
    rating: 4.8,
    reviewDate: "2025-02-07",
    content:
      "Great cocktails, great fries, and a really comfortable room for a long dinner.",
  },
];

const ReviewsSection = (props: ReviewsSectionProps): React.ReactElement => {
  const streamDocument = useDocument<StreamDocumentWithReviews>();
  const locale = streamDocument.locale ?? "en";
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
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const pageStyle: ReviewsStyle = {
    ...sectionSurfaceStyle,
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
              displayName="Heading"
              fieldId={props.reviews.heading.text.field}
              constantValueEnabled={
                props.reviews.heading.text.constantValueEnabled
              }
            >
              <h2
                style={{
                  color: getThemeColorCssValue(props.reviews.heading.fontColor),
                  textAlign: "center",
                }}
              >
                {heading}
              </h2>
            </EntityField>
            {showFallbackReviews && (
              <p>
                No live reviews were found yet. These sample cards are
                editor-only.
              </p>
            )}
            {reviewCount > 0 && !showFallbackReviews && (
              <p className="fb-review-summary">
                {typeof averageRating === "number" ? (
                  <>
                    <span>{averageRating.toFixed(1)}</span>
                    <span className="fb-stars">★★★★★</span>
                  </>
                ) : (
                  <></>
                )}
                {typeof averageRating === "number" && reviewCount ? (
                  <span>|</span>
                ) : (
                  <></>
                )}
                {reviewCount ? <span>{`${reviewCount} Reviews`}</span> : <></>}
              </p>
            )}
            {reviewItems.length > 0 && (
              <EntityField
                displayName="Recent Heading"
                fieldId={props.reviews.recentHeading.text.field}
                constantValueEnabled={
                  props.reviews.recentHeading.text.constantValueEnabled
                }
              >
                <p
                  className="fb-recent-heading"
                  style={{
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
                        <span className="fb-stars">★★★★★</span>
                      </p>
                    ) : (
                      <></>
                    )}
                    {review.content ? <p>{review.content}</p> : <></>}
                    {review.comments?.[0]?.content ? (
                      <div className="fb-review-response">
                        <strong>Response from the owner</strong>
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

export const UpscaleRestaurantReviewsSection: YextComponentConfig<ReviewsSectionProps> =
  {
    label: "Reviews Section",
    fields: reviewsFields,
    defaultProps,
    render: ReviewsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantReviewsSection",
  displayName: "Reviews Section",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
