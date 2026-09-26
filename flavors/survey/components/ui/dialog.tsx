"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { IconButton } from "./button";

export type DialogProps = {
  title: React.ReactNode;
  /** Keeps the title as the accessible name without showing it. */
  hideTitle?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * A sheet laid over the map: centred on desktop, a bottom sheet on mobile.
 * Base UI handles the focus trap and Escape/outside-click close.
 */
export function Dialog({
  title,
  hideTitle,
  children,
  open,
  onOpenChange,
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-[rgb(8_18_20/0.45)] backdrop-blur-[2px] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion:transition-opacity motion:duration-(--duration-ui)" />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto border-t border-rule-strong bg-sheet p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink shadow-lift",
            "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:pb-6",
            "motion:transition-[translate,scale,opacity] motion:duration-(--duration-ui) motion:ease-enter",
            "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0",
            "sm:data-[ending-style]:translate-y-[-50%] sm:data-[ending-style]:scale-[0.97] sm:data-[starting-style]:translate-y-[-50%] sm:data-[starting-style]:scale-[0.97]",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <BaseDialog.Title
              className={cn(
                "spaced text-lg leading-none",
                hideTitle && "sr-only"
              )}
            >
              {title}
            </BaseDialog.Title>
            <BaseDialog.Close
              render={
                <IconButton label="Close" className="-mt-2 -mr-2">
                  <X strokeWidth={1.75} />
                </IconButton>
              }
            />
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
