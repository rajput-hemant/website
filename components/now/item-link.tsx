import Link from "next/link";

import { displayUrl } from "@/lib/url";
import { ExternalLink } from "@/components/ui";

/** A link shown as its own address: internal paths stay in the tab, others open a new one. */
export function ItemLink({ href }: { href: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className="underline decoration-rule">
      {href}
    </Link>
  ) : (
    <ExternalLink href={href}>{displayUrl(href)}</ExternalLink>
  );
}
