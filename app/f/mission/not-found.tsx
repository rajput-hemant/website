import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/mission/components/site/page";
import { SceneSlot } from "@/flavors/mission/components/site/scene-slot";
import { Container } from "@/flavors/mission/components/ui/container";
import { sections } from "@/flavors/mission/content";
import { flightPlan } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { getExperience, getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Loss of signal",
  robots: { index: false },
};

/** A 404 as loss of signal: the globe turned away, with every section of the plan listed. */
export default async function NotFound() {
  const [experience, projects] = await Promise.all([
    getExperience(),
    getProjects(),
  ]);
  const flight = flightPlan(experience, projects, new Date());
  return (
    <Page>
      <Container className="grid gap-x-6 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-7">
          <p className="flex gap-3.5 label text-ink-soft">
            <b className="font-semibold text-signal">LOS</b>
            <span>Loss of signal · 404</span>
          </p>
          <h1 className="mt-6 text-display">No telemetry at this address</h1>
          <p className="mt-7 max-w-[36ch] text-lead font-medium text-ink-soft">
            There is no page here. Every section of the flight plan is below.
          </p>
          <nav aria-label="Sections" className="mt-10">
            <ul className="grid border-t-2 border-ink sm:grid-cols-2 sm:gap-x-6">
              {sections.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="flex min-h-12 items-center gap-4 border-b border-rule font-display text-lg font-bold transition-colors duration-(--duration-ui) ease-out fine:hover:text-signal"
                  >
                    <span className="w-8 label">{section.n}.0</span>
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot
          route="notfound"
          board={boardFor(flight)}
          caption="Turned away. No orbit is in phase here."
          className="mx-auto w-full max-w-[24rem] lg:col-span-5 lg:max-w-none"
        />
      </Container>
    </Page>
  );
}
