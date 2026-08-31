import type { SVGProps } from "react";

const FORMAT_META = {
  PDF: { color: "#E5252A", label: "PDF" },
  PPTX: { color: "#D35230", label: "PPTX" },
  HTML: { color: "#E44D26", label: "HTML" },
} as const;

export type FileFormat = keyof typeof FORMAT_META;

export function FileTypeIcon({
  format,
  size = 20,
  ...props
}: { format: FileFormat; size?: number } & SVGProps<SVGSVGElement>) {
  const meta = FORMAT_META[format];
  const fontSize = meta.label.length > 3 ? 5.5 : 7;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 2.75h7.5L19 8.25v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.75V4.25A1.5 1.5 0 0 1 6 2.75Z"
        fill={meta.color}
      />
      <path d="M13.5 2.75V8.25H19Z" fill="rgba(0,0,0,0.24)" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fill="#fff"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {meta.label}
      </text>
    </svg>
  );
}
