"use client";

import dynamic from "next/dynamic";

import { useOwner } from "@/components/semantic/ask/owner-provider";

/* The queue loads only for the signed-in author. */
const ModerationQueue = dynamic(
  () => import("./moderation-queue").then((mod) => mod.ModerationQueue),
  { ssr: false }
);

/** The author's queue of pending and flagged messages, above the requests. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  return owner ? <ModerationQueue className={className} /> : null;
}
