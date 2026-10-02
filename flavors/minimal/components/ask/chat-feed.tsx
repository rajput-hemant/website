import {
  GlyphAnchor,
  GlyphPoster,
  glyphProps,
} from "@/flavors/minimal/components/scene/glyph";
import { GlyphLead } from "@/flavors/minimal/components/scene/glyph-lead";
import { EnvelopePoster } from "@/flavors/minimal/components/scene/posters";

import type { Question } from "@/lib/data/types";

import { ChatThread } from "./chat-thread";

/**
 * Published conversations, latest activity first. Each carries an envelope
 * glyph in the left gutter: the feed is a view of the page's scene, or on
 * pages with no other glyph, its lead.
 */
export function ChatFeed({
  threads,
  glyph,
}: {
  threads: Question[];
  glyph: "lead" | "view";
}) {
  if (threads.length === 0) return <EmptyFeed />;

  const list = (
    <ol
      {...(glyph === "view" && glyphProps("envelopes", "envelopes"))}
      className="stagger border-t border-hairline"
    >
      {threads.map((thread) => (
        <li
          key={thread.id}
          data-scene-item={`thread:${thread.slug}`}
          className="relative border-b border-hairline py-8 sm:py-10"
        >
          <GlyphAnchor
            id={thread.slug}
            data={{ replies: thread.replies.length > 0 }}
            className="absolute top-9 -left-9 hidden h-3.5 w-5 sm:top-11 sm:block"
          >
            <GlyphPoster>
              <EnvelopePoster />
            </GlyphPoster>
          </GlyphAnchor>
          <ChatThread thread={thread} />
        </li>
      ))}
    </ol>
  );
  if (glyph === "view") return list;
  return (
    <div {...glyphProps("envelopes")} className="relative">
      {list}
      <GlyphLead kind="envelopes" />
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center sm:py-14">
      <p className="display text-2xl font-book text-foreground">
        It&rsquo;s quiet in here, for now.
      </p>
      <p className="mx-auto mt-3 max-w-[42ch] text-muted">
        Ask about something I built, how I work, or anything on your mind. The
        first conversation could be yours.
      </p>
      <a
        href="#start"
        className="hit-area mt-6 inline-flex link meta text-foreground hover:text-accent"
      >
        Start a conversation ↑
      </a>
    </div>
  );
}
