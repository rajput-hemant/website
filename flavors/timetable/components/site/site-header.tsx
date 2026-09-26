import Link from "next/link";
import { CommandTrigger } from "@/flavors/timetable/components/command";
import { CustomizeTrigger } from "@/flavors/timetable/components/customize";

import { site } from "@/content/site";

import { NavLinks } from "./nav-links";

/**
 * The overhead sign band: the station mark and name, the platform nav, then
 * Resume, ⌘K and customize. Below 56rem the nav drops to a second row of
 * four equal platforms. Sticky, pure CSS.
 */
export function SiteHeader() {
  return (
    <header
      data-site-header
      data-dark-surface
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-30 bg-sign text-on-sign dark:shadow-[inset_0_-1px_0_var(--color-rule)]"
    >
      <div className="mx-auto grid max-w-[100rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter lg:h-16 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-h-14 items-center gap-3 justify-self-start text-[1.0625rem] leading-none font-bold tracking-[-0.005em]"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-[4px] bg-signal pt-0.5 text-sm leading-none font-extrabold tracking-[-0.02em] text-signal-ink"
          >
            HR
          </span>
          <span className="pt-0.5">{site.name}</span>
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter border-t border-white/15 px-gutter lg:col-span-1 lg:row-start-1 lg:mx-0 lg:border-0 lg:px-0"
        >
          <NavLinks className="grid grid-cols-4 gap-0 lg:flex" />
        </nav>
        <div className="-mr-2 flex items-center gap-1 justify-self-end">
          <Link
            href="/resume"
            className="flex min-h-11 items-center px-2 pt-0.5 text-[0.9375rem] leading-none font-semibold text-on-sign transition-colors duration-150 fine:hover:text-signal"
          >
            Resume
          </Link>
          <CommandTrigger />
          <CustomizeTrigger className="border-0 text-on-sign aria-expanded:text-signal fine:hover:text-signal" />
        </div>
      </div>
    </header>
  );
}
