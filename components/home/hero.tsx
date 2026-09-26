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

/** Sheet 00: the eyebrow row, the lead and CTAs over the drawing, the name, then the dimension and title block. */
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
      aria-labelledby="hero-name"
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

      <h1
        id="hero-name"
        className="mt-8 -ml-[0.035em] font-display text-[clamp(4rem,24vw,7.5rem)] leading-[0.8] font-[540] tracking-[-0.018em] uppercase [font-stretch:62%] sm:text-[clamp(4rem,16.6vw,17.5rem)] sm:leading-[0.76] sm:whitespace-nowrap lg:col-span-full lg:row-start-3 lg:mt-0"
      >
        {profile.name}
      </h1>

      <div className="mt-6 h-[56svh] lg:col-span-8 lg:col-start-5 lg:row-start-2 lg:mt-0 lg:h-auto lg:min-h-0">
        <SceneSlot route="home" size="fill" callouts={callouts} />
      </div>

      <div className="mt-10 lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-end lg:pb-9">
        <p className="max-w-[28ch] font-text text-lead font-[340] text-ink [font-variation-settings:'opsz'_28]">
          {profile.headline}.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
          <Button asChild variant="primary">
            <Link href="/projects">Open the register</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/ask">Ask a question</Link>
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:col-span-full lg:row-start-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
        <Dimension
          label={measure}
          start={`Est. ${firstYear}`}
          end={String(thisYear)}
        />
        <TitleBlock
          className="w-full lg:w-auto"
          rows={[
            { label: "Engineer", value: profile.name },
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
