/**
 * Inline Markdown for slide text.
 *
 * Slide text elements accept a small, predictable inline subset — bold,
 * italic, inline code and links — so the deck builder can use *emphasis*
 * without hand-authoring HTML. Everything else is HTML-escaped, so the output
 * is safe to inject with `dangerouslySetInnerHTML` or into an export document.
 *
 * Newlines are preserved verbatim; the shared stylesheet's `white-space:
 * pre-line` turns them into line breaks.
 */

// Ordered alternatives: inline code, bold, italic, then links.
const INLINE_PATTERN =
  /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;

/** Escape a raw text run for safe HTML output. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineToken(token: string): string {
  if (token.startsWith("`")) {
    return `<code>${escapeHtml(token.slice(1, -1))}</code>`;
  }
  if (token.startsWith("**") || token.startsWith("__")) {
    return `<strong>${inlineMarkdownToHtml(token.slice(2, -2))}</strong>`;
  }
  if (token.startsWith("*") || token.startsWith("_")) {
    return `<em>${inlineMarkdownToHtml(token.slice(1, -1))}</em>`;
  }
  const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
  if (link) {
    return `<a href="${escapeHtml(link[2]!)}" target="_blank" rel="noreferrer">${inlineMarkdownToHtml(
      link[1]!
    )}</a>`;
  }
  return escapeHtml(token);
}

/** Convert the inline Markdown subset used by slide text into safe HTML. */
export function inlineMarkdownToHtml(text: string): string {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const token = match[0]!;
    const index = match.index ?? 0;
    if (index > last) html += escapeHtml(text.slice(last, index));
    html += inlineToken(token);
    last = index + token.length;
  }
  if (last < text.length) html += escapeHtml(text.slice(last));
  return html;
}

/**
 * Remove inline Markdown markers so plain-text measurement (word counts, text
 * height estimates) matches what the renderer actually draws.
 */
export function stripInlineMarkdown(text: string): string {
  return text.replace(INLINE_PATTERN, (token) => {
    if (token.startsWith("`")) return token.slice(1, -1);
    if (token.startsWith("**") || token.startsWith("__")) return token.slice(2, -2);
    if (token.startsWith("*") || token.startsWith("_")) return token.slice(1, -1);
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    return link ? link[1]! : token;
  });
}
