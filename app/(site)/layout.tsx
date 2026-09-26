import { CommandMenu } from "@/components/command";
import { ClickSound } from "@/components/customize";
import { InteractionLayer } from "@/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/components/link-preview";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { PrefsSync } from "@/components/prefs/prefs-sync";
import { SiteDock, SiteFooter, SiteHeader, SkipLink } from "@/components/site";

/**
 * The shell for every public page: header, footer, mobile dock, and the
 * client singletons that must mount once and survive navigations. `/studio`
 * lives outside this group entirely, so it never gets this chrome.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <PrefsSync />
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound />
      <SiteHeader />
      {/* Clears the fixed mobile dock so it never covers the last of the page. */}
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
        <SiteFooter />
      </div>
      <SiteDock />
      <CommandMenu />
      <LinkPreviewLayer />
    </>
  );
}
