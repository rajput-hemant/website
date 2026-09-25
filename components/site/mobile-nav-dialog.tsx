"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { nav } from "@/content/site";
import { IconButton } from "@/components/ui/icon-button";

import { isActivePath } from "./nav-links";
import { Wordmark } from "./wordmark";

export type MobileNavDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** The loaded menu: a Base UI modal sheet under the header row. */
export function MobileNavDialog({ open, onOpenChange }: MobileNavDialogProps) {
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        render={<IconButton label="Open menu" className="md:hidden" />}
      >
        <Menu aria-hidden strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 transition-opacity duration-(--duration-enter,220ms) data-ending-style:opacity-0 data-ending-style:duration-(--duration-exit,160ms) data-starting-style:opacity-0" />
        <Dialog.Popup
          data-lenis-prevent
          className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto border-b border-hairline bg-background px-(--gutter) pb-6 font-sans shadow-popover transition-[translate,opacity] duration-(--duration-enter,220ms) ease-(--ease-enter,cubic-bezier(0.23,1,0.32,1)) outline-none data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-ending-style:duration-(--duration-exit,160ms) data-starting-style:-translate-y-2 data-starting-style:opacity-0"
        >
          <div className="-mr-2 flex h-(--header-h) items-center justify-between">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Wordmark onClick={() => onOpenChange(false)} />
            <Dialog.Close render={<IconButton label="Close menu" />}>
              <X aria-hidden strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <nav aria-label="Primary">
            <ul className="border-t border-hairline">
              {nav.map((item) => (
                <li key={item.href} className="border-b border-hairline">
                  <Link
                    href={item.href}
                    aria-current={
                      isActivePath(pathname, item.href) ? "page" : undefined
                    }
                    onClick={() => onOpenChange(false)}
                    className="group/item flex min-h-12 items-center justify-between text-lg text-muted transition-colors hover:text-foreground aria-[current=page]:text-foreground"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-accent opacity-0 group-aria-[current=page]/item:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
