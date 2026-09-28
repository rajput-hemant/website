import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/maquette/components/ask/owner-sign-in";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";

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
          frame={null}
          kicker="Author only"
          title="Owner"
          lede="Sign in with your passphrase to answer on the cards and moderate new questions in place."
          scene={null}
        />
        <Container className="mt-12">
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
