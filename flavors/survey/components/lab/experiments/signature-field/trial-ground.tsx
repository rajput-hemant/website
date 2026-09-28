"use client";

import * as React from "react";
import { Edges, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Color } from "three";

import type { AccentColors } from "@/lib/lab/types";
import { tokenColor } from "@/lib/scene/colors";

/** One grid cell in stage units; every fourth line is an index line, as the contours. */
const CELL = 0.12;
const SECTION = CELL * 4;

/**
 * T2, the trial's survey ground: the sheet's grid behind the signature
 * field (water blue, an index line every fourth, fading toward the stage's
 * edges) and its neat line drawn round the field. It adds two draws to the
 * stage and never animates: the field's own frames draw it. Decorative.
 */
export function TrialGround({ colors }: { colors: AccentColors }) {
  const viewport = useThree((state) => state.viewport);
  const [cell, section] = React.useMemo(() => {
    // Lines sit a way toward the sheet, so the grid stays under the word.
    const sheet = new Color(tokenColor("--color-sheet", "#ebefe7"));
    const water = new Color(colors.accent);
    return [water.clone().lerp(sheet, 0.72), water.clone().lerp(sheet, 0.45)];
    // A new `colors` comes with each theme flip, and the sheet token with it.
  }, [colors]);

  return (
    <group position-z={-0.02}>
      <Grid
        rotation-x={Math.PI / 2}
        args={[viewport.width, viewport.height]}
        cellSize={CELL}
        sectionSize={SECTION}
        cellThickness={0.6}
        sectionThickness={1}
        cellColor={cell}
        sectionColor={section}
        fadeDistance={6.2}
        fadeStrength={1.5}
      />
      <mesh>
        <planeGeometry args={[viewport.width * 0.94, viewport.height * 0.9]} />
        <meshBasicMaterial visible={false} />
        <Edges color={colors.foreground} />
      </mesh>
    </group>
  );
}
