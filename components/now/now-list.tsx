import Link from "next/link";

import { type Now } from "@/lib/data/types";
import { displayUrl } from "@/lib/url";
import { RevealGroup, RevealItem } from "@/components/interaction/reveal";
import { ExternalLink } from "@/components/ui/external-link";

function ItemLink({ href }: { href: string }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="link">
        {href}
      </Link>
    );
  }
  return <ExternalLink href={href}>{displayUrl(href)}</ExternalLink>;
}

/** The current focus, as numbered statements with an optional link each. */
export function NowList({ items }: { items: Now["items"] }) {
  return (
    <RevealGroup as="ol" className="border-t border-border">
      {items.map((item, index) => (
        <RevealItem
          as="li"
          key={item.text}
          className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-border py-6 sm:grid-cols-[3rem_1fr]"
        >
          <span
            aria-hidden
            className="pt-[0.45rem] meta text-subtle tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-lg text-foreground">{item.text}</p>
            {item.link && (
              <p className="mt-2 text-sm text-muted">
                <ItemLink href={item.link} />
              </p>
            )}
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
