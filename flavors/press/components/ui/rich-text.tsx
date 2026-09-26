import Link from "next/link";
import { cn, route } from "@/flavors/press/lib/utils";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

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
          href={route(href)}
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
  className?: string;
}) {
  if (value.length === 0) return null;
  return (
    <div className={cn("max-w-[62ch] [&_p+p]:mt-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
