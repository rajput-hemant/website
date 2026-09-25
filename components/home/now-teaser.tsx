import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Now } from "@/lib/data/types";
import { formatDate, toDateTime } from "@/lib/format";
import { ExternalLink } from "@/components/ui/external-link";

import { HomeSection } from "./home-section";

const TEASER_ITEMS = 3;

function NowItemText({ text, link }: Now["items"][number]) {
  if (!link) return <>{text}</>;
  if (link.startsWith("/")) {
    return (
      <Link href={link} className="link">
        {text}
      </Link>
    );
  }
  // Keep the last word with the arrow so the arrow never wraps onto a line alone.
  const breakAt = text.lastIndexOf(" ") + 1;
  return (
    <ExternalLink
      href={link}
      underline={false}
      arrow={false}
      className="transition-colors hover:text-foreground"
    >
      {text.slice(0, breakAt)}
      <span className="whitespace-nowrap">
        {text.slice(breakAt)}
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.75}
          className="ml-0.5 inline-block size-[0.85em] align-[-0.06em] text-subtle transition-[translate,color] duration-200 ease-snappy group-hover/external:translate-x-[0.12em] group-hover/external:-translate-y-[0.12em] group-hover/external:text-accent"
        />
      </span>
    </ExternalLink>
  );
}

export function NowTeaser({ now }: { now: Now }) {
  const items = now.items.slice(0, TEASER_ITEMS);
  if (items.length === 0) return null;

  return (
    <HomeSection
      id="now"
      title="Now"
      link={{ href: "/now", label: "More on now" }}
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
