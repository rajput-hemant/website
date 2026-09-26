import { CommandMenu } from "@/components/command";
import { PrefsSync } from "@/components/prefs/prefs-sync";
import {
  DeferredShell,
  DrawingFrame,
  SiteDock,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/components/site";

/**
 * The shell for every public page: the drawing frame, header, footer, mobile
 * dock, and the client singletons that survive navigations. CommandMenu stays
 * eager (keyboard shortcuts only, so ⌘K works at once); the motion and
 * pointer stack waits for idle in DeferredShell. `/studio` sits outside this
 * group, so it never gets this chrome.
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
      <DrawingFrame />
      <div className="m-(--frame-inset) pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pt-3.5 md:pb-0 md:pl-3.5">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
      <SiteDock />
      <CommandMenu />
      <DeferredShell />
    </>
  );
}
