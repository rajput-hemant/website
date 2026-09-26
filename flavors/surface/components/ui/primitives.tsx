import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/surface/lib/utils";

/** A status lamp. `on` lights it; `pulse` is for work in progress only. */
export function Led({
  on,
  pulse,
  className,
}: {
  on?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-on={on ? "" : undefined}
      data-pulse={pulse ? "" : undefined}
      className={cn("led", className)}
    />
  );
}

/** An engraved label. */
export function Legend({
  as: Tag = "p",
  className,
  children,
  ...props
}: {
  as?: "p" | "span" | "h2" | "h3" | "dt" | "div";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <Tag className={cn("legend", className)} {...props}>
      {children}
    </Tag>
  );
}

/** Legends joined with the faceplate's middle dot. */
export function LegendRow({ parts }: { parts: readonly React.ReactNode[] }) {
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <span aria-hidden> &nbsp;·&nbsp; </span>}
      {part}
    </React.Fragment>
  ));
}

type KeyLinkProps = {
  href: string;
  size?: "md" | "sm";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithRef<"a">, "href" | "className" | "children">;

/** A hardware key that goes somewhere: internal routes use next/link, others open in a new tab. */
export function KeyLink({
  href,
  size = "md",
  className,
  children,
  ...props
}: KeyLinkProps) {
  const classes = cn("key", size === "sm" && "key-sm", className);
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/** Four screw heads in the corners of a positioned panel. */
export function Screws({ className }: { className?: string }) {
  return (
    <span aria-hidden className={className}>
      <span className="screw top-3 left-4 [--r:24deg]" />
      <span className="screw top-3 right-4 [--r:-58deg]" />
      <span className="screw bottom-2.5 left-4 [--r:81deg]" />
      <span className="screw right-4 bottom-2.5 [--r:-12deg]" />
    </span>
  );
}

/** A link out of the site, underlined, opening in a new tab. */
export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "underline decoration-ink-3 underline-offset-[0.22em] transition-[text-decoration-color] duration-150 fine:hover:decoration-ink",
        className
      )}
    >
      {children}
      <span aria-hidden className="ml-0.5 text-ink-3">
        ↗
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
