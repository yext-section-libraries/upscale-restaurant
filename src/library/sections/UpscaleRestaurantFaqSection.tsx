import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  EntityField,
  MaybeRTF,
  VisibilityWrapper,
  createItemSource,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
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

type FaqItemProps = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const toCssColor = (color?: ThemeColor): string | undefined =>
  getThemeColorCssValue(color);

const makeText = (text: string): StyledTextProps => ({
  text: {
    field: "",
    constantValue: text,
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeFaqAnswerText = (
  text: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(text),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

const faqItemsSource = createItemSource<FaqItemProps>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: {
        types: ["type.string"],
      },
    },
    answer: {
      type: "entityField",
      label: "Answer",
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
      answer: makeFaqAnswerText(
        "Not always. Our takeout and delivery service may remain available slightly later than dine-in seating, especially on weekends. For the most accurate hours, we recommend checking our online ordering page or giving our [[geomodifier]] location a quick call before placing your order.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Can I order online?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
        "[[name]] offers online ordering for takeout, curbside pickup, and delivery throughout [[geomodifier]] [[address.city]] and surrounding neighborhoods. Delivery is available through select third-party partners including DoorDash, Uber Eats, and Postmates.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Does this location take reservations?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
        "Yes. We accept reservations for parties of up to 6 guests based on availability. Larger groups, birthday dinners, and private dining inquiries can be arranged by contacting our group events coordinator directly. Weekend brunch reservations are highly recommended.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you have a kids menu?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
        "Absolutely. Our kids menu includes favorites like cheeseburgers, grilled chicken tenders, mac & cheese, and buttered pasta, all served with your choice of fries or fresh fruit and a fountain drink. We also offer kid-friendly dessert options during brunch and dinner service.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you offer vegetarian or gluten-free options?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
        "[[name]] offers several vegetarian-friendly menu items, including plant-based burgers, salads, and shareable appetizers. Gluten-free buns are available upon request, and our team is happy to help accommodate dietary preferences whenever possible.",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Is there parking available?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
        "Complimentary parking is available onsite, with additional street parking nearby along [[address.line1]]. Ride-share drop-off is also convenient for guests visiting from [[address.city]].",
      ),
    },
    {
      question: {
        field: "",
        constantValue: "Do you serve brunch?",
        constantValueEnabled: true,
      },
      answer: makeFaqAnswerText(
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

const faqFields: YextFields<FaqSectionProps> = {
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
  faqs: {
    label: "FAQs",
    type: "object",
    objectFields: {
      items: faqItemsSource.field,
      styles: {
        label: "Styles",
        type: "object",
        objectFields: {
          question: {
            label: "Question",
            type: "object",
            objectFields: {
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
          answer: {
            label: "Answer",
            type: "object",
            objectFields: {
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
    },
  },
};

const UpscaleRestaurantCss = `
.fb-faq-shell {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
}
.fb-faq-shell * { box-sizing: border-box; }
.fb-faq-shell p,
.fb-faq-shell li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.fb-faq-shell h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.fb-faq-shell h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-faq-shell h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.fb-faq-shell h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.fb-faq-shell h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.fb-faq-shell h6 {
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
  width: min(980px, calc(100% - 48px));
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
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: 19px;
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
@media (max-width: 760px) {
  .fb-section {
    padding-block: 72px;
  }
}
`;

const FaqSection: PuckComponent<FaqSectionProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingColor = toCssColor(props.heading.fontColor);
  const headingStyle: React.CSSProperties = {
    fontFamily:
      props.heading.styles.fontFamily === "default"
        ? undefined
        : props.heading.styles.fontFamily,
    fontSize:
      props.heading.styles.fontSize === "default"
        ? undefined
        : props.heading.styles.fontSize,
    fontWeight:
      props.heading.styles.fontWeight === "default"
        ? undefined
        : props.heading.styles.fontWeight,
    fontStyle:
      props.heading.styles.fontStyle === "default"
        ? undefined
        : props.heading.styles.fontStyle,
    textTransform:
      props.heading.styles.textTransform === "default"
        ? undefined
        : props.heading.styles.textTransform,
    marginBottom: "28px",
    color: headingColor,
  };
  const faqItems = faqItemsSource.resolveItems(
    props.faqs.items,
    streamDocument,
  );
  const questionStyle: React.CSSProperties = {
    fontFamily:
      props.faqs.styles.question.styles.fontFamily === "default"
        ? undefined
        : props.faqs.styles.question.styles.fontFamily,
    fontSize:
      props.faqs.styles.question.styles.fontSize === "default"
        ? undefined
        : props.faqs.styles.question.styles.fontSize,
    fontWeight:
      props.faqs.styles.question.styles.fontWeight === "default"
        ? undefined
        : props.faqs.styles.question.styles.fontWeight,
    fontStyle:
      props.faqs.styles.question.styles.fontStyle === "default"
        ? undefined
        : props.faqs.styles.question.styles.fontStyle,
    textTransform:
      props.faqs.styles.question.styles.textTransform === "default"
        ? undefined
        : props.faqs.styles.question.styles.textTransform,
    color: toCssColor(props.faqs.styles.question.fontColor),
  };
  const answerRichTextStyles = {
    ...props.faqs.styles.answer.styles,
    color: toCssColor(props.faqs.styles.answer.fontColor),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck?.isEditing ?? false}
    >
      <Background
        background={props.section.backgroundColor}
        className="fb-faq-shell"
        style={sectionSurfaceStyle}
      >
        <style>{UpscaleRestaurantCss}</style>
        <section className="fb-section">
          <div className="fb-container">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2 style={headingStyle}>{resolvedHeading}</h2>
            </EntityField>
            <EntityField
              displayName="FAQ Items"
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
                    {
                      richTextStyleOverrides: answerRichTextStyles,
                    },
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
                        {typeof answer === "string" ? (
                          <MaybeRTF
                            data={answer}
                            richTextStyleOverrides={answerRichTextStyles}
                          />
                        ) : React.isValidElement(answer) ? (
                          answer
                        ) : null}
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

export const UpscaleRestaurantFaqSection: YextComponentConfig<FaqSectionProps> =
  {
    label: "FAQ Section",
    fields: faqFields,
    defaultProps,
    render: FaqSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantFaqSection",
  displayName: "FAQ Section",
  description: "FAQ Section",
  pageSetTypes: ["ENTITY"],
};
