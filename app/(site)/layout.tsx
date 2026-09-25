import { getProfile } from "@/lib/data";
import { CommandMenu } from "@/components/command/command-menu";
import { InteractionLayer } from "@/components/interaction/interaction-layer";
import { MotionProvider } from "@/components/interaction/motion-provider";
import { PageTransition } from "@/components/interaction/page-transition";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <MotionProvider>
      <SkipLink />
      <SiteHeader />
      <PageTransition>
        <main id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      </PageTransition>
      <SiteFooter links={profile.links} />
      <InteractionLayer />
      <CommandMenu />
    </MotionProvider>
  );
}
