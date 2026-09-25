import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { isSanityConfigured } from "@/lib/env";
import { SanityLive } from "@/sanity/lib/live";

/** Mount once in the root layout. Renders nothing outside draft mode. */
export async function DraftModeTools() {
  if (!isSanityConfigured) return null;
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <>
      <SanityLive includeDrafts />
      <VisualEditing />
    </>
  );
}
