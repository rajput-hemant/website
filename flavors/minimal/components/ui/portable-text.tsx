import Link from "next/link";
import { ExternalLink } from "@/flavors/minimal/components/ui/external-link";
import { cn } from "@/flavors/minimal/lib/utils";
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponents,
  type PortableTextMarkComponent,
} from "@portabletext/react";

import type { RichText as RichTextValue } from "@/lib/data/types";

const isInternal = (href: string) =>
  href.startsWith("/") || href.startsWith("#");

/** A link annotation as stored in the CMS; `href` is checked before use. */
type LinkMark = { _type: "link"; href?: unknown };

const LinkMarkRenderer: PortableTextMarkComponent<LinkMark> = ({
  value,
  children,
}) => {
  const href = typeof value?.href === "string" ? value.href : "";
  if (!href) return <>{children}</>;
  return isInternal(href) ? (
    <Link href={href} className="link">
      {children}
    </Link>
  ) : (
    <ExternalLink href={href} arrow={false}>
      {children}
    </ExternalLink>
  );
};

const components: PortableTextComponents = {
  marks: { link: LinkMarkRenderer },
};

/** Renders CMS rich text with the site's `.prose` styles. */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue;
  className?: string;
}) {
  if (value.length === 0) return null;

  return (
    <div className={cn("prose", className)}>
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
