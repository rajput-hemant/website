"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { IconButton } from "./button";

/**
 * A proof laid on the table: centred on desktop, a sheet from the bottom on
 * mobile. Base UI handles the focus trap, scroll lock and Escape.
 */
export function Dialog({
  title,
  hideTitle,
  children,
  open,
  onOpenChange,
  className,
}: {
  title: React.ReactNode;
  hideTitle?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-[rgb(21_24_29/0.45)] transition-opacity duration-(--duration-ui) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto bg-sheet p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-sheet outline-none",
            "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2",
            "transition-[opacity,translate,scale] duration-(--duration-ui) ease-enter data-ending-style:translate-y-4 data-ending-style:opacity-0 data-starting-style:translate-y-4 data-starting-style:opacity-0 sm:data-ending-style:translate-y-[-50%] sm:data-ending-style:scale-[0.97] sm:data-starting-style:translate-y-[-50%] sm:data-starting-style:scale-[0.97]",
            className
          )}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-4",
              hideTitle && "sr-only"
            )}
          >
            <BaseDialog.Title className="text-h3 font-black">
              {title}
            </BaseDialog.Title>
            <BaseDialog.Close
              render={
                <IconButton label="Close" className="-mt-2 -mr-2">
                  <X aria-hidden strokeWidth={1.75} />
                </IconButton>
              }
            />
          </div>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
