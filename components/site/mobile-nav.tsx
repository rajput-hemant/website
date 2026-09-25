"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { nav } from "@/content/site";
import { IconButton } from "@/components/ui/icon-button";

import { isActivePath } from "./nav-links";

/** Compact menu for small screens: a modal sheet under the header row. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close on any route change, including back/forward while the sheet is open.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<IconButton label="Open menu" className="md:hidden" />}
      >
        <Menu aria-hidden strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          data-lenis-prevent
          className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto border-b border-border bg-background px-(--gutter) pb-8 font-sans shadow-popover transition-[translate,opacity] duration-300 ease-snappy outline-none data-ending-style:-translate-y-3 data-ending-style:opacity-0 data-starting-style:-translate-y-3 data-starting-style:opacity-0"
        >
          <div className="flex h-(--header-h) items-center justify-between">
            <Dialog.Title className="meta text-subtle">Menu</Dialog.Title>
            <Dialog.Close render={<IconButton label="Close menu" />}>
              <X aria-hidden strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <nav aria-label="Primary">
            <ol className="border-t border-border">
              {nav.map((item, index) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href} className="border-b border-border">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="group/item flex items-baseline gap-4 py-3.5 text-muted transition-colors hover:text-foreground aria-[current=page]:text-foreground"
                    >
                      <span className="w-5 meta text-subtle group-aria-[current=page]/item:text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="display text-2xl">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
