"use client";

import dynamic from "next/dynamic";

import { useOwner } from "@/components/semantic/ask/owner-provider";

const ModerationQueue = dynamic(
  () => import("./moderation-queue").then((mod) => mod.ModerationQueue),
  { ssr: false }
);

/** The author's moderation queue, loaded only once the author is signed in. */
export function ModerationStrip({ className }: { className?: string }) {
  const { owner } = useOwner();
  return owner ? <ModerationQueue className={className} /> : null;
}
