import config from "@/sanity.config";
import { NextStudio } from "next-sanity/studio";

import { isSanityConfigured } from "@/lib/env";

export { metadata, viewport } from "next-sanity/studio";

export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "4rem 1rem",
          fontFamily: "system-ui",
        }}
      >
        <h1>Sanity is not configured</h1>
        <p className="mt-4 text-muted">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in{" "}
          <code>.env.local</code> and restart the dev server. See{" "}
          <code>docs/sanity.md</code>.
        </p>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
