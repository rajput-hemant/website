import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/minimal/components/ask/owner-sign-in";
import { Container } from "@/flavors/minimal/components/site/container";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";

import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = {
  title: "Owner",
  description: "Sign in to reply and moderate on the site.",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <OwnerProvider>
      <Container className="stagger">
        <PageHeader
          title="Owner"
          description="Sign in with your passphrase to reply on Ask and moderate new messages right on the site."
        />
        <OwnerSignIn />
      </Container>
    </OwnerProvider>
  );
}
