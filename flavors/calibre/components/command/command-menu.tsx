"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { useCommandMenu } from "@/components/semantic/command/use-command-menu";

import { takePointerOpen } from "./open-source";
import { goKeys } from "./shortcuts";

const CommandDialog = dynamic(
  () => import("./command-dialog").then((mod) => mod.CommandDialog),
  { ssr: false }
);

/** The always-loaded part of ⌘K: keyboard shortcuts. The dialog loads on first use. */
export function CommandMenu() {
  const [animated, setAnimated] = React.useState(false);
  const { open, setOpen } = useCommandMenu(goKeys, {
    onWillOpen: () => setAnimated(takePointerOpen()),
  });

  return open === null ? null : (
    <CommandDialog open={open} instant={!animated} onOpenChange={setOpen} />
  );
}
