import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/press/components/ask/owner-sign-in";
import {
  ChasePoster,
  TargetPoster,
} from "@/flavors/press/components/scene/view-posters";
import { ViewSlot } from "@/flavors/press/components/scene/view-slot";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { VIEW } from "@/flavors/press/lib/scene/views";

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
        <PageHeader
          sheet={null}
          kicker="Author only"
          title="Owner"
          lede="Sign in with your passphrase to reply on the corrections sheet and moderate new queries in place."
          scene="owner"
        />
        <Container className="mt-12 grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_auto]">
          <OwnerSignIn />
          <div className="flex items-center gap-6">
            {/* A chase locked by two quoins, and a target that registers on sign-in. */}
            <ViewSlot
              id={VIEW.chase}
              className="h-28 w-32"
              poster={<ChasePoster />}
            />
            <ViewSlot
              id={VIEW.target}
              className="size-28"
              poster={<TargetPoster />}
            />
          </div>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
