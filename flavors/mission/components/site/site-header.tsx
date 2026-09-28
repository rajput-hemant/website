import Link from "next/link";
import { CommandTrigger } from "@/flavors/mission/components/command";
import { CustomizeTrigger } from "@/flavors/mission/components/customize";
import {
  flightPlan,
  launchTime,
  met,
  revision,
} from "@/flavors/mission/lib/flight";

import { site } from "@/content/site";
import { getExperience, getProjects } from "@/lib/data";

import { NavLinks } from "./nav-links";
import { MetClock } from "./telemetry";
import { ThemeToggle } from "./theme-toggle";

/**
 * The head of the flight plan: the red plate and the name, sections 2.0 to
 * 5.0, then Resume, ⌘K, the Paper or Orbit switch and Customize. Under it
 * the telemetry strip: the plan's designation, the phase in flight, and the
 * MET clock from T-0. Below md the nav drops to a second row.
 */
export async function SiteHeader() {
  const [experience, projects] = await Promise.all([
    getExperience(),
    getProjects(),
  ]);
  const today = new Date();
  const flight = flightPlan(experience, projects, today);
  const { plan, rev } = revision(today);
  const current = flight.phases.findLast((p) => p.b === null);
  const launch = launchTime(flight);
  const [first = "", ...rest] = site.name.split(" ");
  const initials = `${first.charAt(0)}${rest.at(-1)?.charAt(0) ?? ""}`;

  return (
    <header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="relative z-20"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter md:h-16 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-h-14 items-center gap-3 justify-self-start"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center bg-signal font-display text-[0.9375rem] leading-none font-extrabold tracking-[-0.02em] text-on-signal"
          >
            {initials}
          </span>
          <span className="font-display text-[1.0625rem] leading-none font-extrabold tracking-[-0.01em]">
            {site.name}
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter border-t border-rule px-gutter md:col-span-1 md:col-start-2 md:row-start-1 md:mx-0 md:border-0 md:px-0"
        >
          <NavLinks className="justify-between gap-2 pl-3 md:justify-start md:pl-0" />
        </nav>
        <div className="-mr-2 flex items-center gap-1 justify-self-end md:col-start-3 md:row-start-1">
          <Link
            href="/resume"
            className="mr-2 hidden min-h-11 items-center px-1 font-display text-[0.9375rem] font-bold sm:flex fine:hover:text-signal"
          >
            Resume
          </Link>
          <CommandTrigger />
          <ThemeToggle className="max-sm:hidden" />
          <CustomizeTrigger />
        </div>
      </div>
      <div className="border-t border-b border-rule-strong border-b-rule">
        <p className="mx-auto grid h-8 max-w-[90rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter label text-ink-soft md:grid-cols-[1fr_auto_1fr]">
          <span className="truncate">
            Flight plan {plan} · {rev}
          </span>
          <span className="max-md:hidden">
            {current ? (
              <>
                Phase {current.n} of {flight.phases.length} ·{" "}
                <em className="text-signal not-italic">In flight</em>
              </>
            ) : (
              "Between phases"
            )}
          </span>
          <span className="justify-self-end">
            MET{" "}
            <MetClock launch={launch} initial={met(today.getTime() - launch)} />
          </span>
        </p>
      </div>
    </header>
  );
}
