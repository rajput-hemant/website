import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/survey/components/ask/owner-sign-in";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = {
  title: "Owner",
  description: "Sign in to reply and moderate on the site.",
  robots: { index: false, follow: false },
};

export default async function OwnerPage() {
  const relief = await getRelief();
  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          kicker="Surveyor only"
          title="Owner"
          lede="Sign in with your passphrase to answer in the notebook and moderate new entries right on the site."
          scene={{ relief, route: "owner" }}
        />
        <Container className="mt-12">
          <OwnerSignIn />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
