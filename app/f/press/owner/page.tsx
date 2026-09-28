import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/press/components/ask/owner-sign-in";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";

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
          scene={null}
        />
        <Container className="mt-12">
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
