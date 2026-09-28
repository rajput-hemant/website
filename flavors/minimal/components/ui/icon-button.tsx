import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/*
 * The visible button stays small; a transparent pseudo-element grows the hit
 * area to at least 40px on each axis without moving anything.
 */
const hitArea =
  "before:absolute before:inset-[min(0px,calc((100%_-_2.5rem)/2))] before:rounded-[inherit]";

export const iconButtonVariants = cva(
  [
    "relative inline-grid shrink-0 place-items-center rounded-md text-muted transition-[background-color,color,border-color,scale] duration-(--duration-exit) select-none hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-surface-2 data-popup-open:text-foreground [&_svg]:size-[1.0625rem] [&_svg]:shrink-0",
    hitArea,
  ],
  {
    variants: {
      variant: {
        ghost: "hover:bg-surface-2",
        outline: "border border-border hover:bg-surface",
      },
      size: {
        sm: "size-8",
        md: "size-9",
      },
    },
    defaultVariants: { variant: "ghost", size: "sm" },
  }
);

export type IconButtonProps = Omit<
  React.ComponentProps<"button">,
  "aria-label"
> &
  VariantProps<typeof iconButtonVariants> & {
    /** Accessible name; icon buttons have no visible text. */
    label: string;
  };

export function IconButton({
  label,
  className,
  variant,
  size,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
