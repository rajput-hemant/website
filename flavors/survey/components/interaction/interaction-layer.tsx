"use client";

import * as React from "react";

import { usePointerEffects } from "@/components/semantic/interaction/use-pointer-effects";

import { Cursor, type CursorApi } from "./cursor";

/** Magnetic buttons and tilted cards from the shared pointer effects, plus the reticle. */
export function InteractionLayer() {
  const cursor = React.useRef<CursorApi>(null);
  usePointerEffects({
    onMove: (x, y) => cursor.current?.move(x, y),
    onHover: (target) => cursor.current?.hover(target),
    onLeave: () => cursor.current?.hide(),
  });
  return <Cursor ref={cursor} />;
}
