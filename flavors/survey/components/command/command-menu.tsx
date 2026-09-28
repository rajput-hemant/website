"use client";

import dynamic from "next/dynamic";

import { useCommandMenu } from "@/components/semantic/command/use-command-menu";

import { goKeys } from "./shortcuts";

const CommandDialog = dynamic(
  () => import("./command-dialog").then((mod) => mod.CommandDialog),
  { ssr: false }
);

/**
 * The always-loaded part of ⌘K: keyboard shortcuts and nothing else. The
 * dialog, cmdk and the index load on first use.
 */
export function CommandMenu() {
  const { open, setOpen } = useCommandMenu(goKeys);

  // `null` until first opened, so nothing past this file loads before then.
  return open === null ? null : (
    <CommandDialog open={open} onOpenChange={setOpen} />
  );
}
