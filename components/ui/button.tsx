import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast fine:hover:bg-accent/90 border border-transparent",
  ghost:
    "border border-rule text-paper fine:hover:border-accent fine:hover:text-accent",
  quiet: "text-graphite fine:hover:text-paper",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-11 px-3.5 text-sm",
  md: "h-12 px-6 text-base",
};

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds `data-magnetic`; an inner span carries `data-magnetic-inner` (moves at half). */
  magnetic?: boolean;
  /** Renders `children` (a single element, e.g. a `next/link`) instead of a `<button>`, merging these classes onto it. */
  asChild?: boolean;
  className?: string;
};

export type ButtonProps = ButtonOwnProps &
  Omit<React.ComponentPropsWithRef<"button">, keyof ButtonOwnProps>;

export function Button({
  variant = "primary",
  size = "md",
  magnetic,
  asChild,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(
    "press inline-flex items-center justify-center gap-2 rounded-md font-sans transition-colors duration-(--duration-ui)",
    variantClass[variant],
    sizeClass[size],
    className
  );

  type ChildProps = { className?: string } & Record<string, unknown>;
  if (asChild && React.isValidElement<ChildProps>(children)) {
    return React.cloneElement(children, {
      ...props,
      className: cn(classes, children.props.className),
      "data-magnetic": magnetic ? "" : undefined,
    });
  }

  return (
    <button
      type={type}
      className={classes}
      data-magnetic={magnetic ? "" : undefined}
      {...props}
    >
      {magnetic ? <span data-magnetic-inner>{children}</span> : children}
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
        "press inline-flex size-11 items-center justify-center rounded-md transition-colors duration-(--duration-ui)",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
