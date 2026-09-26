import Link from "next/link";

import type { Profile } from "@/lib/data/types";
import { SceneSlot } from "@/components/site";
import { Button, Dimension, TitleBlock } from "@/components/ui";

export type HeroProps = {
  profile: Profile;
  firstYear: number;
  thisYear: number;
  sheet: string;
  total: string;
  rev: string;
  /** Drawer callout meta lines, keyed by href. */
  callouts: Partial<Record<string, string>>;
};

const mono = "font-mono text-mono-xs tracking-[0.08em] uppercase tabular-nums";

/** Sheet 00: the eyebrow row, the drawing with CTAs over it, the headline, then the dimension and title block. */
export function Hero({
  profile,
  firstYear,
  thisYear,
  sheet,
  total,
  rev,
  callouts,
}: HeroProps) {
  const span = thisYear - firstYear;
  const measure =
    span > 0
      ? `${span} ${span === 1 ? "year" : "years"} building for the web`
      : "Building for the web";

  return (
    <section
      aria-labelledby="hero-title"
      className="grid grid-cols-1 gap-x-6 px-5 pt-6 pb-8 lg:h-[calc(100svh-2*var(--frame-inset)-4.625rem)] lg:min-h-[45rem] lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_auto_auto] lg:px-12 lg:pb-8"
    >
      <p
        className={`${mono} flex flex-wrap justify-between gap-x-6 gap-y-1 text-ink-soft lg:col-span-full`}
      >
        <span>Sheet {sheet} / General arrangement</span>
        <span>
          Drawn {firstYear} · <span className="text-accent">Rev {rev}</span>
        </span>
      </p>

      {/* The drawing takes the full width so the table is never squeezed; the CTAs float over it, transparent, bottom left. */}
      <div className="relative mt-6 lg:col-span-full lg:row-start-2 lg:mt-0 lg:min-h-0">
        <div className="h-[56svh] lg:absolute lg:inset-0 lg:h-auto">
          <SceneSlot route="home" size="fill" callouts={callouts} />
        </div>
        <div className="pointer-events-none mt-6 flex flex-wrap gap-x-7 gap-y-3 *:pointer-events-auto lg:absolute lg:bottom-6 lg:left-0 lg:z-10 lg:mt-0">
          <Button asChild variant="primary">
            <Link href="/projects">Open the register</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/ask">Ask a question</Link>
          </Button>
        </div>
      </div>

      <h1
        id="hero-title"
        className="mt-10 max-w-[26ch] font-display text-[clamp(2.5rem,0.8rem+4.2vw,5.5rem)] leading-[0.88] font-[540] tracking-[-0.012em] text-balance uppercase [font-stretch:62%] lg:col-span-full lg:row-start-3 lg:mt-4"
      >
        {profile.headline}
      </h1>

      <div className="mt-10 grid gap-6 lg:col-span-full lg:row-start-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
        <Dimension
          label={measure}
          start={`Est. ${firstYear}`}
          end={String(thisYear)}
        />
        <TitleBlock
          className="w-full lg:w-auto"
          rows={[
            ...(profile.availability
              ? [
                  {
                    label: "Status",
                    value: (
                      <span className="text-accent">
                        <span aria-hidden>● </span>
                        {profile.availability}
                      </span>
                    ),
                  },
                ]
              : []),
            { label: "Location", value: profile.location },
            { label: "Contact", value: profile.email },
          ]}
          sheet={sheet}
          total={total}
          rev={rev}
        />
      </div>
    </section>
  );
}
