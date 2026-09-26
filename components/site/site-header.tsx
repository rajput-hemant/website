import Link from "next/link";

import { site } from "@/content/site";
import { CommandTrigger } from "@/components/command";
import { CustomizeTrigger } from "@/components/customize";

import { NavLinks } from "./nav-links";

const [first = "", ...rest] = site.name.split(" ");
const surname = rest.join(" ").toUpperCase();

/**
 * The sheet header: wordmark, the sheet index (desktop; the dock takes over
 * below 768px), then Resume, ⌘K and customize. Sticky under the frame's top
 * band, pure CSS.
 */
export function SiteHeader() {
  return (
    <header
      data-site-header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-(--frame-inset) z-20 flex h-13 items-center justify-between gap-4 border-b border-line bg-ground px-4 md:top-[calc(var(--frame-inset)+0.875rem)] md:grid md:h-15 md:grid-cols-[1fr_auto_1fr] md:px-12"
    >
      <Link
        href="/"
        data-magnetic
        data-cursor="Home"
        className="min-h-11 items-center font-display text-lg leading-none font-[620] tracking-[0.03em] whitespace-nowrap [font-stretch:66%] md:justify-self-start"
      >
        {first.charAt(0)}
        <span className="text-accent">.</span> {surname}
      </Link>

      <nav aria-label="Primary" className="hidden md:block">
        <NavLinks />
      </nav>

      <div className="-mr-2 flex items-center gap-1 md:justify-self-end">
        <Link
          href="/resume"
          data-magnetic
          className="min-h-11 items-center px-2 font-display text-[0.8125rem] leading-none font-semibold tracking-[0.09em] text-ink-soft uppercase [font-stretch:72%] transition-colors duration-200 fine:hover:text-ink"
        >
          Resume
        </Link>
        <CommandTrigger />
        <CustomizeTrigger />
      </div>
    </header>
  );
}
