export type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "rule" };

export type InlineNode =
  | { type: "text"; text: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: InlineNode[] };

// Ordered alternatives: inline code, bold, italic, then links.
const INLINE_PATTERN =
  /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;

function parseInlineToken(token: string): InlineNode {
  if (token.startsWith("`")) return { type: "code", text: token.slice(1, -1) };
  if (token.startsWith("**") || token.startsWith("__")) {
    return { type: "strong", children: parseInline(token.slice(2, -2)) };
  }
  if (token.startsWith("*") || token.startsWith("_")) {
    return { type: "em", children: parseInline(token.slice(1, -1)) };
  }
  const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
  if (link) {
    return { type: "link", href: link[2]!, children: parseInline(link[1]!) };
  }
  return { type: "text", text: token };
}

/** Parse inline Markdown (bold, italic, inline code, links) into a small node tree. */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > last) nodes.push({ type: "text", text: text.slice(last, index) });
    nodes.push(parseInlineToken(token));
    last = index + token.length;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
}

/** Parse the small, predictable Markdown subset used by note.md. */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];
  let code: { language: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: "quote", text: quote.join("\n").trim() });
      quote = [];
    }
  };

  for (const line of lines) {
    const fence = /^\s*```\s*([\w-]*)\s*$/.exec(line);
    if (code) {
      if (fence) {
        blocks.push({ type: "code", language: code.language, code: code.lines.join("\n") });
        code = null;
      } else {
        code.lines.push(line);
      }
      continue;
    }
    if (fence) {
      flushParagraph();
      flushList();
      flushQuote();
      code = { language: fence[1] ?? "", lines: [] };
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: "heading", level: heading[1]!.length, text: heading[2]! });
      continue;
    }
    if (/^\s*(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: "rule" });
      continue;
    }
    const listItem = /^\s*([-+*]|\d+[.)])\s+(.+?)\s*$/.exec(line);
    if (listItem) {
      flushParagraph();
      flushQuote();
      const ordered = /^\d/.test(listItem[1]!);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(listItem[2]!);
      continue;
    }
    if (/^\s*>/.test(line)) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^\s*>\s?/, ""));
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line);
  }

  if (code) blocks.push({ type: "code", language: code.language, code: code.lines.join("\n") });
  flushParagraph();
  flushList();
  flushQuote();
  return blocks;
}
