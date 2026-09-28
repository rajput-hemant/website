import Link from "next/link";
import { cn } from "@/flavors/calibre/lib/utils";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";

import { ExternalLink } from "./external-link";

const isInternal = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

/** A link mark's `href`, or "" when the mark carries none. */
const linkHref = (value: unknown): string =>
  typeof value === "object" &&
  value !== null &&
  "href" in value &&
  typeof value.href === "string"
    ? value.href
    : "";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = linkHref(value);
      if (!href) return <>{children}</>;
      return isInternal(href) ? (
        <Link
          href={href}
          className="underline decoration-steel underline-offset-[0.22em] fine:hover:decoration-2"
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
      <code className="rounded-[2px] bg-raise px-1 font-spec text-[0.95em] tracking-[0.04em]">
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
