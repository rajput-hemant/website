import Link from "next/link";
import { PhasingPlan } from "@/flavors/maquette/components/model/phasing-plan";
import { ShadowStudy } from "@/flavors/maquette/components/model/shadow-study";
import { SceneSlot } from "@/flavors/maquette/components/site/scene-slot";
import { buttonClass } from "@/flavors/maquette/components/ui/button";
import { RichText } from "@/flavors/maquette/components/ui/rich-text";
import {
  dimensions,
  pad2,
  type Piece,
  type PhasingPlan as Plan,
} from "@/flavors/maquette/lib/model";

import type { Profile } from "@/lib/data/types";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

/**
 * The first view, the model room: the name and the line on the left, the
 * site model on its plinth on the right with a plaque per featured piece,
 * and under it the phasing plan and the shadow study, whose sun lights the
 * model and every plan below.
 */
export function Hero({
  profile,
  featured,
  total,
  plan,
  board,
  month,
}: {
  profile: Profile;
  featured: readonly Piece[];
  total: number;
  plan: Plan;
  board: string;
  /** `September 2026`, the model's revision. */
  month: string;
}) {
  const [first, last] = profile.name.split(" ");
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const context = total - featured.length;
  return (
    <section
      id="model-room"
      aria-labelledby="name"
      className="mx-auto grid max-w-[96rem] gap-y-8.5 px-gutter pt-7 pb-8 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-x-6 lg:gap-y-5.5 lg:pt-5 min-[70rem]:min-h-[max(47.5rem,calc(100svh-4rem))]"
    >
      <div className="flex flex-col justify-between gap-7 lg:col-span-4 lg:row-start-1 lg:pt-4.5 lg:pb-1">
        <div>
          <p className="caps">
            Site model · {total} projects · {month}
          </p>
          <h1
            id="name"
            className="mt-5.5 mb-6.5 -ml-[0.04em] text-name tracking-[-0.035em]"
          >
            <span className="block">{first}</span>
            {last ? <span className="block">{last}</span> : null}
          </h1>
          <p className="max-w-[30ch] font-display text-lead tracking-[-0.005em]">
            {profile.headline.replace(/\.?$/, ".")}
          </p>
          <RichText
            value={profile.bio}
            className="mt-4 max-w-[36ch] text-soft"
          />
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#pieces" className={buttonClass()}>
              See the pieces
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-11 items-center border-b border-line-strong font-display text-[0.9375rem] transition-colors duration-(--duration-ui) fine:hover:border-cut fine:hover:text-cut"
            >
              {profile.email}
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 border-t border-line pt-4.5">
          {profile.availability ? (
            <>
              <dt className="caps">Status</dt>
              <dd className="text-sm leading-snug">
                <span
                  aria-hidden
                  className="mr-2 inline-block size-[7px] rounded-full bg-wood align-[1px] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-wood)_30%,transparent)]"
                />
                {profile.availability}
              </dd>
            </>
          ) : null}
          <dt className="caps">Based</dt>
          <dd className="text-sm leading-snug">
            {profile.location}, working remote
          </dd>
          {social.length > 0 ? (
            <>
              <dt className="caps">Elsewhere</dt>
              <dd className="text-sm leading-snug">
                {social.map((link, i) => (
                  <span key={link.url}>
                    {i > 0 ? ", " : ""}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-line-strong fine:hover:border-cut"
                    >
                      {link.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </span>
                ))}
              </dd>
            </>
          ) : null}
        </dl>
      </div>

      <figure className="m-0 grid min-h-0 content-end lg:col-span-8 lg:row-start-1">
        <SceneSlot
          route="home"
          board={board}
          pins={featured.map((p) => ({ id: p.project.slug, n: p.n }))}
          caption={false}
          label={`Site model: ${featured.length} pieces in material, ${context} foam context blocks`}
          hint="Drag to turn the model. The sun follows your pointer."
          stageClassName="max-sm:-mx-gutter max-sm:aspect-square max-sm:w-[calc(100%+2*var(--spacing-gutter))] lg:aspect-[2/1]"
        />
        <ol
          aria-label="Pieces on the plinth"
          className="mt-1.5 grid grid-cols-2 gap-x-4.5 gap-y-4 sm:grid-cols-4"
        >
          {featured.map((piece) => (
            <li key={piece.project.id}>
              <Link
                href={`/projects/${piece.project.slug}`}
                data-scene-item={`piece:${piece.project.slug}`}
                className="group/plaque grid grid-cols-[1.875rem_minmax(0,1fr)] gap-y-[3px] border-t border-line-strong pt-3 transition-[border-color,box-shadow] duration-(--duration-ui) focus-visible:border-cut focus-visible:shadow-[inset_0_1px_0_var(--color-cut)] fine:hover:border-cut fine:hover:shadow-[inset_0_1px_0_var(--color-cut)]"
              >
                <b className="row-span-3 num leading-[1.4] font-normal group-focus-visible/plaque:text-cut fine:group-hover/plaque:text-cut">
                  {pad2(piece.n)}
                </b>
                <span className="font-display text-base leading-tight font-medium">
                  {piece.project.name}
                </span>
                <span className="num">
                  {piece.project.year ?? "Undated"},{" "}
                  {piece.finish.meaning.toLowerCase()}
                </span>
                <span className="num">{dimensions(piece)}</span>
              </Link>
            </li>
          ))}
        </ol>
        <figcaption className="mt-3.5 max-w-[92ch] text-[0.78125rem] leading-normal text-soft">
          <b className="font-semibold text-ink">How the model is built.</b> One
          storey per year since the first commit, one bay per technology in the
          stack. White card is maintained, basswood frame is in progress, grey
          card is archived. The {context} foam blocks are the rest of the
          catalogue.
        </figcaption>
      </figure>

      <div
        id="phasing"
        role="group"
        aria-labelledby="phasing-h"
        className="min-w-0 lg:col-span-8 lg:row-start-2 lg:self-end"
      >
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 id="phasing-h" className="caps text-ink">
            Phasing plan
          </h2>
          <span className="num">
            {plan.phases.length} phases, {plan.from} to now
          </span>
        </div>
        <PhasingPlan plan={plan} hrefFor={(id) => `/work#${id}`} />
      </div>

      <ShadowStudy
        scope="model-room"
        className="border-t border-line pt-4.5 lg:col-span-4 lg:row-start-2 lg:self-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
      />
    </section>
  );
}
