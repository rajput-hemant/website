import Link from "next/link";
import { CommandTrigger } from "@/flavors/maquette/components/command";
import { CustomizeTrigger } from "@/flavors/maquette/components/customize";
import { SCALE } from "@/flavors/maquette/lib/model";

import { site } from "@/content/site";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * The top of the model room: the name and the model's scale, the four
 * rooms, then Resume, ⌘K, the lamp and Customize. Below lg the nav drops
 * to its own row.
 */
export function SiteHeader() {
  return (
    <header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="relative z-20"
    >
      <div className="mx-auto grid max-w-[96rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter lg:h-16 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-h-14 items-center justify-self-start font-display text-base leading-none font-medium tracking-[0.01em]"
        >
          <span className="flex items-baseline gap-3">
            {site.name}
            <span className="num max-sm:hidden">Model room, {SCALE}</span>
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter overflow-x-auto border-t border-line px-gutter lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:mx-0 lg:overflow-visible lg:border-0 lg:px-0"
        >
          <NavLinks className="justify-between gap-5 sm:justify-start sm:gap-8" />
        </nav>
        <div className="-mr-2 flex items-center gap-1 justify-self-end lg:col-start-3 lg:row-start-1">
          <Link
            href="/resume"
            className="hidden min-h-11 items-center px-2 font-display text-[0.9375rem] leading-none sm:flex fine:hover:text-cut"
          >
            Resume
          </Link>
          <CommandTrigger />
          <ThemeToggle />
          <CustomizeTrigger />
        </div>
      </div>
    </header>
  );
}
