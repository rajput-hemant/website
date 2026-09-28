import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";

export type ButtonVariant = "signal" | "ink" | "outline" | "quiet";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  signal:
    "border-[1.5px] border-signal bg-signal px-[1.125rem] text-on-signal fine:hover:border-ink fine:hover:bg-ink fine:hover:text-ground",
  ink: "border-[1.5px] border-ink bg-ink px-[1.125rem] text-ground fine:hover:border-signal fine:hover:bg-signal fine:hover:text-on-signal",
  outline:
    "border-[1.5px] border-ink px-[1.125rem] text-ink fine:hover:bg-ink fine:hover:text-ground aria-expanded:bg-ink aria-expanded:text-ground",
  quiet: "px-1.5 text-ink-soft fine:hover:text-ink aria-expanded:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 text-sm",
  md: "min-h-[2.875rem] text-[0.9375rem]",
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
    "press inline-flex items-center justify-center gap-3 font-display leading-none font-bold whitespace-nowrap transition-[color,background-color,border-color,scale] duration-(--duration-ui) ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
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

/** The small bordered chip of the header: ⌘K and the theme switch. */
export const chipClass =
  "press inline-flex min-h-11 items-center gap-2 px-1 font-mono text-label leading-none tracking-[0.06em] text-ink-soft uppercase transition-[color,scale] duration-(--duration-ui) ease-out fine:hover:text-ink [&>.chip-box]:border [&>.chip-box]:border-rule-strong [&>.chip-box]:px-2 [&>.chip-box]:pt-1.5 [&>.chip-box]:pb-1 fine:hover:[&>.chip-box]:border-ink";
