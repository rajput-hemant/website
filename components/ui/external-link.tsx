import { type ComponentProps } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ExternalLinkProps = Omit<
  ComponentProps<"a">,
  "href" | "target" | "rel"
> & {
  href: string;
  /** Draw the resting underline; turn off for links styled by their container. */
  underline?: boolean;
  /** Show the ↗ glyph. */
  arrow?: boolean;
};

/** A link that opens in a new tab, with a small ↗ that nudges on hover. */
export function ExternalLink({
  href,
  children,
  className,
  underline = true,
  arrow = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="external"
      className={cn("group/external", className)}
      {...props}
    >
      <span className={cn(underline && "link")}>{children}</span>
      {arrow && (
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.75}
          className="ml-0.5 inline-block size-[0.85em] align-[-0.06em] text-subtle transition-[translate,color] duration-200 ease-snappy group-hover/external:translate-x-[0.12em] group-hover/external:-translate-y-[0.12em] group-hover/external:text-accent"
        />
      )}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
