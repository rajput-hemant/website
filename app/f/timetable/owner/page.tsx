import type { Metadata } from "next";
import { OwnerHeader } from "@/flavors/timetable/components/ask/owner-header";
import { OwnerSignIn } from "@/flavors/timetable/components/ask/owner-sign-in";
import { Page } from "@/flavors/timetable/components/site/page";
import { SceneView } from "@/flavors/timetable/components/site/scene-view";
import { LeversPoster } from "@/flavors/timetable/components/site/view-posters";
import { Container } from "@/flavors/timetable/components/ui";

import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = {
  title: "Owner",
  description: "Sign in to reply and moderate on the site.",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <Page>
      <OwnerProvider>
        <OwnerHeader
          platform="6"
          kicker="Staff only"
          title="Owner"
          lede="Sign in with your passphrase to reply at the desk and moderate new messages right on the site."
        />
        <Container className="mt-12 flex items-start gap-10">
          <div className="min-w-0 flex-1">
            <OwnerSignIn />
          </div>
          <SceneView
            id="levers"
            poster={<LeversPoster />}
            className="h-36 w-44 flex-none cursor-grab touch-pan-y active:cursor-grabbing max-md:hidden"
          />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
