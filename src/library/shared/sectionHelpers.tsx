import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getDefaultRTF,
  getThemeColorCssValue,
  type MaybeRTFProps,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

export type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

export const makeThemeColor = (
  selectedColor: string,
  contrastingColor: string,
): ThemeColor => ({ selectedColor, contrastingColor });

export const makeText = (
  text: string,
  field = "",
  constantValueEnabled = field.length === 0,
): StyledTextProps => ({
  text: { field, constantValue: text, constantValueEnabled },
  styles: defaultTextStyles,
  fontColor: undefined,
});

export const makeRtfField = (
  text: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(text),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

export const makeRtf = (text: string): StyledRtfProps => ({
  text: makeRtfField(text),
  styles: defaultTextStyles,
  fontColor: undefined,
});

export const getTextStyle = (
  styles: StyledTextValue,
  color?: ThemeColor | string,
  fallbackColor?: string,
): React.CSSProperties => ({
  fontFamily:
    styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight:
    styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
  color: getThemeColorCssValue(color) ?? fallbackColor,
});

export const resolveSelectedColor = (
  color?: ThemeColor,
): string | undefined =>
  !color?.selectedColor || color.selectedColor === "default"
    ? undefined
    : getThemeColorCssValue(color);

export const hasImageSource = (
  image: unknown,
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url.trim().length > 0;
  }

  return Boolean(
    "image" in image &&
      image.image &&
      typeof image.image === "object" &&
      "url" in image.image &&
      typeof image.image.url === "string" &&
      image.image.url.trim(),
  );
};

export const isRichTextEmpty = (value: unknown): boolean => {
  if (!value) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    return typeof html !== "string" || html.trim() === "";
  }

  return false;
};

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
  className?: string,
): React.ReactNode => {
  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides && !className) {
      return value;
    }

    const element = value as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    const color = getThemeColorCssValue(richTextStyleOverrides?.color);
    const { color: _color, ...styleOverrides } = richTextStyleOverrides ?? {};

    return React.cloneElement(element, {
      className:
        [element.props.className, className].filter(Boolean).join(" ") ||
        undefined,
      style: {
        ...element.props.style,
        ...styleOverrides,
        ...(color ? { color } : {}),
      },
    });
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      className={className}
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

/** Options formerly exposed as the Visual Editor's untyped ASPECT_RATIO preset. */
export const aspectRatioOptions = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
];
