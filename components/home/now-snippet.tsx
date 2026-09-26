import Link from "next/link";

import type { Now } from "@/lib/data/types";
import { ArrowLink, DateStamp, Section } from "@/components/ui";

const SNIPPET_SIZE = 3;

function NowItem({ text, link }: Now["items"][number]) {
  if (!link) return <>{text}</>;
  if (link.startsWith("/")) {
    return (
      <Link href={link} className="hover:text-paper">
        {text}
      </Link>
    );
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-paper"
    >
      {text}
    </a>
  );
}

/** The top of the /now log: what the owner is focused on right now. */
export function NowSnippet({ now }: { now: Now }) {
  if (now.items.length === 0) return null;

  return (
    <Section id="now-snippet" title="Now">
      <p className="mb-4 font-mono text-mono-xs text-pencil">
        Updated <DateStamp date={now.updatedAt} precision="month" />
      </p>
      <ul className="grid gap-2.5">
        {now.items.slice(0, SNIPPET_SIZE).map((item) => (
          <li
            key={item.text}
            className="border-b border-hairline pb-2.5 text-graphite last:border-0"
          >
            <NowItem {...item} />
          </li>
        ))}
      </ul>
      <ArrowLink href="/now" className="mt-4 inline-block">
        Full list
      </ArrowLink>
    </Section>
  );
}
