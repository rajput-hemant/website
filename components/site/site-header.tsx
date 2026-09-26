import Link from "next/link";

import { CommandTrigger } from "@/components/command";
import { CustomizeTrigger } from "@/components/customize";
import { Container } from "@/components/ui";

import { NavLinks } from "./nav-links";
import { StickyChrome } from "./sticky-chrome";

/**
 * Sticky, translucent header: wordmark, primary nav (hidden below 768px,
 * where SiteDock takes over), a quiet Resume link, ⌘K and the customize
 * trigger.
 */
export function SiteHeader() {
  return (
    <StickyChrome>
      <Container className="flex h-full items-center justify-between gap-4">
        <Link
          href="/"
          data-magnetic
          data-cursor="Home"
          className="shrink-0 font-display text-lg tracking-[-0.01em] whitespace-nowrap text-paper"
        >
          Hemant Rajput
        </Link>

        <div className="-mr-2 flex items-center gap-1">
          <nav aria-label="Primary" className="hidden md:block">
            <NavLinks />
          </nav>
          <div
            aria-hidden
            className="hidden h-6 w-px bg-rule md:mx-1.5 md:block"
          />
          <Link
            href="/resume"
            data-magnetic
            className="hidden h-10 items-center rounded-sm px-3 text-sm text-graphite transition-colors duration-(--duration-ui) md:flex fine:hover:text-paper"
          >
            Resume
          </Link>
          <CommandTrigger />
          <CustomizeTrigger />
        </div>
      </Container>
    </StickyChrome>
  );
}
