import type { MigrationRegistry } from "@yext/visual-editor";
import { imageAspectRatio } from "./0001_image_aspect_ratio";

export const migrationRegistry: MigrationRegistry = [imageAspectRatio];
