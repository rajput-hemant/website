import type { Metadata } from "next";

import { OwnerProvider } from "@/components/ask/owner-provider";
import { OwnerSignIn } from "@/components/ask/owner-sign-in";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

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
