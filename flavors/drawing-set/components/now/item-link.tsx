import Link from "next/link";
import { ExternalLink } from "@/flavors/drawing-set/components/ui";

import { isInternalHref } from "@/lib/safe-href";
import { displayUrl } from "@/lib/url";

/** A link shown as its own address: internal paths stay in the tab, others open a new one. */
export function ItemLink({ href }: { href: string }) {
  return isInternalHref(href) ? (
    <Link href={href} className="underline decoration-line">
      {href}
    </Link>
  ) : (
    <ExternalLink href={href}>{displayUrl(href)}</ExternalLink>
  );
}
