import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/mission/components/ask/owner-sign-in";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";

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
          section={null}
          kicker="Flight director only"
          title="Owner"
          lede="Sign in with your passphrase to answer on the capcom loop and moderate new questions in place."
          scene={null}
        />
        <Container className="mt-12">
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
