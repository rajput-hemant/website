import Link from "next/link";
import { cn } from "@/flavors/mission/lib/utils";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";
import { isInternalHref, safeHref } from "@/lib/safe-href";

import { ExternalLink } from "./external-link";

/** A link mark's `href` if `safeHref` accepts it, or "" otherwise. */
const linkHref = (value: unknown): string =>
  typeof value === "object" && value !== null && "href" in value
    ? (safeHref(value.href) ?? "")
    : "";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = linkHref(value);
      if (!href) return <>{children}</>;
      return isInternalHref(href) ? (
        <Link href={href} className="rule-link">
          {children}
        </Link>
      ) : (
        <ExternalLink href={href} arrow={false}>
          {children}
        </ExternalLink>
      );
    },
    code: ({ children }) => (
      <code className="rounded-none bg-sunk px-1 font-mono text-[0.85em]">
        {children}
      </code>
    ),
  },
};

/** CMS copy at the reading measure. */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue;
  className?: string | undefined;
}) {
  if (value.length === 0) return null;
  return (
    <div className={cn("max-w-[64ch] [&_p+p]:mt-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
