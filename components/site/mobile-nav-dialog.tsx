"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, Moon, Search, Sun, X } from "lucide-react";

import { nav } from "@/content/site";
import { originOf, revealTheme } from "@/lib/interaction/theme-reveal";
import { openCommandMenu } from "@/components/command/command-events";
import { IconButton } from "@/components/ui/icon-button";

import { isActivePath } from "./nav-links";
import { Wordmark } from "./wordmark";

export type MobileNavDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Rows cascade in 30ms apart as the sheet opens (`@starting-style`, so only
 * opacity and a 4px lift, and only on the way in). Reduced motion keeps the
 * sheet's own fade and drops the cascade.
 */
const rowClass =
  "delay-[calc(var(--row)*30ms)] in-data-[motion=off]:delay-0 motion-safe:transition-[opacity,translate] motion-safe:duration-(--duration-enter,220ms) motion-safe:ease-(--ease-enter,cubic-bezier(0.23,1,0.32,1)) motion-safe:starting:translate-y-1 motion-safe:starting:opacity-0";

const cascade = (index: number) => ({ "--row": index }) as React.CSSProperties;

const utilityClass =
  "flex min-h-12 w-full items-center gap-3 text-base text-muted transition-colors hover:text-foreground active:text-foreground";

/** The loaded menu: a Base UI modal sheet under the header row. */
export function MobileNavDialog({ open, onOpenChange }: MobileNavDialogProps) {
  const pathname = usePathname();
  // Search waits for the sheet to finish closing, so focus has settled first.
  const searchAfterClose = React.useRef(false);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = document.documentElement.dataset.theme === "dark";
    revealTheme(isDark ? "light" : "dark", originOf(event));
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen || !searchAfterClose.current) return;
        searchAfterClose.current = false;
        openCommandMenu();
      }}
    >
      <Dialog.Trigger
        render={<IconButton label="Open menu" className="lg:hidden" />}
      >
        <Menu aria-hidden strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 transition-opacity duration-(--duration-enter,220ms) data-ending-style:opacity-0 data-ending-style:duration-(--duration-exit,160ms) data-starting-style:opacity-0" />
        <Dialog.Popup
          data-lenis-prevent
          className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto border-b border-hairline bg-background px-(--gutter) pb-4 font-sans shadow-popover transition-[translate,opacity] duration-(--duration-enter,220ms) ease-(--ease-enter,cubic-bezier(0.23,1,0.32,1)) outline-none data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-ending-style:duration-(--duration-exit,160ms) data-starting-style:-translate-y-2 data-starting-style:opacity-0"
        >
          {/* The header's column, so the wordmark and close button sit where the header's were. */}
          <div className="mx-auto max-w-(--content-width)">
            <div className="-mr-2 flex h-(--header-h) items-center justify-between">
              <Dialog.Title className="sr-only">Menu</Dialog.Title>
              <Wordmark onClick={() => onOpenChange(false)} />
              <Dialog.Close render={<IconButton label="Close menu" />}>
                <X aria-hidden strokeWidth={1.75} />
              </Dialog.Close>
            </div>
            <nav aria-label="Primary">
              <ul className="border-t border-hairline">
                {nav.map((item, index) => (
                  <li
                    key={item.href}
                    className={`border-b border-hairline ${rowClass}`}
                    style={cascade(index)}
                  >
                    <Link
                      href={item.href}
                      aria-current={
                        isActivePath(pathname, item.href) ? "page" : undefined
                      }
                      onClick={() => onOpenChange(false)}
                      className="group/item flex min-h-12 items-center justify-between text-lg text-muted transition-colors hover:text-foreground active:text-foreground aria-[current=page]:text-foreground"
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
            <ul aria-label="Tools" className="mt-2 grid grid-cols-2 gap-x-6">
              <li className={rowClass} style={cascade(nav.length)}>
                <button
                  type="button"
                  className={utilityClass}
                  onClick={() => {
                    searchAfterClose.current = true;
                    onOpenChange(false);
                  }}
                >
                  <Search
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-4 text-subtle"
                  />
                  Search
                </button>
              </li>
              <li className={rowClass} style={cascade(nav.length + 1)}>
                <button
                  type="button"
                  data-icon-swap
                  className={utilityClass}
                  onClick={toggleTheme}
                >
                  <Moon
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-4 text-subtle dark:hidden"
                  />
                  <Sun
                    aria-hidden
                    strokeWidth={1.75}
                    className="hidden size-4 text-subtle dark:block"
                  />
                  <span className="dark:hidden">Dark theme</span>
                  <span className="hidden dark:inline">Light theme</span>
                </button>
              </li>
            </ul>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
