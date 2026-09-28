import * as React from "react";
import { cn } from "@/flavors/darkroom/lib/utils";

export type ButtonVariant = "ink" | "outline" | "quiet";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  /* A print on the easel: ink paper, ground-coloured type. */
  ink: "rounded-[3px] bg-ink px-4.5 text-ground fine:hover:bg-grease",
  outline:
    "rounded-[3px] px-4.5 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] fine:hover:shadow-[inset_0_0_0_1px_var(--color-ink)] aria-expanded:shadow-[inset_0_0_0_1px_var(--color-ink)]",
  quiet: "px-1.5 text-soft fine:hover:text-ink aria-expanded:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 text-sm",
  md: "min-h-12 text-[0.9375rem]",
};

/** The class list, for links that look like buttons. */
export function buttonClass({
  variant = "ink",
  size = "md",
  className,
}: {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
} = {}) {
  return cn(
    "press inline-flex items-center justify-center gap-3 leading-none font-semibold whitespace-nowrap transition-[color,background-color,box-shadow,scale] duration-(--duration-ui) ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
    variants[variant],
    sizes[size],
    className
  );
}

export type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
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
        "press inline-grid size-11 place-items-center text-soft transition-[color,scale] duration-(--duration-ui) ease-out disabled:opacity-50 fine:hover:text-ink [&_svg]:size-4.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
