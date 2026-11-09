import "../shared/typography.css";
import {
  defaultTextStyles,
  makeRtfField,
  makeText,
  renderRichText,
  type StyledTextProps,
} from "../shared/sectionHelpers";
import type { WithId, WithPuckProps } from "@puckeditor/core";
import type { SectionConfig } from "@yext/visual-editor";
import { getThemeColorCssValue, msg, pt } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  EntityField,
  VisibilityWrapper,
  createItemSource,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  type YextTransformedProps,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

type FaqItemProps = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqItemsSource = createItemSource<FaqItemProps>({
  label: msg("fields.faqItems", "FAQ Items"),
  mappingFields: {
    question: {
      type: "entityField",
      label: msg("fields.question", "Question"),
      filter: {
        types: ["type.string"],
      },
    },
    answer: {
      type: "entityField",
      label: msg("fields.answer", "Answer"),
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
  defaultValues: [
    {
      question: {
        field: "",
        constantValue: "Are your dining hours the same as your take-out hours?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "Not always. Our takeout and delivery service may remain available slightly later than dine-in seating, especially on weekends. For the most accurate hours, we recommend checking our online ordering page or giving our [[geomodifier]] location a quick call before placing your order.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Can I order online?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "[[name]] offers online ordering for takeout, curbside pickup, and delivery throughout [[geomodifier]] [[address.city]] and surrounding neighborhoods. Delivery is available through select third-party partners including DoorDash, Uber Eats, and Postmates.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Does this location take reservations?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "Yes. We accept reservations for parties of up to 6 guests based on availability. Larger groups, birthday dinners, and private dining inquiries can be arranged by contacting our group events coordinator directly. Weekend brunch reservations are highly recommended.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you have a kids menu?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "Absolutely. Our kids menu includes favorites like cheeseburgers, grilled chicken tenders, mac & cheese, and buttered pasta, all served with your choice of fries or fresh fruit and a fountain drink. We also offer kid-friendly dessert options during brunch and dinner service.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you offer vegetarian or gluten-free options?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "[[name]] offers several vegetarian-friendly menu items, including plant-based burgers, salads, and shareable appetizers. Gluten-free buns are available upon request, and our team is happy to help accommodate dietary preferences whenever possible.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Is there parking available?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "Complimentary parking is available onsite, with additional street parking nearby along [[address.line1]]. Ride-share drop-off is also convenient for guests visiting from [[address.city]].",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you serve brunch?",
        constantValueEnabled: true,
      },
      answer: makeRtfField(
        "Brunch is served on weekends and features signature burgers, breakfast plates, cocktails, and coffee service. It’s a popular time for groups, so reservations are recommended when available.",
      ),
    },
  ],
});

type FaqSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  faqs: {
    items: typeof faqItemsSource.value;
    styles: {
      question: { styles: StyledTextValue; fontColor?: ThemeColor };
      answer: { styles: StyledTextValue; fontColor?: ThemeColor };
    };
  };
};

const defaultProps: FaqSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: {
      selectedColor: "white",
      contrastingColor: "black",
    },
  },
  heading: makeText("FAQs"),
  faqs: {
    items: faqItemsSource.defaultValue,
    styles: {
      question: { styles: defaultTextStyles, fontColor: undefined },
      answer: { styles: defaultTextStyles, fontColor: undefined },
    },
  },
};

type FaqSectionRenderProps = WithId<
  WithPuckProps<YextTransformedProps<FaqSectionProps, typeof faqFields>>
>;

const faqFields = {
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
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.string"],
        },
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
  faqs: {
    label: msg("fields.faqs", "FAQs"),
    type: "object",
    objectFields: {
      items: faqItemsSource.field,
      styles: {
        label: msg("fields.styles", "Styles"),
        type: "object",
        objectFields: {
          question: {
            label: msg("fields.question", "Question"),
            type: "object",
            objectFields: {
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
          answer: {
            label: msg("fields.answer", "Answer"),
            type: "object",
            objectFields: {
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
    },
  },
} satisfies YextFields<FaqSectionProps>;

const UpscaleRestaurantCss = `
.fb-faq-shell * { box-sizing: border-box; }
.fb-faq-shell .fb-section {
  padding-block: var(--padding-pageSection-verticalPadding);
}
.fb-faq-shell .fb-container {
  width: 100%;
  max-width: var(--maxWidth-pageSection-contentWidth);
  padding-inline: var(--padding-pageSection-horizontalPadding, 24px);
  margin: 0 auto;
}
.fb-faq-list {
  display: grid;
  gap: 12px;
}
.fb-faq-item {
  border: 1px solid currentColor;
  border-radius: 10px;
  overflow: hidden;
}
.fb-faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 18px 48px 18px 20px;
  position: relative;
}
.fb-faq-item summary::-webkit-details-marker {
  display: none;
}
.fb-faq-item summary::after {
  content: "+";
  position: absolute;
  right: 20px;
}
.fb-faq-item[open] summary::after {
  content: "-";
}
.fb-faq-answer {
  margin: 0;
  padding: 0 20px 18px;
}
`;

const FaqSection: React.FC<FaqSectionRenderProps> = (props) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingColor = getThemeColorCssValue(props.heading.fontColor);
  const headingStyle: React.CSSProperties = {
    ...props.heading.styles,
    marginBottom: "28px",
    color: headingColor,
  };
  const faqItems = faqItemsSource.resolveItems(
    props.faqs.items,
    streamDocument,
  );
  const questionStyle: React.CSSProperties = {
    ...props.faqs.styles.question.styles,
    color: getThemeColorCssValue(props.faqs.styles.question.fontColor),
  };
  const answerRichTextStyles = {
    ...props.faqs.styles.answer.styles,
    color: getThemeColorCssValue(props.faqs.styles.answer.fontColor),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        background={props.section.backgroundColor}
        className="fb-faq-shell"
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section">
          <div className="fb-container">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2 style={headingStyle}>{resolvedHeading}</h2>
            </EntityField>
            <EntityField
              displayName={pt("faqItems", "FAQ Items")}
              fieldId={props.faqs.items.field}
              constantValueEnabled={props.faqs.items.constantValueEnabled}
            >
              <div className="fb-faq-list">
                {faqItems.map((item, index) => {
                  if (!item.question || !item.answer) {
                    return;
                  }
                  const question = resolveComponentData(
                    item.question,
                    locale,
                    streamDocument,
                  ) as string;
                  const answer = resolveComponentData(
                    item.answer,
                    locale,
                    streamDocument,
                    { color: props.faqs.styles.answer.fontColor },
                  );

                  return (
                    <details
                      key={`${question}-${index}`}
                      className="fb-faq-item"
                    >
                      <summary>
                        <span style={questionStyle}>{question}</span>
                      </summary>
                      <div className="fb-faq-answer">
                        {renderRichText(answer, answerRichTextStyles)}
                      </div>
                    </details>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </Background>
    </VisibilityWrapper>
  );
};

export const UpscaleRestaurantFaqSection: YextComponentConfig<
  FaqSectionProps,
  typeof faqFields
> =
  {
    label: msg("components.faqLabel", "FAQ"),
    fields: faqFields,
    defaultProps,
    render: (props) => <FaqSection {...props} />,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFaqSection",
  displayName: "FAQ",
  description: "FAQ Section",
  pageSetTypes: ["ENTITY"],
};
