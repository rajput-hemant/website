import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

export type ButtonVariant = "ink" | "outline" | "quiet";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  ink: "bg-blue px-5 text-paper fine:hover:bg-ink",
  outline:
    "px-5 text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] fine:hover:bg-sheet aria-expanded:bg-sheet",
  quiet: "px-1.5 text-ink-soft fine:hover:text-ink aria-expanded:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 text-sm",
  md: "min-h-12 text-base",
};

/** The class list, for links that look like buttons. */
export function buttonClass({
  variant = "ink",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "press inline-flex items-center justify-center gap-2.5 leading-none font-bold whitespace-nowrap transition-colors duration-(--duration-ui) disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
    variants[variant],
    sizes[size],
    className
  );
}

export type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leans toward the pointer (the shared pointer effects). */
  magnetic?: boolean;
};

export function Button({
  variant,
  size,
  magnetic,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-magnetic={magnetic ? "" : undefined}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

/** A square icon control with its name for screen readers. */
export function IconButton({
  label,
  className,
  type = "button",
  children,
  ...props
}: React.ComponentPropsWithRef<"button"> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "press inline-grid size-11 place-items-center text-ink transition-colors duration-(--duration-ui) disabled:opacity-50 fine:hover:text-blue [&_svg]:size-4.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
