import Link from "next/link";
import { CommandTrigger } from "@/flavors/survey/components/command";
import { CustomizeTrigger } from "@/flavors/survey/components/customize";

import { site } from "@/content/site";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * The sheet's top margin: the name in spaced capitals, the nav, then Resume,
 * ⌘K, the night chart and Customize. Translucent, so the map scrolls under
 * it. Below 48rem the nav drops to its own row.
 */
export function SiteHeader() {
  return (
    <header
      data-site-header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-30 border-b border-rule bg-ground/85 backdrop-blur-md backdrop-saturate-150 supports-[not(backdrop-filter:blur(1px))]:bg-ground"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter md:h-15 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="spaced flex min-h-14 items-center justify-self-start text-[0.8125rem] leading-none tracking-[0.32em] md:min-h-11"
        >
          {site.name}
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter overflow-x-auto border-t border-rule px-gutter md:col-span-1 md:col-start-2 md:row-start-1 md:mx-0 md:overflow-visible md:border-0 md:px-0"
        >
          <NavLinks className="gap-7 max-md:justify-between" />
        </nav>
        <div className="-mr-2 flex items-center gap-0.5 justify-self-end md:col-start-3 md:row-start-1">
          <Link
            href="/resume"
            className="flex min-h-11 items-center px-2 text-sm font-medium text-ink transition-colors duration-150 fine:hover:text-water"
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
