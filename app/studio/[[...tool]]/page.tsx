import config from "@/sanity.config";
import { NextStudio } from "next-sanity/studio";

import { isSanityConfigured } from "@/lib/env";

export { metadata, viewport } from "next-sanity/studio";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto max-w-(--content-width) px-4 py-16">
        <h1 className="font-serif text-2xl">Sanity is not configured</h1>
        <p className="text-muted mt-4">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in{" "}
          <code>.env.local</code> and restart the dev server. See{" "}
          <code>docs/sanity.md</code>.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
