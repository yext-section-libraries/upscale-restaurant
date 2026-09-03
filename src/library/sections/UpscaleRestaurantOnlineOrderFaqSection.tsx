import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Background,
  EntityField,
  MaybeRTF,
  VisibilityWrapper,
  createItemSource,
  getDefaultForegroundColor,
  getDefaultRTF,
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
  question: {
    text: YextEntityField<TranslatableString>;
  };
  answer: {
    text: YextEntityField<TranslatableRichText>;
  };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const makeText = (text: string): StyledTextProps => ({
  text: {
    field: "",
    constantValue: text,
    constantValueEnabled: true,
  },
  styles: defaultTextStyles,
  fontColor: undefined,
});

const makeRtf = (text: string): YextEntityField<TranslatableRichText> => ({
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
      label: "Question",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.string"],
          },
        },
      },
    },
    answer: {
      label: "Answer",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.rich_text_v2"],
          },
        },
      },
    },
  },
  defaultValues: [
    {
      question: {
        text: {
          field: "",
          constantValue: "Can I order [[name]] online?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "Yes. [[name]] offers online ordering for takeout, delivery, and curbside pickup from the [[address.city]] location, making it easy to place your order ahead for lunch, dinner, or weekend brunch.",
        ),
      },
    },
    {
      question: {
        text: {
          field: "",
          constantValue: "What delivery apps deliver [[name]]?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "[[name]] at [[address.city]] is available through popular third-party delivery platforms such as DoorDash, Uber Eats, and Postmates, though app availability can vary based on your address and service hours.",
        ),
      },
    },
    {
      question: {
        text: {
          field: "",
          constantValue: "How long does [[name]] delivery take?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "Delivery times for [[name]] from [[address.city]] usually depend on order size, traffic, and demand, but most orders arrive within about 30 to 60 minutes after they are confirmed by the restaurant and delivery partner.",
        ),
      },
    },
    {
      question: {
        text: {
          field: "",
          constantValue: "Does [[name]] offer free delivery?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "[[name]] at [[address.city]] may occasionally be included in free-delivery promotions through select delivery apps, but standard delivery fees and service charges typically depend on the platform you choose and your delivery address.",
        ),
      },
    },
    {
      question: {
        text: {
          field: "",
          constantValue: "What is the minimum order for [[name]] delivery?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "The minimum order for [[name]] delivery from [[address.city]] can vary by delivery app and promotion, so the most accurate minimum subtotal will appear during checkout on the ordering platform you select.",
        ),
      },
    },
    {
      question: {
        text: {
          field: "",
          constantValue: "Can I order [[name]] for pickup?",
          constantValueEnabled: true,
        },
      },
      answer: {
        text: makeRtf(
          "Yes. [[name]] offers pickup ordering at the [[address.city]] location, including takeout and curbside pickup options for guests who want a faster, more convenient way to grab their meal.",
        ),
      },
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

type FaqStyle = React.CSSProperties & Record<`--${string}`, string>;

const defaultProps: FaqSectionProps = {
  section: {
    visibleOnLivePage: true,
    backgroundColor: {
      selectedColor: "white",
      contrastingColor: "black",
    },
  },
  heading: makeText("FAQs about Ordering Online"),
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
  const sectionForegroundColor =
    getThemeColorCssValue(
      getDefaultForegroundColor(props.section.backgroundColor, streamDocument),
    ) ?? "currentColor";
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const headingColor =
    getThemeColorCssValue(props.heading.fontColor) ?? sectionForegroundColor;
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
    color:
      getThemeColorCssValue(props.faqs.styles.question.fontColor) ??
      sectionForegroundColor,
  };
  const answerRichTextStyles = {
    ...props.faqs.styles.answer.styles,
    color:
      getThemeColorCssValue(props.faqs.styles.answer.fontColor) ??
      sectionForegroundColor,
  };
  const pageStyle: FaqStyle = {
    "--fb-card-bg":
      getThemeColorCssValue({
        selectedColor: "white",
        contrastingColor: "black",
      }) ?? "currentColor",
    "--fb-card-text": sectionForegroundColor,
    "--fb-text": sectionForegroundColor,
  };

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
        <section className="fb-section">
          <div className="fb-container">
            <h2 style={headingStyle}>{resolvedHeading}</h2>
            <EntityField
              displayName="FAQs"
              fieldId={props.faqs.items.field}
              constantValueEnabled={props.faqs.items.constantValueEnabled}
            >
              <div className="fb-faq-list">
                {faqItems.map((item, index) => {
                  if (!item.question.text || !item.answer.text) {
                    return;
                  }
                  const question = resolveComponentData(
                    item.question.text,
                    locale,
                    streamDocument,
                  ) as string;
                  const answer = resolveComponentData(
                    item.answer.text,
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

export const UpscaleRestaurantOnlineOrderFaqSection: YextComponentConfig<FaqSectionProps> =
  {
    label: "FAQ Section",
    fields: faqFields,
    defaultProps,
    render: FaqSection,
  };

export const config: SectionConfig = {
  id: "UpscaleRestaurantOnlineOrderFaqSection",
  displayName: "FAQ Section",
  description: "FAQ Section",
  pageSetTypes: ["ENTITY"],
};
