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
  /**
   * Drops the header row (the title stays for assistive tech, the close
   * button goes) and lays the children flush with the popup, for a dialog
   * whose content carries its own header (the search field of the ⌘K menu).
   */
  hideHeader?: boolean;
  description?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires once the dialog has finished opening, or has fully left. */
  onOpenChangeComplete?: (open: boolean) => void;
  /** What takes focus on open, e.g. a search field; the first control by default. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  className?: string;
  /** Skip enter/exit motion (keyboard-opened ⌘K and other high-frequency opens). */
  instant?: boolean;
};

/**
 * Overlay and popup: centred on desktop, a bottom sheet on mobile. Base UI's
 * root handles the focus trap and Escape/outside-click close.
 */
export function Dialog({
  trigger,
  title,
  hideTitle,
  hideHeader,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  initialFocus,
  className,
  instant,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
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
            !instant &&
              "motion:transition-opacity motion:duration-(--duration-ui)",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        />
        <BaseDialog.Popup
          initialFocus={initialFocus}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-lg bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink shadow-lift",
            "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:pb-6",
            !instant &&
              "motion:transition-all motion:duration-(--duration-ui) motion:ease-enter",
            !instant &&
              "data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0",
            !instant &&
              "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0",
            !instant &&
              "sm:data-[starting-style]:translate-y-0 sm:data-[starting-style]:scale-95",
            !instant &&
              "sm:data-[ending-style]:translate-y-0 sm:data-[ending-style]:scale-95",
            className
          )}
        >
          {hideHeader ? (
            // No close button: it would be an invisible stop in the focus
            // trap. Escape and a click outside still dismiss.
            <BaseDialog.Title className="sr-only">{title}</BaseDialog.Title>
          ) : (
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
          )}
          {description ? (
            <BaseDialog.Description className="mt-3 text-sm text-ink-soft">
              {description}
            </BaseDialog.Description>
          ) : null}
          {hideHeader ? (
            children
          ) : children ? (
            <div className="mt-4">{children}</div>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
