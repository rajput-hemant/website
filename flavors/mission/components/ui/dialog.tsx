"use client";

import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { IconButton } from "./button";

/**
 * A sheet laid on the console: centred on desktop, a sheet from the
 * bottom on mobile. Base UI handles the focus trap, scroll lock and Escape.
 * `instant` skips the entrance, for a dialog opened from the keyboard.
 */
export function Dialog({
  title,
  hideTitle,
  children,
  open,
  onOpenChange,
  instant = false,
  className,
}: {
  title: React.ReactNode;
  hideTitle?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  instant?: boolean;
  className?: string;
}) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-[rgb(14_20_39/0.4)]",
            !instant &&
              "transition-opacity duration-(--duration-ui) ease-out data-ending-style:opacity-0 data-starting-style:opacity-0"
          )}
        />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-none border-t border-rule-strong bg-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-card outline-none",
            "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-none sm:border",
            !instant &&
              "transition-[opacity,translate,scale] duration-(--duration-ui) ease-out data-ending-style:translate-y-3 data-ending-style:opacity-0 data-starting-style:translate-y-3 data-starting-style:opacity-0 sm:data-ending-style:translate-y-[-50%] sm:data-ending-style:scale-[0.98] sm:data-starting-style:translate-y-[-50%] sm:data-starting-style:scale-[0.98]",
            className
          )}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-4",
              hideTitle && "sr-only"
            )}
          >
            <BaseDialog.Title className="text-h3">{title}</BaseDialog.Title>
            <BaseDialog.Close
              render={
                <IconButton label="Close" className="-mt-2 -mr-2">
                  <X aria-hidden strokeWidth={1.5} />
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
