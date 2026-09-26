import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/drawing-set/components/ask/owner-sign-in";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import { Container, PageHeader } from "@/flavors/drawing-set/components/ui";
import { sheets } from "@/flavors/drawing-set/content";

import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = {
  title: "Owner",
  description: "Sign in to reply and moderate on the site.",
  robots: { index: false, follow: false },
};

const askSheet = sheets.find((entry) => entry.href === "/ask")?.sheet ?? "06";

export default function OwnerPage() {
  return (
    <Page>
      <OwnerProvider>
        <Container>
          <PageHeader
            sheet={askSheet}
            eyebrow="Owner sign-in"
            title="Owner"
            lede="Sign in with your passphrase to reply on Ask and moderate new messages right on the site."
          />
          <SceneSlot route="ask" size="window" />
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
