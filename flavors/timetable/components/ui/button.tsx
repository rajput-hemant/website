import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary: "rounded-md bg-ink px-5 text-ground",
  ghost:
    "rounded-md px-5 text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] aria-expanded:bg-ink aria-expanded:text-ground",
  quiet: "px-1 text-ink-soft fine:hover:text-ink",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-11 text-[0.9375rem]",
  md: "h-12 text-base",
};

const iconVariantClass: Record<ButtonVariant, string> = {
  primary: "rounded-md bg-ink text-ground",
  ghost: "rounded-md text-current aria-expanded:text-signal",
  quiet: "text-ink-soft fine:hover:text-ink aria-expanded:text-ink",
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
    className="-mt-0.5 text-[1.2em] fine:motion:transition-transform fine:motion:duration-200 fine:motion:ease-enter fine:motion:group-hover/button:translate-x-[3px]"
  >
    →
  </span>
);

/** A wayfinding button: a solid sign plate, or its outline. */
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
    "group/button press inline-flex items-center justify-between gap-3 pt-0.5 font-sans leading-none font-bold whitespace-nowrap transition-colors duration-200",
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
