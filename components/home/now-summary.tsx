import Link from "next/link";

import type { Now } from "@/lib/data/types";
import { formatDate, toDateTime } from "@/lib/format";
import { ExternalLink } from "@/components/ui/external-link";

import { HomeSection } from "./home-section";

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

/** What the owner is focused on, as of the date /now was last updated. */
export function NowSummary({ now }: { now: Now }) {
  if (now.items.length === 0) return null;

  return (
    <HomeSection
      id="now"
      as="h3"
      title={
        <>
          Now{" "}
          <span className="text-faint" aria-hidden>
            ·
          </span>{" "}
          <time dateTime={toDateTime(now.updatedAt)}>
            <span className="sr-only">as of </span>
            {formatDate(now.updatedAt)}
          </time>
        </>
      }
      link={{ href: "/now", label: "More" }}
    >
      <ul className="grid gap-2.5 pt-1">
        {now.items.map((item) => (
          <li
            key={item.text}
            className="relative pl-5 text-[0.9375rem] text-muted before:absolute before:top-[0.85em] before:left-0 before:h-px before:w-2.5 before:bg-accent"
          >
            <NowItemText {...item} />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
