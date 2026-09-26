import Link from "next/link";
import { revOf } from "@/flavors/drawing-set/components/projects/sheet";
import {
  ArrowLink,
  DateStamp,
  SheetHeading,
} from "@/flavors/drawing-set/components/ui";

import type { Now, Question } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";

const NOTES = 3;
const EXCERPT = 160;

function excerpt(text: string) {
  return text.length <= EXCERPT ? text : `${text.slice(0, EXCERPT).trimEnd()}…`;
}

function NowNote({ text, link }: Now["items"][number]) {
  if (!link) return <>{text}</>;
  const className =
    "underline decoration-line-strong underline-offset-4 fine:hover:text-accent fine:hover:decoration-accent";
  return link.startsWith("/") ? (
    <Link href={link} className={className}>
      {text}
    </Link>
  ) : (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {text}
    </a>
  );
}

function LatestRfi({ question }: { question: Question }) {
  const reply = question.replies[0];
  return (
    <div className="border border-line-strong">
      <p className="flex justify-between gap-4 border-b border-line px-4 py-2.5 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase">
        <span>Latest RFI</span>
        <time dateTime={question.lastActivityAt}>
          {formatTimestamp(question.lastActivityAt)}
        </time>
      </p>
      <div className="p-4">
        <p className="text-ink">{excerpt(question.body)}</p>
        <p className="mt-2 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase">
          {question.authorName ?? "Anonymous"}
        </p>
        {reply && (
          <p className="mt-4 border-l border-accent pl-4 text-sm text-ink-soft">
            {excerpt(reply.body)}
          </p>
        )}
        <ArrowLink href={`/ask/${question.slug}`} className="mt-4">
          Read the thread
        </ArrowLink>
      </div>
    </div>
  );
}

/** What changed last: the now notes as a revision entry, and the latest answered question. */
export function CurrentRevision({
  now,
  question,
  sheet,
}: {
  now: Now;
  question: Question | null;
  sheet: string;
}) {
  if (now.items.length === 0 && !question) return null;

  return (
    <section aria-labelledby="current-revision">
      <SheetHeading
        id="current-revision"
        n={`Sheet ${sheet}`}
        title="Current revision"
        aside={
          <>
            Rev {revOf(now.updatedAt)} ·{" "}
            <DateStamp date={now.updatedAt} precision="month" />
          </>
        }
      />
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        {now.items.length > 0 && (
          <div className="lg:col-span-7">
            <ol className="grid">
              {now.items.slice(0, NOTES).map((item, i) => (
                <li
                  key={item.text}
                  className="grid grid-cols-[3rem_1fr] border-b border-line py-4"
                >
                  <span className="pt-1 font-mono text-mono-xs text-ink-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <NowNote {...item} />
                  </span>
                </li>
              ))}
            </ol>
            <ArrowLink href="/now" className="mt-6">
              All revisions
            </ArrowLink>
          </div>
        )}
        {question && (
          <div className="lg:col-span-5">
            <LatestRfi question={question} />
          </div>
        )}
      </div>
    </section>
  );
}
