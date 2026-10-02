import type { Metadata } from "next";
import { OwnerSignIn } from "@/flavors/minimal/components/ask/owner-sign-in";
import { Glyph } from "@/flavors/minimal/components/scene/glyph";
import {
  KeytagPoster,
  PadlockPoster,
} from "@/flavors/minimal/components/scene/posters";
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
        <div data-glyph-region className="relative">
          <PageHeader
            title="Owner"
            description="Sign in with your passphrase to reply on Ask and moderate new messages right on the site."
          />
          <Glyph
            kind="keytag"
            view="keytag"
            className="absolute top-16 right-0 h-16 w-7 sm:top-24"
          >
            <KeytagPoster />
          </Glyph>
        </div>
        <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
          <div className="min-w-0 flex-1 basis-80">
            <OwnerSignIn />
          </div>
          <Glyph kind="padlock" lead className="h-16 w-14">
            <PadlockPoster />
          </Glyph>
        </div>
      </Container>
    </OwnerProvider>
  );
}
