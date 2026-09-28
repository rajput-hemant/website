"use client";

import dynamic from "next/dynamic";

import { useCommandMenu } from "@/components/semantic/command/use-command-menu";

import { goKeys } from "./shortcuts";

const CommandDialog = dynamic(
  () => import("./command-dialog").then((mod) => mod.CommandDialog),
  { ssr: false }
);

/** The always-loaded part of ⌘K: keyboard shortcuts. The dialog loads on first use. */
export function CommandMenu() {
  const { open, setOpen } = useCommandMenu(goKeys);

  return open === null ? null : (
    <CommandDialog open={open} onOpenChange={setOpen} />
  );
}
