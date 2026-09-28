import Link from "next/link";
import { CommandTrigger } from "@/flavors/darkroom/components/command";
import { CustomizeTrigger } from "@/flavors/darkroom/components/customize";
import { ROLL } from "@/flavors/darkroom/lib/roll";

import { getProfile, getSiteIdentity } from "@/lib/data";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * The top of the sheet: the name and the roll, frames 01 to 04, then
 * availability, Resume, ⌘K, the safelight switch and Customize. Below lg
 * the nav drops to its own row.
 */
export async function SiteHeader() {
  const site = await getSiteIdentity();
  const profile = await getProfile();
  return (
    <header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="relative z-20 border-b border-line"
    >
      <div className="mx-auto grid max-w-[96rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter lg:h-16 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-h-14 items-center justify-self-start text-[1.0625rem] leading-none font-semibold tracking-[-0.01em]"
        >
          <span className="flex items-baseline gap-2.5">
            {site.name}
            <span className="edge text-[0.75rem]">Roll {ROLL}</span>
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter overflow-x-auto border-t border-line px-gutter lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:mx-0 lg:overflow-visible lg:border-0 lg:px-0"
        >
          <NavLinks className="gap-5 pb-1 sm:gap-7" />
        </nav>
        <div className="-mr-2 flex items-center gap-1 justify-self-end lg:col-start-3 lg:row-start-1">
          {profile.availability ? (
            <p className="mr-3 hidden items-center gap-2 text-sm text-soft xl:flex">
              <span
                aria-hidden
                className="size-[7px] rounded-full bg-grease shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-grease)_22%,transparent)]"
              />
              {profile.availability}
            </p>
          ) : null}
          <Link
            href="/resume"
            className="hidden min-h-11 items-center px-2 text-sm leading-none font-semibold sm:flex fine:hover:underline fine:hover:decoration-grease"
          >
            Resume
          </Link>
          <CommandTrigger />
          <ThemeToggle className="max-sm:hidden" />
          <CustomizeTrigger />
        </div>
      </div>
    </header>
  );
}
