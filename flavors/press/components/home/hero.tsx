import Link from "next/link";
import { SceneSlot } from "@/flavors/press/components/site/scene-slot";
import { Container } from "@/flavors/press/components/ui/container";
import { ExternalLink } from "@/flavors/press/components/ui/external-link";
import { Overprint } from "@/flavors/press/components/ui/overprint";
import { ProofStamp } from "@/flavors/press/components/ui/proof-stamp";
import { RichText } from "@/flavors/press/components/ui/rich-text";
import { separate } from "@/flavors/press/lib/proof";

import { site } from "@/content/site";
import type { Experience, Profile, SkillGroup } from "@/lib/data/types";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const proofDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})
  .format(new Date())
  .replaceAll("/", ".");

/**
 * The title sheet: the headline in two plates, 6px out of register until the
 * pointer finds it, the press beside it, the separations (the stack split
 * into its two plates) and the proof stamp with the current state of the run.
 */
export function Hero({
  profile,
  current,
  skills,
}: {
  profile: Profile;
  current: Experience | undefined;
  skills: SkillGroup[];
}) {
  const plates = separate(skills.flatMap((group) => group.items));
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const status = profile.availability
    ? { lead: "OK to print:", text: profile.availability }
    : current
      ? { lead: "On press:", text: `${current.title}, ${current.company}` }
      : null;

  return (
    <Container
      as="section"
      aria-labelledby="hero-heading"
      className="grid gap-x-6 gap-y-8 pt-4 pb-6 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:pt-3"
    >
      <p
        aria-hidden
        className="slug lg:col-span-7 lg:col-start-1 lg:row-start-1"
      >
        <b className="font-semibold text-ink">Register</b> &nbsp;{" "}
        <span className="in-[:root:has([data-register]:hover)]:hidden">
          6 px out &nbsp;/&nbsp; point at the headline to pull it in
        </span>
        <span className="hidden in-[:root:has([data-register]:hover)]:inline">
          0 px &nbsp;/&nbsp; in register
        </span>
      </p>

      <SceneSlot
        route="home"
        className="w-full max-lg:order-2 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
      />

      <div className="min-w-0 max-lg:order-1 lg:col-span-7 lg:col-start-1 lg:row-start-2">
        <p className="mb-4 slug">
          {site.handle} &nbsp;/&nbsp; {profile.location}
        </p>
        <Overprint
          as="h1"
          id="hero-heading"
          data-register
          data-scene-item="register"
          className="-ml-[0.05em] max-w-[14ch] cursor-crosshair pb-[0.08em] text-[clamp(3rem,0.8rem+7.6vw,8.25rem)] leading-[0.86] tracking-[-0.05em]"
        >
          {profile.headline}
        </Overprint>
      </div>

      <div className="max-lg:order-3 lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:self-end">
        <RichText
          value={profile.bio}
          className="max-w-[44ch] text-lead leading-snug"
        />
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm font-semibold">
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center underline decoration-pink decoration-2 underline-offset-[0.3em] fine:hover:decoration-blue"
          >
            See the work
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-11 items-center underline decoration-pink decoration-2 underline-offset-[0.3em] fine:hover:decoration-blue"
          >
            {profile.email}
          </a>
          {social.map((link) => (
            <ExternalLink
              key={link.url}
              href={link.url}
              arrow={false}
              className="inline-flex min-h-11 items-center underline-offset-[0.3em]"
            >
              {link.label}
            </ExternalLink>
          ))}
        </p>
      </div>

      <div className="max-lg:order-4 lg:col-span-3 lg:col-start-6 lg:row-start-3 lg:self-end">
        <h2 className="mb-3 slug">Separations</h2>
        <ul className="text-sm">
          {[
            {
              swatch: "bg-pink",
              name: "P1 Interface",
              list: plates.p1.slice(0, 4).join(", "),
            },
            {
              swatch: "bg-blue",
              name: "P2 Systems",
              list: plates.p2.slice(0, 4).join(", "),
            },
            {
              swatch: "overprint",
              name: "P1 + P2 in register",
              list: "Fullstack",
            },
            {
              swatch: "bg-yellow",
              name: "P3 Yellow",
              list: "Marks what is current",
            },
          ].map((plate) => (
            <li
              key={plate.name}
              className="grid grid-cols-[1.375rem_1fr] gap-x-2.5 border-t border-rule py-2"
            >
              <i
                aria-hidden
                className={`row-span-2 mt-0.5 size-4 ${plate.swatch}`}
              />
              <b className="leading-tight font-bold">{plate.name}</b>
              <span className="leading-snug text-ink-soft">{plate.list}</span>
            </li>
          ))}
        </ul>
      </div>

      {status ? (
        <ProofStamp
          title="Press proof"
          date={proofDate}
          ticked={0}
          signed
          options={[
            <>
              {status.lead} <mark>{status.text}</mark>
            </>,
            "OK with corrections",
            "New proof needed",
          ]}
          className="max-lg:order-5 max-lg:ml-1 lg:col-span-3 lg:col-start-10 lg:row-start-3 lg:self-end lg:justify-self-end"
        />
      ) : null}
    </Container>
  );
}
