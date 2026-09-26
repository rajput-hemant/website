import Link from "next/link";
import { boardMonth } from "@/flavors/timetable/components/network/network-section";
import { SceneSlot } from "@/flavors/timetable/components/site/scene-slot";
import { Button } from "@/flavors/timetable/components/ui/button";
import { Container } from "@/flavors/timetable/components/ui/container";
import { RichText } from "@/flavors/timetable/components/ui/rich-text";

import type { Experience, Profile } from "@/lib/data/types";

/** The concourse: where I am, what I do, and the indicator hanging over it. */
export function Hero({
  profile,
  current,
}: {
  profile: Profile;
  current: Experience | undefined;
}) {
  const board = current
    ? `${current.company}|Since ${boardMonth(current.startDate)}|Now`
    : undefined;
  return (
    <section
      aria-labelledby="hero-heading"
      className="pt-[clamp(2rem,1rem+3vw,4rem)]"
    >
      <Container className="grid gap-x-6 gap-y-10 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-7">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-mono-sm leading-none font-semibold tracking-[0.07em] text-ink-soft uppercase">
            <span
              aria-hidden
              className="size-3 rounded-full bg-signal shadow-[0_0_0_1.5px_var(--color-ink)]"
            />
            {profile.availability ? <span>{profile.availability}</span> : null}
            <span aria-hidden>/</span>
            <span>{profile.location}</span>
            <span aria-hidden>/</span>
            <span>Remote, UTC+5:30</span>
          </p>
          <h1
            id="hero-heading"
            className="mt-6 max-w-[16ch] text-display font-extrabold tracking-[-0.035em]"
          >
            {profile.headline}
          </h1>
          <RichText
            value={profile.bio}
            className="mt-6 max-w-[48ch] text-lead text-ink-soft"
          />
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild magnetic>
              <Link href="/projects">See the departures</Link>
            </Button>
            <Button asChild variant="ghost" arrow={false}>
              <Link href="/ask">
                <span
                  aria-hidden
                  className="grid size-5.5 place-items-center rounded-[3px] bg-ink pt-0.5 text-sm font-extrabold text-ground"
                >
                  i
                </span>
                Ask a question
              </Link>
            </Button>
          </div>
        </div>
        <figure className="mx-auto w-full max-w-lg lg:col-span-5 lg:max-w-none">
          <SceneSlot route="home" size="hero" board={board} />
          <figcaption className="mt-3 font-mono text-mono-xs leading-snug font-medium tracking-[0.05em] text-ink-faint uppercase lg:text-right">
            Split-flap indicator: it turns to what you point at.
            <span className="hidden fine:inline"> Drag to swing it.</span>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
