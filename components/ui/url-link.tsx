import Link from "next/link";

import { displayUrl } from "@/lib/url";

import { ExternalLink } from "./external-link";

/**
 * A link whose text is its own address: site paths stay in the tab as they
 * are, other URLs open in a new one, shown without the protocol.
 */
export function UrlLink({ href }: { href: string }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="link">
        {href}
      </Link>
    );
  }
  return (
    <ExternalLink href={href} className="[overflow-wrap:anywhere]">
      {displayUrl(href)}
    </ExternalLink>
  );
}
