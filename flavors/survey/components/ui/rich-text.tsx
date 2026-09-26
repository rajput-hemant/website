import Link from "next/link";
import { cn } from "@/flavors/survey/lib/utils";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
} from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";

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
          className="underline decoration-contour underline-offset-[0.3em] fine:hover:text-water"
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
      <code className="bg-sheet px-1 py-0.5 font-sans text-[0.9em] tabular-nums">
        {children}
      </code>
    ),
  },
};

/** CMS copy at a reading measure. */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue;
  className?: string;
}) {
  if (value.length === 0) return null;
  return (
    <div className={cn("max-w-[64ch] [&_p+p]:mt-4", className)}>
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
