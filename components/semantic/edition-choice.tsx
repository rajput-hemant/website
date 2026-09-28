import type * as React from "react";

import { isEditionPinned } from "@/lib/env";

/**
 * Wraps an edition's way to change edition (its footer link to the picker).
 * A deploy pinned with `NEXT_PUBLIC_FLAVOR` has no picker, so this renders
 * nothing there; the value is inlined at build time.
 */
export function EditionChoice({ children }: { children: React.ReactNode }) {
  return isEditionPinned ? null : children;
}
