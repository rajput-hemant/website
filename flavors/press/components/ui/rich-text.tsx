import Link from "next/link";
import { cn } from "@/flavors/press/lib/utils";
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
        <Link
          href={href}
          className="underline decoration-pink decoration-2 underline-offset-[0.22em] fine:hover:decoration-blue"
        >
          {children}
        </Link>
      ) : (
        <ExternalLink href={href} arrow={false}>
          {children}
        </ExternalLink>
      );
    },
    code: ({ children }) => (
      <code className="bg-shade px-1 font-mono text-[0.85em] [font-stretch:75%]">
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
    <div className={cn("max-w-[62ch] [&_p+p]:mt-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
