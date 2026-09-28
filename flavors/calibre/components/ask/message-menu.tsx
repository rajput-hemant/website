"use client";

import dynamic from "next/dynamic";

import type { ModerateRequest } from "@/lib/ask/client";
import { useOwner } from "@/components/semantic/ask/owner-provider";

/* Visitors never load the menu, its popup or its positioning. */
const OwnerMenu = dynamic(
  () => import("./owner-menu").then((mod) => mod.OwnerMenu),
  { ssr: false }
);

/** The author's menu on a published visitor message, for the author only. */
export function MessageMenu(props: {
  slug: string;
  target: ModerateRequest["target"];
  label: string;
}) {
  const { owner } = useOwner();
  return owner ? <OwnerMenu {...props} /> : null;
}
