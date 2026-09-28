import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md";

const variantClass: Record<ButtonVariant, string> = {
  primary: "rounded-md bg-ink px-5 text-sheet fine:hover:bg-water",
  ghost:
    "rounded-md border border-rule-strong px-5 text-ink fine:hover:border-water fine:hover:text-water aria-expanded:bg-ink aria-expanded:text-sheet",
  quiet: "px-1 text-ink-soft fine:hover:text-ink",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-11 text-sm",
  md: "h-12 text-base",
};

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds `data-magnetic`; an inner span carries `data-magnetic-inner` (moves at half). */
  magnetic?: boolean;
  /** Renders `children` (a single element, e.g. a `next/link`) with these classes merged on. */
  asChild?: boolean;
  className?: string;
};

export type ButtonProps = ButtonOwnProps &
  Omit<React.ComponentPropsWithRef<"button">, keyof ButtonOwnProps>;

/** A plain printed control: solid ink, or a hairline outline. */
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
    "press inline-flex items-center justify-center gap-2.5 font-sans leading-none font-semibold whitespace-nowrap transition-colors duration-200 [&_svg]:size-4",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
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
      {magnetic ? (
        <span data-magnetic-inner className="inline-flex items-center gap-2.5">
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export type IconButtonProps = {
  /** The button has no visible text, so this becomes its accessible name. */
  label: string;
  className?: string;
} & Omit<
  React.ComponentPropsWithRef<"button">,
  "className" | "type" | "aria-label"
>;

/** 44px square, icon-only. */
export function IconButton({
  label,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "press inline-flex size-11 items-center justify-center rounded-md text-ink-soft transition-colors duration-200 aria-expanded:text-water fine:hover:text-ink [&_svg]:size-4",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
