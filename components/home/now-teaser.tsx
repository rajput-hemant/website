import Link from "next/link";

import type { Now } from "@/lib/data/types";
import { formatDate, toDateTime } from "@/lib/format";
import { ExternalLink } from "@/components/ui/external-link";

import { HomeSection } from "./home-section";

/** A glimpse, not a copy: /now holds the full list. */
const TEASER_ITEMS = 2;

function NowItemText({ text, link }: Now["items"][number]) {
  if (!link) return <>{text}</>;
  if (link.startsWith("/")) {
    return (
      <Link href={link} className="link">
        {text}
      </Link>
    );
  }
  return (
    <ExternalLink
      href={link}
      underline={false}
      className="transition-colors hover:text-foreground"
    >
      {text}
    </ExternalLink>
  );
}

export function NowTeaser({ now }: { now: Now }) {
  const items = now.items.slice(0, TEASER_ITEMS);
  if (items.length === 0) return null;
  const hasMore = now.items.length > items.length;

  return (
    <HomeSection
      id="now"
      title="Now"
      link={{ href: "/now", label: hasMore ? "More on now" : "About now" }}
    >
      <ul className="grid gap-4">
        {items.map((item) => (
          <li
            key={item.text}
            className="relative pl-6 text-muted before:absolute before:top-[0.85em] before:left-0 before:h-px before:w-3 before:bg-accent"
          >
            <NowItemText {...item} />
          </li>
        ))}
      </ul>
      <p className="mt-6 meta text-subtle">
        As of{" "}
        <time dateTime={toDateTime(now.updatedAt)}>
          {formatDate(now.updatedAt)}
        </time>
      </p>
    </HomeSection>
  );
}
