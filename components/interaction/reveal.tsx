import * as React from "react";

import { cn } from "@/lib/utils";

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "figure"
  | "ul"
  | "ol"
  | "li"
  | "p";

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  /** Rendered element; defaults to `div`. */
  as?: RevealTag;
};

/*
 * Thin, server-safe wrappers over the CSS-only first-paint entrance in
 * app/globals.css. Nothing here hides content: the animation is pure CSS, so
 * text is visible without JavaScript, before hydration, in print, and at once
 * under reduced motion or with the motion switch off. It plays once on the
 * first page load; later navigations are carried by the route transition.
 * New code can use the classes directly: `stagger` on a list, `stagger-self`
 * on a single block.
 */

/** Fades a block up 8px as the page first paints. */
export function Reveal({ as: Tag = "div", className, ...props }: RevealProps) {
  return <Tag className={cn("stagger-self", className)} {...props} />;
}

/** Cascades its direct children in: 50ms apart, capped at six steps. */
export function RevealGroup({
  as: Tag = "div",
  className,
  ...props
}: RevealProps) {
  return <Tag className={cn("stagger", className)} {...props} />;
}

/** One step of a `RevealGroup` cascade; it must be a direct child of the group. */
export function RevealItem({ as: Tag = "div", ...props }: RevealProps) {
  return <Tag {...props} />;
}
