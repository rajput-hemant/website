import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const iconButtonVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-md text-muted transition-[background-color,color,border-color] duration-150 select-none hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-surface-2 data-popup-open:text-foreground [&_svg]:size-[1.0625rem] [&_svg]:shrink-0",
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

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> &
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
