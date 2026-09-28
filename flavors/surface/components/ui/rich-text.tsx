import Link from "next/link";
import { cn } from "@/flavors/surface/lib/utils";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";

const isInternal = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

/** A link mark's href, or "" when the mark has none. */
const hrefOf = (value: unknown): string =>
  typeof value === "object" &&
  value !== null &&
  "href" in value &&
  typeof value.href === "string"
    ? value.href
    : "";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = hrefOf(value);
      if (!href) return <>{children}</>;
      return isInternal(href) ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    },
    code: ({ children }) => <code>{children}</code>,
  },
};

/** Portable Text from the CMS, at the prose measure. */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue;
  className?: string;
}) {
  if (value.length === 0) return null;
  return (
    <div className={cn("prose-plate", className)}>
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
