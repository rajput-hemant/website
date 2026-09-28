import Link from "next/link";
import { SheetGround } from "@/flavors/survey/components/relief/sheet-ground";
import { SheetMap } from "@/flavors/survey/components/relief/sheet-map";
import { Container } from "@/flavors/survey/components/ui/container";
import { RichText } from "@/flavors/survey/components/ui/rich-text";
import { isoMonth, type Relief } from "@/flavors/survey/lib/relief";
import { encodeBoard, poseFor } from "@/flavors/survey/lib/scene/poses";
import { sheetNumber } from "@/flavors/survey/lib/sheet";

import { site } from "@/content/site";
import type { Profile } from "@/lib/data/types";
import { formatMonthYear } from "@/lib/format";

import { MapKey } from "./map-key";

/**
 * The home page is the sheet itself: a title band, the relief map with its
 * loupe, marginalia with the headline, bio and key, and the strip along the
 * foot. The roles are the summits, so the experience is the hero.
 */
export function Hero({
  profile,
  relief,
  projectCount,
}: {
  profile: Profile;
  relief: Relief;
  projectCount: number;
}) {
  const pose = poseFor(relief, "home");
  const revised = formatMonthYear(isoMonth(relief.today));

  return (
    <Container
      as="section"
      aria-labelledby="sheet-title"
      className="grid gap-x-12 pt-7 pb-5 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:grid-rows-[auto_1fr_auto]"
    >
      <div className="flex flex-col items-start justify-between gap-5 border-b-[1.5px] border-rule-strong pb-5 lg:col-span-2 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <h1
            id="sheet-title"
            className="spaced text-display tracking-[0.2em] break-words sm:tracking-[0.34em]"
          >
            {site.handle}
          </h1>
          <p className="mt-3.5 font-serif text-lg text-ink-soft italic">
            A survey of fullstack work, from the first own projects in{" "}
            {relief.from} to {relief.summits.length} roles since.
          </p>
        </div>
        <div className="caps grid gap-2 text-ink-soft lg:justify-items-end lg:pb-1">
          <span className="inline-flex items-center gap-2 text-wood">
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {profile.availability ?? "Available for work"}
          </span>
          <span>{profile.location}</span>
          <span>
            {sheetNumber()} ·{" "}
            <span className="text-revision">revised {revised}</span>
          </span>
        </div>
      </div>

      <div className="-mx-gutter overflow-hidden pt-3 md:mx-0 lg:self-center">
        <div className="w-[158%] -translate-x-[37%] md:w-full md:translate-x-0">
          <SheetMap
            relief={relief}
            board={encodeBoard(relief, pose)}
            focus={pose.focus}
          >
            <SheetGround relief={relief} id="sheet" />
          </SheetMap>
        </div>
      </div>

      <aside
        aria-label="Sheet notes"
        className="mt-8 grid gap-6 md:grid-cols-2 md:gap-x-10 lg:mt-0 lg:grid-cols-1 lg:self-center"
      >
        <p className="font-serif text-statement">{profile.headline}.</p>
        <RichText
          value={profile.bio}
          className="text-[0.9375rem] text-ink-soft"
        />
        <p className="flex flex-col items-start gap-1 font-medium">
          <Link
            href="/work"
            className="inline-flex min-h-11 items-center underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
          >
            Walk the transects
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-11 items-center underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
          >
            {profile.email}
          </a>
        </p>
        <div className="md:col-start-2 md:row-span-3 md:row-start-1 lg:col-start-1 lg:row-span-1 lg:row-start-auto">
          <MapKey />
        </div>
      </aside>

      <div className="caps mt-5 flex flex-col justify-between gap-1.5 border-t border-rule pt-3 text-ink-faint sm:flex-row lg:col-span-2">
        <span>
          Surveyed and drawn by the engineer · heights from employment dates
        </span>
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center sm:min-h-0 fine:hover:text-ink"
        >
          {projectCount} sites in the gazetteer
        </Link>
      </div>
    </Container>
  );
}
