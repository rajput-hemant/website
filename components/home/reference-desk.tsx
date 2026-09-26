import type { Question } from "@/lib/data/types";
import { formatTimestamp } from "@/lib/format";
import { ArrowLink, Section } from "@/components/ui";

const EXCERPT_LENGTH = 160;

function excerpt(text: string, max = EXCERPT_LENGTH): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** The latest published /ask thread, with its first reply, as a teaser for the full board. */
export function ReferenceDesk({ question }: { question: Question | null }) {
  if (!question) return null;
  const reply = question.replies[0];

  return (
    <Section id="reference-desk" title="From the reference desk">
      <p className="max-w-[62ch] text-graphite">{excerpt(question.body)}</p>
      <p className="mt-2 font-mono text-mono-xs text-pencil">
        {question.authorName ?? "Anonymous"} ·{" "}
        <time dateTime={question.lastActivityAt}>
          {formatTimestamp(question.lastActivityAt)}
        </time>
      </p>
      {reply && (
        <p className="mt-4 max-w-[62ch] border-l border-hairline pl-4 text-graphite">
          {excerpt(reply.body)}
        </p>
      )}
      <ArrowLink href="/ask" className="mt-4 inline-block">
        Read on /ask
      </ArrowLink>
    </Section>
  );
}
