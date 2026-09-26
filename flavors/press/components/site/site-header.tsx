import Link from "next/link";
import { CommandTrigger } from "@/flavors/press/components/command";
import { CustomizeTrigger } from "@/flavors/press/components/customize";
import { RegMark } from "@/flavors/press/components/ui/reg-mark";

import { site } from "@/content/site";

import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/**
 * The head of the sheet: the registration mark and the name, sheets 2 to 5,
 * then Resume, ⌘K, the plate view and Customize. Below lg the nav drops to
 * a second row.
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
          data-cursor="Sheet 1"
          className="flex min-h-14 items-center gap-2.5 justify-self-start text-[0.9375rem] leading-none font-bold tracking-[-0.01em]"
        >
          <RegMark className="size-4" />
          {site.name}
        </Link>
        <nav
          aria-label="Primary"
          className="col-span-2 row-start-2 -mx-gutter border-y border-rule px-gutter lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:mx-0 lg:border-0 lg:px-0"
        >
          <NavLinks className="justify-between gap-3 sm:justify-start sm:gap-7" />
        </nav>
        <div className="-mr-2 flex items-center gap-0.5 justify-self-end lg:col-start-3 lg:row-start-1">
          <Link
            href="/resume"
            className="hidden min-h-11 items-center px-2 text-sm leading-none font-semibold underline decoration-transparent decoration-3 underline-offset-[0.45em] sm:flex fine:hover:decoration-pink"
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
