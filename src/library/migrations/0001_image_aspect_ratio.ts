import type { Migration } from "@yext/visual-editor";

export const imageAspectRatio: Migration = {
  UpscaleRestaurantAboutSection: {
    action: "updated",
    propTransformation: (props) => {
      const { aspectRatio, ...image } = props.about.image;
      return {
        ...props,
        about: {
          ...props.about,
          image: {
            ...image,
            styles: {
              ...(aspectRatio !== undefined ? { aspectRatio } : {}),
              ...image.styles,
            },
          },
        },
      };
    },
  },
  UpscaleRestaurantOfferingsSection: {
    action: "updated",
    propTransformation: (props) => {
      const { aspectRatio, ...image } = props.offerings.image;
      return {
        ...props,
        offerings: {
          ...props.offerings,
          image: {
            ...image,
            styles: {
              ...(aspectRatio !== undefined ? { aspectRatio } : {}),
              ...image.styles,
            },
          },
        },
      };
    },
  },
};
