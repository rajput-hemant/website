import { DraftFigure } from "@/flavors/jacquard/components/draft/draft-figure";
import { SceneSlot } from "@/flavors/jacquard/components/site/scene-slot";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { ExternalLink } from "@/flavors/jacquard/components/ui/external-link";
import { MuseumLabel } from "@/flavors/jacquard/components/ui/museum-label";
import { RichText } from "@/flavors/jacquard/components/ui/rich-text";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { topEnds, type Draft } from "@/flavors/jacquard/lib/weave";

import type { Experience, Profile } from "@/lib/data/types";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

/**
 * The sample book's title page: the name and a museum object label on the
 * left; on the right the cloth, stacked over the weaving draft it was woven
 * from, so the cloth reads as the draft's output.
 */
export function Hero({
  profile,
  current,
  draft,
  total,
}: {
  profile: Profile;
  current: Experience | undefined;
  draft: Draft;
  total: number;
}) {
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const [first = "", ...rest] = profile.name.split(" ");
  const years = draft.years;
  const status = profile.availability
    ? profile.availability
    : current
      ? `At ${current.company}, ${current.title}`
      : null;

  return (
    <Container
      as="section"
      aria-labelledby="hero-heading"
      className="grid gap-x-14 gap-y-12 pt-7 pb-8 lg:min-h-[max(47.5rem,calc(100svh-4rem))] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="flex min-w-0 flex-col">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 label">
          <span>Sample book</span>
          {years ? (
            <>
              <span aria-hidden className="h-px w-3.5 bg-rule-strong" />
              <span>
                {years.from} to {Math.max(years.to, new Date().getFullYear())}
              </span>
            </>
          ) : null}
        </p>
        <h1
          id="hero-heading"
          className="mt-7 -ml-[0.04em] text-name tracking-[-0.02em]"
        >
          <span className="block">{first}</span>{" "}
          <span className="block">{rest.join(" ")}</span>
        </h1>
        <p className="mt-7 max-w-[25ch] text-lead font-medium tracking-[-0.012em]">
          {profile.headline}.
        </p>
        <RichText
          value={profile.bio}
          className="mt-3.5 max-w-[42ch] text-[1.0625rem] leading-relaxed text-ink-soft"
        />
        <p className="mt-5 flex flex-wrap gap-x-6">
          <a
            href={`mailto:${profile.email}`}
            className="thread-link inline-flex min-h-11 items-center text-[0.9375rem] font-medium"
          >
            {profile.email}
          </a>
          {social.map((link) => (
            <ExternalLink
              key={link.url}
              href={link.url}
              arrow={false}
              className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium"
            >
              {link.label}
            </ExternalLink>
          ))}
        </p>
        <MuseumLabel
          className="mt-10 lg:mt-auto"
          rows={[
            { label: "Maker", value: `${profile.name}, fullstack engineer` },
            { label: "Place", value: `${profile.location}, working remotely` },
            ...(years
              ? [{ label: "Date", value: `${years.from} to present` }]
              : []),
            {
              label: "Materials",
              value: topEnds(draft, 5)
                .map((end) => end.tech)
                .join(", "),
            },
            ...(status
              ? [
                  {
                    label: "Status",
                    value: (
                      <span className="flex items-center gap-2.5">
                        <i
                          aria-hidden
                          className="size-2 bg-madder shadow-[3px_3px_0_-1px_var(--color-woad)]"
                        />
                        {status}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="relative flex h-[30rem] flex-col sm:h-[32rem] lg:h-auto lg:min-h-[22rem] lg:flex-1">
          <SceneSlot
            route="home"
            weave={draftWeave(draft)}
            fill
            caption="Fig. 1 · Loom-state cloth, woven from the draft below. Move across it to ripple it, drag to turn it."
            className="min-h-0 flex-1 [&_figcaption]:absolute [&_figcaption]:right-0 [&_figcaption]:bottom-1.5 [&_figcaption]:w-52 [&_figcaption]:max-sm:inset-x-0 [&_figcaption]:max-sm:bottom-0 [&_figcaption]:max-sm:w-auto [&>div]:max-sm:mb-16"
          />
          <dl className="pointer-events-none order-first mb-3 grid grid-cols-[auto_auto] gap-x-3.5 gap-y-1 font-mono text-[0.65625rem] tracking-[0.1em] text-ink-soft uppercase sm:absolute sm:top-0 sm:left-0 sm:mb-0">
            <dt className="text-ink-faint">Warp</dt>
            <dd>{draft.ends.length} technologies</dd>
            <dt className="text-ink-faint">Weft</dt>
            <dd>{draft.picks.length} projects</dd>
            <dt className="text-ink-faint">Repeat</dt>
            <dd>
              {draft.ends.length} ends × {draft.picks.length} picks
            </dd>
          </dl>
        </div>
        <DraftFigure draft={draft} total={total} />
      </div>
    </Container>
  );
}
