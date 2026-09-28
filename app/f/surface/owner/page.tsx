import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/surface/components/ask/owner-sign-in";
import { Panel } from "@/flavors/surface/components/site/panel";

import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

export const metadata: Metadata = {
  title: "Owner",
  description: "Sign in to reply and moderate on the site.",
  robots: { index: false, follow: false },
};

export default function OwnerPage() {
  return (
    <OwnerProvider>
      <Panel
        ch="06"
        name="Owner sign-in"
        title="Owner"
        lede="Sign in with your passphrase to reply on Ask and moderate new messages right on the site."
      >
        <OwnerSignIn />
      </Panel>
    </OwnerProvider>
  );
}
