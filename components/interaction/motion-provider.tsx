/**
 * @deprecated The site no longer ships the Motion library: entrances are CSS
 * (`.stagger` in globals.css) and route changes use view transitions, both
 * gated by `data-motion` on <html>. Kept as a pass-through so the site layout
 * keeps compiling; remove it from app/(site)/layout.tsx.
 */
import * as React from "react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return children;
}
