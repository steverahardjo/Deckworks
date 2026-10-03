import React from "react";
import {
  Document,
  Font,
  Page,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { join } from "node:path";
import type { Element, Presentation, Theme } from "@deckworks/core";

const FONT_DIR =
  process.env.DECKWORKS_FONTS_DIR ?? join(import.meta.dir, "../assets/fonts");

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;
  Font.register({ family: "Anthropic", src: join(FONT_DIR, "AnthropicSans-Text-Regular-Static.otf") });
  Font.register({ family: "Anthropic", src: join(FONT_DIR, "AnthropicSans-Text-Medium-Static.otf"), fontWeight: 500 });
  Font.register({ family: "Anthropic", src: join(FONT_DIR, "AnthropicSans-Text-Semibold-Static.otf"), fontWeight: 600 });
  Font.register({ family: "Anthropic", src: join(FONT_DIR, "AnthropicSans-Text-Bold-Static.otf"), fontWeight: 700 });
  Font.register({ family: "Anthropic", src: join(FONT_DIR, "AnthropicSans-Text-Light-Static.otf"), fontWeight: 300 });
}

function SlideElement({ element, theme }: { element: Element; theme: Theme }) {
  const { x, y } = element.position;
  const { width, height } = element.size;
  const base = {
    position: "absolute" as const,
    left: x,
    top: y,
    width,
    height,
  };
  const text = String(element.properties.text ?? "");

  switch (element.type) {
    case "title":
      return (
        <Text
          style={{
            ...base,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.1,
            color: theme.foreground,
            fontFamily: "Anthropic",
          }}
        >
          {text}
        </Text>
      );
    case "subtitle":
      return (
        <Text
          style={{
            ...base,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.1,
            color: theme.muted,
            fontFamily: "Anthropic",
          }}
        >
          {text}
        </Text>
      );
    case "body": {
      const lines = text.split("\n");
      return (
        <Text
          style={{
            ...base,
            fontSize: 20,
            lineHeight: 1.6,
            color: theme.muted,
            fontFamily: "Anthropic",
          }}
        >
          {lines.map((line, i) => (
            <Text key={i}>
              {line}
              {i < lines.length - 1 ? "\n" : ""}
            </Text>
          ))}
        </Text>
      );
    }
    case "chart":
      return (
        <View
          style={{
            ...base,
            borderWidth: 2,
            borderColor: theme.accent,
            borderStyle: "solid",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.muted, fontSize: 18, fontFamily: "Anthropic" }}>
            Chart
          </Text>
        </View>
      );
    default:
      return null;
  }
}

function SlidePage({ presentation }: { presentation: Presentation }) {
  const { theme, dimensions, slides, metadata } = presentation;
  return (
    <Document title={metadata.title} author={metadata.author} creator="Deckworks">
      {slides.map((slide) => (
        <Page
          key={slide.id}
          size={[dimensions.width, dimensions.height]}
          style={{
            backgroundColor: theme.background,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {slide.elements.map((el) => (
            <SlideElement key={el.id} element={el} theme={theme} />
          ))}
        </Page>
      ))}
    </Document>
  );
}

export async function renderPresentationPdf(
  presentation: Presentation
): Promise<Uint8Array> {
  registerFonts();
  return renderToBuffer(<SlidePage presentation={presentation} />);
}
