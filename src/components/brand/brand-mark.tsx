import type { SVGProps } from "react";

export function BrandGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <g>
        <rect x="4" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
        <rect x="8.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
        <rect x="13" y="6" width="2.5" height="20" rx="1.25" fill="currentColor" />
        <rect x="17.5" y="10" width="2.5" height="12" rx="1.25" fill="currentColor" opacity="0.75" />
        <rect x="22" y="13" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.5" />
        <circle cx="27" cy="7" r="1.8" fill="currentColor" opacity="0.9" />
      </g>
    </svg>
  );
}
