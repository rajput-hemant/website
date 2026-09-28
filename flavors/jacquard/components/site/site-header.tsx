import Link from "next/link";
import { CommandTrigger } from "@/flavors/jacquard/components/command";
import { CustomizeTrigger } from "@/flavors/jacquard/components/customize";
import { TwillMark } from "@/flavors/jacquard/components/ui/twill-mark";

import { site } from "@/content/site";
import { getExperience, getProjects } from "@/lib/data";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * The head of the sample book: the twill mark and the name, cards 2 to 5
 * with their counts, then Resume, ⌘K, the loom switch and Customize. Below
 * md the nav drops to a second row.
 */
export async function SiteHeader() {
  const [projects, experience] = await Promise.all([
    getProjects(),
    getExperience(),
  ]);
  return (
    <header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="relative z-20 border-b border-rule"
    >
      <div className="mx-auto grid max-w-[90rem] grid-cols-[1fr_auto] items-center gap-x-4 px-gutter md:h-16 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex min-h-14 items-center gap-3 justify-self-start font-display text-[0.9375rem] leading-none tracking-[0.16em] uppercase"
        >
          <TwillMark className="size-3.5" />
          {site.name}
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter border-t border-rule px-gutter md:col-span-1 md:col-start-2 md:row-start-1 md:mx-0 md:border-0 md:px-0"
        >
          <NavLinks
            counts={{
              "/projects": projects.length,
              "/work": experience.length,
            }}
            className="justify-between gap-2 md:justify-start"
          />
        </nav>
        <div className="-mr-2 flex items-center gap-1 justify-self-end md:col-start-3 md:row-start-1">
          <Link
            href="/resume"
            className="mr-1 hidden min-h-11 items-center px-1 text-sm font-medium sm:flex"
          >
            <span className="thread-link">Resume</span>
          </Link>
          <CommandTrigger />
          <ThemeToggle className="max-sm:hidden" />
          <CustomizeTrigger />
        </div>
      </div>
    </header>
  );
}
