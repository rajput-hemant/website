"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { OPEN_COMMAND_EVENT } from "@/lib/command/events";
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
  const [instantOpen, setInstantOpen] = React.useState(true);
  const openedByPointer = React.useRef(false);

  const syncInstantOpen = React.useCallback(() => {
    setInstantOpen(!openedByPointer.current);
    openedByPointer.current = false;
  }, []);

  React.useEffect(() => {
    const markPointerOpen = (event: Event) => {
      const detail: unknown =
        event instanceof CustomEvent ? event.detail : undefined;
      openedByPointer.current =
        typeof detail === "object" &&
        detail !== null &&
        "pointer" in detail &&
        Boolean(detail.pointer);
    };
    window.addEventListener(OPEN_COMMAND_EVENT, markPointerOpen, true);
    return () =>
      window.removeEventListener(OPEN_COMMAND_EVENT, markPointerOpen, true);
  }, []);

  const { open, setOpen: setOpenBase } = useCommandMenu(goKeys, {
    onWillOpen: syncInstantOpen,
  });

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean | null>) => {
      setOpenBase((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        if (next === true && prev !== true) syncInstantOpen();
        return next;
      });
    },
    [setOpenBase, syncInstantOpen]
  );

  return open === null ? null : (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      instantOpen={instantOpen}
    />
  );
}
