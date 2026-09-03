import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  VisibilityWrapper,
  getAggregateRating,
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
  background: var(--fb-review-card-bg);
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
.fb-review-card time {
  color: var(--fb-muted);
  font-size: 12px;
}
.fb-review-card p {
  margin: 0;
}
.fb-review-author p {
  color: var(--fb-muted);
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

const sampleReviewItems: NonNullable<
  NonNullable<StreamDocumentWithReviews["ref_reviewsAgg"]>[number]["topReviews"]
> = [
  {
    authorName: "Avery",
    rating: 5,
    content:
      "The burger was packed with flavor, pickup was quick, and everything arrived fresh.",
    reviewDate: "2026-01-15",
    comments: [
      {
        content: "Thanks for ordering with us. We are glad the pickup experience was smooth.",
        commentDate: "2026-01-16",
      },
    ],
  },
  {
    authorName: "Jordan",
    rating: 4.5,
    content:
      "Great fries and a really easy online ordering flow. I would order again.",
    reviewDate: "2026-02-10",
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
  const reviewItems = getReviewItems(streamDocument);
  const isUsingSampleReviews =
    reviewItems.length === 0 && Boolean(props.puck?.isEditing);
  const displayReviewItems = isUsingSampleReviews ? sampleReviewItems : reviewItems;
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const displayAverageRating = isUsingSampleReviews
    ? sampleReviewItems.reduce(
        (sum, review) => sum + (typeof review.rating === "number" ? review.rating : 0),
        0,
      ) / sampleReviewItems.length
    : averageRating;
  const displayReviewCount = isUsingSampleReviews
    ? sampleReviewItems.length
    : reviewCount;
  const hideSection = reviewItems.length === 0 && !props.puck?.isEditing;
  const pageStyle: ReviewsStyle = {
    "--fb-white-bg": "#ffffff",
    "--fb-muted": "currentColor",
    "--fb-primary": "var(--colors-palette-primary)",
    "--fb-review-card-bg":
      getThemeColorCssValue(props.section.cardBackgroundColor) ?? "currentColor",
    "--fb-stars": "var(--colors-palette-primary)",
  };

  if (hideSection) {
    return <></>;
  }

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
        <section className="fb-section fb-tint-section">
          <div className="fb-wide-container">
            <h2
              style={{
                color: getThemeColorCssValue(props.reviews.heading.fontColor),
                textAlign: "center",
              }}
            >
              {heading}
            </h2>
            {isUsingSampleReviews && (
              <p>
                Showing sample reviews in the editor. This section will stay hidden
                on the live page until first-party reviews are available.
              </p>
            )}
            {displayReviewCount > 0 && (
              <p className="fb-review-summary">
                {typeof displayAverageRating === "number" ? (
                  <>
                    <span>{displayAverageRating.toFixed(1)}</span>
                    <span className="fb-stars">★★★★★</span>
                  </>
                ) : (
                  <></>
                )}
                {typeof displayAverageRating === "number" && displayReviewCount ? (
                  <span>|</span>
                ) : (
                  <></>
                )}
                {displayReviewCount ? (
                  <span>{`${displayReviewCount} Reviews`}</span>
                ) : (
                  <></>
                )}
              </p>
            )}
            {displayReviewCount > 0 && (
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
            )}
            <div className="fb-review-grid">
              {displayReviewItems.map((review, index) => {
                const reviewDate = formatReviewDate(review.reviewDate, locale);
                const responseDate = formatReviewDate(
                  review.comments?.[0]?.commentDate,
                  locale,
                );

                return (
                  <article
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
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantOnlineOrderReviewsSection: YextComponentConfig<ReviewsSectionProps> =
  {
    label: "Reviews Section",
    fields: reviewsFields,
    defaultProps,
    render: ReviewsSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderReviewsSection",
  displayName: "Reviews Section",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
