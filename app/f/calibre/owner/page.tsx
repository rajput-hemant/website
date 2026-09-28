import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/calibre/components/ask/owner-sign-in";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";

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
          hour={null}
          kicker="Author only"
          title="Owner"
          lede="Sign in with your passphrase to answer in the request book and moderate new questions in place."
        />
        <Container className="mt-12">
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
