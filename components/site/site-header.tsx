import { CommandTrigger } from "@/components/command/command-trigger";
import { CustomizePanel } from "@/components/customize/customize-panel";
import { Separator } from "@/components/ui/separator";

import { Container } from "./container";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { StickyHeader } from "./sticky-header";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  return (
    <StickyHeader>
      <Container
        size="frame"
        className="flex h-(--header-h) items-center justify-between gap-4"
      >
        {/* Optical alignment: lifts the Fraunces baseline onto the nav labels'. */}
        <Wordmark className="shrink-0 whitespace-nowrap lg:-translate-y-[3px]" />
        <div className="-mr-2 flex items-center gap-1">
          <nav aria-label="Primary" className="hidden lg:block">
            <NavLinks />
          </nav>
          <Separator
            orientation="vertical"
            className="mx-1.5 hidden lg:block"
          />
          <CommandTrigger />
          <CustomizePanel />
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </StickyHeader>
  );
}
