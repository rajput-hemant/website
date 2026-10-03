import * as React from "react";
import { useFrame } from "@react-three/fiber";

import { isDevelopment } from "@/lib/env";
import { kick } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

import { renderGlyph } from "./glyphs";
import { LeadAnchor } from "./kit";

/**
 * Minimal's own ceiling per page (docs/flavors/minimal.md, "3D"), under the shared
 * 60 calls: the glyphs are small, so a page that needs more is doing too much.
 */
export const GLYPH_BUDGET = { calls: 16, triangles: 5000 } as const;

/** Development only: warns once when a frame's glyphs break the budget. */
function BudgetCheck() {
  const warned = React.useRef(false);
  // After every view has drawn (views run at priorities 1 to 4).
  useFrame(({ gl }) => {
    const { calls, triangles } = gl.info.render;
    if (warned.current) return;
    if (calls > GLYPH_BUDGET.calls || triangles > GLYPH_BUDGET.triangles) {
      warned.current = true;
      console.warn("Glyphs over budget:", { calls, triangles });
    }
  }, 100);
  return null;
}

/**
 * Wakes the clock for what the glyphs react to but the clock doesn't watch:
 * a hover or focus from the DOM contract, and any disclosure opening or
 * closing (`toggle` doesn't bubble, but a capturing listener hears it).
 */
function useWakeOnPage() {
  React.useEffect(() => {
    const wake = () => kick(2);
    const offStore = sceneStore.subscribe((s, prev) => {
      if (s.hovered !== prev.hovered || s.items !== prev.items) wake();
    });
    document.addEventListener("toggle", wake, true);
    return () => {
      offStore();
      document.removeEventListener("toggle", wake, true);
    };
  }, []);
}

/** View 0: the lead glyph, plus the tier monitor. */
export function World() {
  useWakeOnPage();
  return (
    <>
      <LeadAnchor render={renderGlyph} />
      <SceneMonitor />
      {isDevelopment && <BudgetCheck />}
    </>
  );
}
