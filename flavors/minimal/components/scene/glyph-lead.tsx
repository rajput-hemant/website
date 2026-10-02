"use client";

import dynamic from "next/dynamic";

/**
 * The lead glyph's loader, fetched after hydration so none of the scene code,
 * not even the mount hook, is in a page's initial JS. It then waits for load
 * and idle, and for the glyph to near the viewport, before the scene chunk.
 */
export const GlyphLead = dynamic(
  () => import("./scene-loader").then((mod) => mod.SceneLoader),
  { ssr: false }
);
