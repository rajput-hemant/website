"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";
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
  /**
   * `center` (the default): a bottom sheet on phones, centred from `sm` up.
   * `top`: pinned 12vh from the top at every width and hugging its content,
   * so a dialog whose content changes height (the ⌘K results) grows
   * downwards instead of re-centring, and never stretches to the bottom.
   */
  placement?: "center" | "top";
  className?: string;
  backdropClassName?: string;
};

const PLACEMENT = {
  center:
    "bottom-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:data-[starting-style]:translate-y-0 sm:data-[ending-style]:translate-y-0",
  top: "top-[max(1rem,12vh)] bottom-auto border-b sm:data-[starting-style]:translate-y-2 sm:data-[ending-style]:translate-y-2",
} as const;

/**
 * Overlay + popup: centered on desktop, a bottom sheet on mobile. Base UI's
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
  placement = "center",
  className,
  backdropClassName,
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
            "fixed inset-0 z-50 bg-ground/75",
            "motion:transition-opacity motion:duration-(--duration-ui)",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            backdropClassName
          )}
        />
        <BaseDialog.Popup
          initialFocus={initialFocus}
          className={cn(
            "fixed inset-x-0 z-50 max-h-[85svh] overflow-y-auto border-t border-line-strong bg-ground p-6 text-ink shadow-lift",
            "sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:border",
            PLACEMENT[placement],
            "motion:transition-all motion:duration-(--duration-ui) motion:ease-enter",
            "data-[starting-style]:translate-y-4 data-[starting-style]:opacity-0",
            "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0",
            "sm:data-[ending-style]:scale-95 sm:data-[starting-style]:scale-95",
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
                  "font-display text-h3 leading-none font-[540] uppercase [font-stretch:66%]",
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
