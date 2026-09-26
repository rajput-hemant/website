import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-b border-accent text-ink",
  ghost:
    "border-b border-line-strong text-ink fine:hover:border-ink aria-expanded:border-accent",
  quiet: "text-ink-soft fine:hover:text-ink",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-11 text-[0.75rem]",
  md: "h-12 text-[0.8125rem]",
};

const iconVariantClass: Record<ButtonVariant, string> = {
  primary: "border border-accent text-accent",
  ghost:
    "border border-line text-ink fine:hover:border-line-strong aria-expanded:border-accent aria-expanded:text-accent",
  quiet: "text-ink-soft fine:hover:text-ink aria-expanded:text-accent",
};

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds `data-magnetic`; an inner span carries `data-magnetic-inner` (moves at half). */
  magnetic?: boolean;
  /** Renders `children` (a single element, e.g. a `next/link`) instead of a `<button>`, merging these classes onto it. */
  asChild?: boolean;
  /** The trailing redline arrow. @default true for primary */
  arrow?: boolean;
  className?: string;
};

export type ButtonProps = ButtonOwnProps &
  Omit<React.ComponentPropsWithRef<"button">, keyof ButtonOwnProps>;

const arrowGlyph = (
  <span
    aria-hidden
    className="text-accent fine:motion:transition-transform fine:motion:duration-200 fine:motion:ease-enter fine:motion:group-hover/button:translate-x-[3px]"
  >
    →
  </span>
);

/** The sheet's call to action: condensed caps over an underline. */
export function Button({
  variant = "primary",
  size = "md",
  magnetic,
  asChild,
  arrow = variant === "primary",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(
    "group/button inline-flex items-center gap-2.5 font-display leading-none font-semibold tracking-[0.11em] whitespace-nowrap uppercase [font-stretch:72%] transition-[color,border-color,translate] duration-200 motion:active:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className
  );

  type ChildProps = {
    className?: string;
    children?: React.ReactNode;
  } & Record<string, unknown>;
  if (asChild && React.isValidElement<ChildProps>(children)) {
    return React.cloneElement(
      children,
      {
        ...props,
        className: cn(classes, children.props.className),
        "data-magnetic": magnetic ? "" : undefined,
      },
      children.props.children,
      arrow ? arrowGlyph : null
    );
  }

  return (
    <button
      type={type}
      className={classes}
      data-magnetic={magnetic ? "" : undefined}
      {...props}
    >
      {magnetic ? <span data-magnetic-inner>{children}</span> : children}
      {arrow ? arrowGlyph : null}
    </button>
  );
}

export type IconButtonProps = {
  /** Required: the button has no visible text, so this becomes its accessible name. */
  label: string;
  variant?: ButtonVariant;
  className?: string;
} & Omit<
  React.ComponentPropsWithRef<"button">,
  "className" | "type" | "aria-label"
>;

/** 44px square, icon-only. */
export function IconButton({
  label,
  variant = "ghost",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "press inline-flex size-11 items-center justify-center transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        iconVariantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
