"use client";

import * as React from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import { sceneStore, useSceneStore } from "@/lib/scene/store";

/**
 * Steps a slow scene down a tier (DPR 1, then off to the poster). Remounted
 * on every clock wake, so idle gaps never read as slow frames. Render it
 * inside an edition's world.
 */
export function SceneMonitor() {
  const wake = useSceneStore((s) => s.wake);
  const setDpr = useThree((s) => s.setDpr);
  const onDecline = React.useCallback(() => {
    if (sceneStore.getState().tier === 2) {
      setDpr(1);
      sceneStore.setState({ tier: 1, maxTier: 1 });
    } else {
      sceneStore.setState({ tier: 0, maxTier: 0 });
    }
  }, [setDpr]);
  return (
    <PerformanceMonitor
      key={wake}
      ms={200}
      iterations={6}
      onDecline={onDecline}
    />
  );
}
