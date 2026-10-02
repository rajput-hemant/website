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

export function PadPoster() {
  return (
    <Svg viewBox="0 0 20 20">
      <path d="M4 7l10-2.5 3 9.5-10 2.5z" />
      <path d="M4 7l10-2.5.8 2.6-10 2.5z" fill="var(--color-accent-soft)" />
      <path d="M7 16.5l10-2.5.3 1.2-10 2.5z" />
    </Svg>
  );
}

export function RollPoster() {
  return (
    <Svg viewBox="0 0 20 20">
      <rect x="3" y="4" width="14" height="5" rx="2.5" />
      <ellipse cx="4.5" cy="6.5" rx="1.2" ry="2.3" fill="none" />
    </Svg>
  );
}

export function EnvelopePoster() {
  return (
    <Svg viewBox="0 0 20 14">
      <rect x="2" y="2" width="16" height="10" rx="0.5" />
      <path d="M2 2l8 6 8-6" fill="none" />
    </Svg>
  );
}

export function LetterPoster() {
  return (
    <Svg viewBox="0 0 24 22">
      <path d="M4 8l8-6 8 6" />
      <rect x="6" y="4" width="12" height="10" />
      <rect x="4" y="8" width="16" height="11" rx="0.5" />
      <path d="M4 8l8 6 8-6" fill="none" />
    </Svg>
  );
}

export function SheetPoster() {
  return (
    <Svg viewBox="0 0 20 28">
      <path d="M3 2h14v24H3z" />
      <path d="M6 8h8M6 12h8M6 16h8M6 20h5" fill="none" />
    </Svg>
  );
}

export function ClipPoster() {
  return (
    <Svg viewBox="0 0 10 26">
      <path
        d="M2 24V8a3 3 0 016 0v13a2 2 0 01-4 0V9"
        fill="none"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

export function PadlockPoster() {
  return (
    <Svg viewBox="0 0 24 28">
      <rect x="4" y="12" width="16" height="13" rx="1.5" />
      <path d="M7.5 12V8.5a4.5 4.5 0 019 0V12" fill="none" />
    </Svg>
  );
}

export function KeytagPoster() {
  return (
    <Svg viewBox="0 0 16 36">
      <path d="M8 1v10" fill="none" />
      <path d="M3 11h10v22H3z" />
      <circle cx="8" cy="15" r="1.4" fill="none" />
    </Svg>
  );
}

export function CrumplePoster() {
  return (
    <Svg viewBox="0 0 24 24">
      <path d="M4 7l5-3 5 2 6-2 1 8-3 4 2 5-8-1-5 2-4-5 2-5z" />
      <path d="M9 4l1 7 4-5M10 11l-4 1M14 6l1 6 4 2M15 12l-1 6" fill="none" />
    </Svg>
  );
}

export function DogearPoster() {
  return (
    <Svg viewBox="0 0 20 20">
      <path d="M2 2h10l6 6v10H2z" fill="none" />
      <path d="M12 2v6h6z" />
    </Svg>
  );
}
