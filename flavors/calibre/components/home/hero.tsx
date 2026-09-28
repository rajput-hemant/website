import Link from "next/link";
import { Bezel } from "@/flavors/calibre/components/dial/bezel";
import { PowerReserve } from "@/flavors/calibre/components/dial/power-reserve";
import { ServiceRecord } from "@/flavors/calibre/components/dial/service-record";
import { TechnicalSheet } from "@/flavors/calibre/components/dial/technical-sheet";
import { SceneSlot } from "@/flavors/calibre/components/site/scene-slot";
import {
  actionLinkClass,
  quietLinkClass,
} from "@/flavors/calibre/components/ui/link-class";
import { RichText } from "@/flavors/calibre/components/ui/rich-text";
import type {
  ServiceRecord as Record,
  Sheet,
} from "@/flavors/calibre/lib/movement";
import { bezelPrints, CALIBRE } from "@/flavors/calibre/lib/movement";

import type { Profile } from "@/lib/data/types";

/**
 * The first view, set like a catalogue spread: the identity and the power
 * reserve on the left, the movement behind its caseback in the centre, the
 * technical sheet and the service record on the right.
 */
export function Hero({
  profile,
  sheet,
  record,
  board,
}: {
  profile: Profile;
  sheet: Sheet;
  record: Record;
  board: string;
}) {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");
  return (
    <section
      aria-labelledby="name"
      className="mx-auto grid max-w-[96rem] gap-x-10 px-gutter pt-8 [grid-template-areas:'id'_'reserve'_'watch'_'sheet'_'record'] lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3.4fr)] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-y-10 lg:pt-10 lg:[grid-template-areas:'id_watch_sheet'_'reserve_watch_record']"
    >
      <div className="[grid-area:id]">
        <p className="spec">
          Calibre {CALIBRE} · Fullstack · {profile.location}
        </p>
        <h1 id="name" className="mt-6 text-name tracking-[-0.03em] lg:mt-8">
          {first}
          {last ? (
            <>
              <br />
              <em className="ml-[0.4em]">{last}</em>
            </>
          ) : null}
        </h1>
        <p className="mt-7 max-w-[22ch] text-[clamp(1.25rem,1.1rem+0.5vw,1.4375rem)] leading-[1.3] font-medium">
          {profile.headline.replace(/\.?$/, ".")}
        </p>
        <RichText value={profile.bio} className="mt-4 max-w-[38ch] text-soft" />
        <p className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
          <a href="#jewels" className={actionLinkClass}>
            See the jewels
          </a>
          <Link href="/ask" className={quietLinkClass}>
            Ask a question
          </Link>
        </p>
      </div>
      <PowerReserve
        availability={profile.availability}
        email={profile.email}
        className="mt-10 border-t border-line pt-6 [grid-area:reserve] lg:mt-0 lg:self-end"
      />
      <figure className="m-0 mt-10 [grid-area:watch] lg:mt-0 lg:self-center">
        <Bezel
          prints={bezelPrints(sheet.jewels, profile.location)}
          className="mx-auto max-w-[37rem]"
        >
          <SceneSlot route="home" board={board} />
        </Bezel>
        <figcaption className="mt-5 text-center spec">
          The movement, {sheet.jewels} jewels
          <span aria-hidden className="hidden fine:inline">
            {" "}
            · drag to turn it
          </span>
        </figcaption>
      </figure>
      <TechnicalSheet
        sheet={sheet}
        availability={profile.availability}
        location={profile.location}
        className="mt-12 [grid-area:sheet] lg:mt-0"
      />
      <ServiceRecord
        record={record}
        hrefFor={(id) => `/work#${id}`}
        className="mt-10 [grid-area:record] lg:mt-0 lg:self-end"
      />
    </section>
  );
}
