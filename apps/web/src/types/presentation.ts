export type ElementType =
  | "title"
  | "subtitle"
  | "body"
  | "image"
  | "shape"
  | "chart"
  | "table"
  | "divider"
  | "callout";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Element {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  properties: Record<string, unknown>;
}

export type SlideLayout =
  | "title"
  | "title-subtitle"
  | "title-body"
  | "two-column"
  | "blank";

export interface Slide {
  id: string;
  layout: SlideLayout;
  elements: Element[];
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  font: string;
}

export interface Comment {
  id: string;
  slideId: string;
  elementId?: string;
  message: string;
  status: "open" | "resolved";
}

export interface PresentationMetadata {
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Presentation {
  metadata: PresentationMetadata;
  dimensions: Dimensions;
  theme: Theme;
  template: string;
  slides: Slide[];
  comments: Comment[];
}

export interface Preset {
  id: string;
  name: string;
  theme: Theme;
}
