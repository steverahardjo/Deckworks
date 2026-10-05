import type { ElementType } from "react";

import {
  parseInline,
  parseMarkdown,
  type InlineNode,
  type MarkdownBlock,
} from "@/lib/markdown";

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "text":
            return <span key={index}>{node.text}</span>;
          case "strong":
            return (
              <strong key={index} className="font-semibold text-foreground">
                <Inline nodes={node.children} />
              </strong>
            );
          case "em":
            return (
              <em key={index} className="italic">
                <Inline nodes={node.children} />
              </em>
            );
          case "code":
            return (
              <code
                key={index}
                className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
              >
                {node.text}
              </code>
            );
          case "link":
            return (
              <a
                key={index}
                href={node.href}
                target="_blank"
                rel="noreferrer"
                className="text-ring underline underline-offset-2 hover:opacity-80"
              >
                <Inline nodes={node.children} />
              </a>
            );
        }
      })}
    </>
  );
}

function InlineText({ text }: { text: string }) {
  return <Inline nodes={parseInline(text)} />;
}

function Block({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${Math.min(block.level, 6)}` as ElementType;
      return (
        <Tag className="mt-5 text-base font-semibold tracking-tight first:mt-0">
          <InlineText text={block.text} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/85">
          <InlineText text={block.text} />
        </p>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`space-y-1 pl-5 text-sm leading-6 text-foreground/85 ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <InlineText text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-2 border-ring/50 pl-3 text-sm italic leading-6 text-muted-foreground">
          <InlineText text={block.text} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-5 text-foreground">
          <code>{block.code}</code>
        </pre>
      );
    case "rule":
      return <hr className="border-border" />;
  }
}

/** Renders the note.md Markdown subset (blocks + inline formatting). */
export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="space-y-4">
      {parseMarkdown(source).map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
