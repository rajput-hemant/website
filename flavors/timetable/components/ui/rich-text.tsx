import Link from "next/link";
import { cn } from "@/flavors/timetable/lib/utils";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from "@portabletext/react";

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
          className="underline decoration-rule-strong decoration-2 underline-offset-[0.22em] transition-colors duration-200 fine:hover:decoration-ink"
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
      <code className="rounded-sm bg-surface px-1 py-0.5 font-mono text-[0.85em] shadow-[inset_0_0_0_1px_var(--color-rule)]">
        {children}
      </code>
    ),
  },
};

export type RichTextProps = {
  value: RichTextValue;
  className?: string | undefined;
};

/** Portable Text renderer for CMS copy, styled to the prose measure. */
export function RichText({ value, className }: RichTextProps) {
  if (value.length === 0) return null;

  return (
    <div
      className={cn("max-w-[64ch] text-base text-ink [&_p+p]:mt-4", className)}
    >
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
