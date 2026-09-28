import Link from "next/link";
import { SceneSlot } from "@/flavors/darkroom/components/site/scene-slot";
import { buttonClass } from "@/flavors/darkroom/components/ui/button";
import { RichText } from "@/flavors/darkroom/components/ui/rich-text";
import { ROLL, STOCK, type RollStrip } from "@/flavors/darkroom/lib/roll";

import type { Experience, Profile } from "@/lib/data/types";
import { formatMonthYear } from "@/lib/format";

/**
 * The first view: the name and the line on the left, the developer tray on
 * the right with a contact print of the roll in it, and a strip of 35mm
 * across the bottom that carries the real dates.
 */
export function Hero({
  profile,
  current,
  stack,
  strip,
  board,
  selects,
}: {
  profile: Profile;
  current: Experience | undefined;
  stack: readonly string[];
  strip: RollStrip;
  board: string;
  selects: number;
}) {
  const [first, last] = profile.name.split(" ");
  return (
    <section
      aria-labelledby="name"
      className="mx-auto grid max-w-[96rem] px-gutter pt-6 [grid-template-areas:'eye'_'name'_'tray'_'text'_'roll'] lg:min-h-[max(40rem,calc(100svh-4rem))] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_minmax(0,1fr)_auto] lg:gap-x-10 lg:pt-9 lg:[grid-template-areas:'eye_tray'_'name_tray'_'text_tray'_'roll_roll']"
    >
      <p className="flex flex-wrap gap-x-3 gap-y-1.5 edge [grid-area:eye]">
        <span>Roll {ROLL}</span>
        <span aria-hidden className="opacity-50">
          /
        </span>
        <span>{profile.location}, remote</span>
        {stack.length > 0 ? (
          <>
            <span aria-hidden className="opacity-50">
              /
            </span>
            <span>{stack.join(", ")}</span>
          </>
        ) : null}
      </p>
      <h1
        id="name"
        className="mt-5 -ml-[0.05em] text-name tracking-[-0.052em] [grid-area:name] lg:mt-7"
      >
        {first}
        {last ? (
          <>
            <br />
            {last}
          </>
        ) : null}
      </h1>
      <div className="pt-8 pb-8 [grid-area:text] lg:self-end lg:pt-10">
        <p className="max-w-[24ch] text-[clamp(1.4375rem,1.2rem+0.6vw,1.625rem)] leading-[1.24] font-medium tracking-[-0.018em]">
          {profile.headline.replace(/\.?$/, ".")}
        </p>
        <RichText
          value={profile.bio}
          className="mt-4 max-w-[40ch] text-[1.0625rem] text-soft"
        />
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href="#sheet" className={buttonClass({ className: "group/cta" })}>
            See the contact sheet
            <span
              aria-hidden
              className="h-2.5 w-[18px] bg-[linear-gradient(90deg,currentColor_0_3px,transparent_3px_5px,currentColor_5px_8px,transparent_8px_10px,currentColor_10px_18px)] opacity-80"
            />
          </a>
          <Link
            href="/ask"
            className="inline-flex min-h-11 items-center border-b border-line-strong font-semibold transition-colors duration-(--duration-ui) fine:hover:border-grease"
          >
            Ask a question
          </Link>
        </div>
        {current ? (
          <p className="mt-7 grid gap-1.5 border-t border-line pt-3.5 edge">
            On the drying line
            <b className="font-sans text-[0.9375rem] leading-snug font-medium tracking-normal text-ink normal-case">
              {current.title} at {current.company}, since{" "}
              {formatMonthYear(current.startDate)}
            </b>
          </p>
        ) : null}
      </div>
      <SceneSlot
        route="home"
        board={board}
        label={`Contact print, ${strip.frames} frames, ${selects} marked`}
        className="mt-6 self-center [grid-area:tray] lg:mt-0 lg:-mr-2 lg:mb-6"
      />
      <p className="perfs relative -mx-gutter flex h-16 items-center justify-between gap-7 overflow-hidden px-gutter edge whitespace-nowrap text-edge-ink [grid-area:roll] sm:h-[4.25rem]">
        <span className="max-sm:hidden">{STOCK}</span>
        {strip.marks.map((mark, i) => (
          <span
            key={mark.text}
            className={
              i === 0 ? "" : i === 1 ? "max-md:hidden" : "max-lg:hidden"
            }
          >
            <b aria-hidden className="text-grease">
              ▸
            </b>{" "}
            {mark.year} {mark.text}
          </span>
        ))}
        <span>
          {strip.years} years · {strip.roles} roles · {strip.frames} frames
        </span>
      </p>
    </section>
  );
}
