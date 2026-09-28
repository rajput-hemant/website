import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

/*
 * The glyphs' posters: line drawings of each object at rest, in the page's
 * ink and paper. They are what T0, no JavaScript and the first paint show,
 * and they hold the glyph's box so nothing shifts when the 3D takes over.
 */

function Svg({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden
      focusable="false"
      className={cn("size-full overflow-visible text-subtle", className)}
      fill="var(--color-surface)"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

export function ClockPoster() {
  return (
    <Svg viewBox="0 0 20 20">
      <ellipse cx="10" cy="10" rx="8.2" ry="7.6" />
      <path d="M10 10V5.2M10 10l3 1.6" fill="none" />
    </Svg>
  );
}

export function CardPoster({ className }: { className?: string }) {
  return (
    <Svg viewBox="0 0 16 11" className={className}>
      <path d="M1.5 1.5h13l-.8 8.5H2.3z" />
      <path d="M1.5 1.5l6.5 4 6.5-4" fill="none" />
    </Svg>
  );
}

export function FanPoster() {
  return (
    <Svg viewBox="0 0 24 20">
      <path d="M12 18L5.5 6.5l4-2.2z" />
      <path d="M12 18l-1.8-13h3.6z" />
      <path d="M12 18l2.5-13.7 4 2.2z" />
    </Svg>
  );
}

export function TenurePoster() {
  return (
    <Svg viewBox="0 0 22 18">
      <path d="M3 13l8 3 8-3-8-3z" />
      <path d="M3 10l8 3 8-3-8-3z" />
      <path d="M3 7l8 3 8-3-8-3z" />
    </Svg>
  );
}

export function FolderPoster() {
  return (
    <Svg viewBox="0 0 20 16">
      <path d="M2 3.5h5l1.5 1.8H18v8.7H2z" />
      <path d="M2 14l1.6-7h16l-1.6 7z" />
    </Svg>
  );
}
