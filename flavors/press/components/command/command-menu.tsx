"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useCommandShortcuts } from "@/components/semantic/command/use-command-shortcuts";

import { goKeys } from "./shortcuts";

const CommandDialog = dynamic(
  () => import("./command-dialog").then((mod) => mod.CommandDialog),
  { ssr: false }
);

/** The always-loaded part of ⌘K: keyboard shortcuts. The dialog loads on first use. */
export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState<boolean | null>(null);

  useCommandShortcuts({
    keys: goKeys,
    onOpen: () => setOpen(true),
    onToggle: () => setOpen((current) => !current),
    navigate: (href) => router.push(href),
  });

  return open === null ? null : (
    <CommandDialog open={open} onOpenChange={setOpen} />
  );
}
