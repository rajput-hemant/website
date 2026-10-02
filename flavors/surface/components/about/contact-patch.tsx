"use client";

import { PatchBay } from "@/flavors/surface/components/instruments/patch";
import { playConfirm } from "@/flavors/surface/lib/sound/voices";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

type Link = { label: string; url: string };

/**
 * The contact patch bay: plug into Email to copy the address, or into
 * either of the first two links to open it. The links and the Copy key
 * beside it do the same with a keyboard.
 */
export function ContactPatch({
  email,
  links,
}: {
  email: string;
  links: readonly Link[];
}) {
  const clipboard = useCopyEmail(email, 2000);
  const sockets = links.slice(0, 2);

  return (
    <PatchBay
      name="contact"
      sockets={["Email", ...sockets.map((link) => link.label)]}
      onPlug={(socket) => {
        const link = sockets[socket - 1];
        if (socket === 0) {
          void clipboard.copy().then((ok) => ok && playConfirm());
        } else if (link) {
          window.open(link.url, "_blank", "noopener,noreferrer");
        }
      }}
    />
  );
}
