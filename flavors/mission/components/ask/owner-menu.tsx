"use client";

import dynamic from "next/dynamic";

import type { ModerateRequest } from "@/lib/ask/client";
import { useOwner } from "@/components/semantic/ask/owner-provider";

const MessageMenu = dynamic(
  () => import("./message-menu").then((mod) => mod.MessageMenu),
  { ssr: false }
);

/** The author's moderation menu, loaded only once the author is signed in; visitors never fetch it. */
export function OwnerMenu(props: {
  slug: string;
  target: ModerateRequest["target"];
  label: string;
}) {
  const { owner } = useOwner();
  return owner ? <MessageMenu {...props} /> : null;
}
