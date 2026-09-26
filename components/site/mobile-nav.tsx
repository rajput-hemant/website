"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";

const loadDialog = () => import("./mobile-nav-dialog");

/** The menu button as it looks before the dialog code arrives. */
function TriggerShell({ onOpen }: { onOpen?: () => void }) {
  return (
    <IconButton
      label="Open menu"
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={onOpen}
      onPointerEnter={() => void loadDialog()}
      onFocus={() => void loadDialog()}
      className="lg:hidden"
    >
      <Menu aria-hidden strokeWidth={1.75} />
    </IconButton>
  );
}

const MobileNavDialog = dynamic(
  () => loadDialog().then((mod) => mod.MobileNavDialog),
  { ssr: false, loading: () => <TriggerShell /> }
);

/**
 * Compact menu for small screens. Base UI's dialog stays out of the initial
 * bundle: touching or focusing the button warms the chunk, and the first tap
 * mounts it already open.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [lastPathname, setLastPathname] = React.useState(pathname);

  // Close on any route change, including back/forward while the sheet is open.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  if (!mounted) {
    return (
      <TriggerShell
        onOpen={() => {
          setMounted(true);
          setOpen(true);
        }}
      />
    );
  }

  return <MobileNavDialog open={open} onOpenChange={setOpen} />;
}
