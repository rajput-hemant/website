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
        <Wordmark />
        <div className="-mr-2 flex items-center gap-0.5">
          <nav aria-label="Primary" className="hidden md:block">
            <NavLinks />
          </nav>
          <Separator orientation="vertical" className="mx-2 hidden md:block" />
          <CustomizePanel />
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </StickyHeader>
  );
}
