import * as React from "react";
import { cn } from "@/flavors/jacquard/lib/utils";

export type ButtonVariant = "ink" | "outline" | "quiet";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  ink: "bg-ink px-5 text-ground fine:hover:bg-madder",
  outline:
    "border border-rule-strong px-5 text-ink fine:hover:border-ink aria-expanded:border-ink",
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
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
} = {}) {
  return cn(
    "press inline-flex items-center justify-center gap-2.5 rounded-[3px] leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color,scale] duration-(--duration-ui) ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
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
        "press inline-grid size-11 place-items-center text-ink-soft transition-[color,scale] duration-(--duration-ui) ease-out disabled:opacity-50 fine:hover:text-ink [&_svg]:size-4.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** The small bordered chip of the header: ⌘K and the loom switch. */
export const chipClass =
  "press inline-flex min-h-11 items-center gap-2 px-1 font-mono text-label leading-none tracking-[0.06em] text-ink-soft transition-[color,scale] duration-(--duration-ui) ease-out fine:hover:text-ink [&>.chip-box]:rounded-[3px] [&>.chip-box]:border [&>.chip-box]:border-rule-strong [&>.chip-box]:px-2 [&>.chip-box]:py-1.5 fine:hover:[&>.chip-box]:border-ink";
