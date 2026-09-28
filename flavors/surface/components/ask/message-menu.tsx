"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { useOwner } from "@/components/semantic/ask/owner-provider";

import type { MessageMenuPopup as Popup } from "./message-menu-popup";

const MessageMenuPopup = dynamic(
  () => import("./message-menu-popup").then((mod) => mod.MessageMenuPopup),
  { ssr: false }
);

/**
 * The owner's moderation menu on a published message. Visitors never get
 * it, so Base UI's menu and floating-ui load only once the owner session
 * check says yes.
 */
export function MessageMenu(props: React.ComponentProps<typeof Popup>) {
  const { owner } = useOwner();
  return owner ? <MessageMenuPopup {...props} /> : null;
}
