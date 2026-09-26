"use client";

import * as React from "react";

/**
 * Clipboard state for a "copy email" control. `copy()` writes the address and
 * reports success; where the clipboard is refused it opens the mail client
 * instead. `copied` resets after `resetMs`. The caller owns every label and
 * announcement.
 */
export function useCopyEmail(
  email: string,
  resetMs: number
): { copied: boolean; copy(): Promise<boolean> } {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return false;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetMs);
    return true;
  }, [email, resetMs]);

  return { copied, copy };
}
