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
      <Container className="flex h-(--header-h) items-center justify-between gap-4">
        <Wordmark className="shrink-0 whitespace-nowrap" />
        <div className="-mr-2 flex items-center gap-1">
          <nav aria-label="Primary" className="hidden md:block">
            <NavLinks />
          </nav>
          <Separator
            orientation="vertical"
            className="mx-1.5 hidden md:block"
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
