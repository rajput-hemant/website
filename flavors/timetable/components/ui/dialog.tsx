"use client";

import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { IconButton } from "./button";

export type DialogProps = {
  trigger?: React.ReactNode;
  title: React.ReactNode;
  /** Keeps the title as the dialog's accessible name without showing it (e.g. a search dialog whose input is the visible heading). */
  hideTitle?: boolean;
  description?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * Overlay and popup: centred on desktop, a bottom sheet on mobile. Base UI's
 * root handles the focus trap and Escape/outside-click close.
 */
export function Dialog({
  trigger,
  title,
  hideTitle,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger ? (
        <BaseDialog.Trigger data-magnetic className="press">
          {trigger}
        </BaseDialog.Trigger>
      ) : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-[rgb(10_14_18/0.55)] backdrop-blur-[2px]",
            "motion:transition-opacity motion:duration-(--duration-ui)",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-lg bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink shadow-lift",
            "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:pb-6",
            "motion:transition-all motion:duration-(--duration-ui) motion:ease-enter",
            "data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0",
            "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0",
            "sm:data-[starting-style]:translate-y-0 sm:data-[starting-style]:scale-95",
            "sm:data-[ending-style]:translate-y-0 sm:data-[ending-style]:scale-95",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <BaseDialog.Title
              className={cn(
                "text-h3 leading-none font-extrabold tracking-[-0.015em]",
                hideTitle && "sr-only"
              )}
            >
              {title}
            </BaseDialog.Title>
            <BaseDialog.Close
              render={
                <IconButton
                  label="Close"
                  variant="quiet"
                  className="-mt-1 -mr-1"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </IconButton>
              }
            />
          </div>
          {description ? (
            <BaseDialog.Description className="mt-3 text-sm text-ink-soft">
              {description}
            </BaseDialog.Description>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
