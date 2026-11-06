import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getDefaultRTF,
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

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: React.CSSProperties,
  className?: string,
): React.ReactNode => {
  const styleOverrides = richTextStyleOverrides ?? {};
  const typographyVariables = Object.fromEntries(
    Object.entries(styleOverrides)
      .filter(([property, setting]) => property !== "color" && setting !== undefined)
      .flatMap(([property, setting]) => [
        [`--${property}-body-${property}`, setting],
        [`--upscale-restaurant-body-${property}`, setting],
      ]),
  );

  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides && !className) {
      return value;
    }

    const element = value as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
    }>;

    // RTF descendants read typography variables rather than inheriting styles.
    // Leave default variables unset so the current theme remains authoritative.
    return React.cloneElement(element, {
      className:
        [element.props.className, className].filter(Boolean).join(" ") || undefined,
      style: {
        ...element.props.style,
        ...styleOverrides,
        ...typographyVariables,
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
      style={{ ...styleOverrides, ...typographyVariables }}
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
