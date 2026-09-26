import Link from "next/link";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";
import { cn } from "@/lib/utils";

import { ExternalLink } from "./external-link";

const isInternal = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "";
      if (!href) return <>{children}</>;
      return isInternal(href) ? (
        <Link
          href={href}
          className="text-accent underline decoration-hairline underline-offset-[0.22em]"
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
      <code className="rounded-sm bg-ink-sunken px-1 py-0.5 font-mono text-sm">
        {children}
      </code>
    ),
  },
};

export type RichTextProps = {
  value: RichTextValue;
  className?: string;
};

/** Portable Text renderer for CMS copy, styled to the prose measure. */
export function RichText({ value, className }: RichTextProps) {
  if (value.length === 0) return null;

  return (
    <div
      className={cn(
        "prose max-w-[64ch] text-base text-paper [&_p+p]:mt-4",
        className
      )}
    >
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
