"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import {
  useFinePointer,
  usePrefersReducedMotion,
} from "@/lib/hooks/use-media-query";
import { usePrefs } from "@/lib/prefs-store";

import { ClickSound } from "./click-sound";
import { Cursor } from "./cursor";

// Lenis is only fetched for visitors who will actually get smooth scrolling.
const SmoothScroll = dynamic(
  () => import("./smooth-scroll").then((mod) => mod.SmoothScroll),
  { ssr: false }
);

/**
 * The optional interaction layer: smooth scroll, cursor follower and click sound.
 * Each piece mounts only when its preference is on and the device suits it
 * (fine pointer; for anything that moves, the motion switch on and no OS
 * reduced motion). Renders nothing during SSR and hydration, and nothing in
 * the Studio.
 */
export function InteractionLayer() {
  const pathname = usePathname();
  const { motion, smoothScroll, cursor, sound } = usePrefs();
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();

  if (pathname.startsWith("/studio")) return null;

  const canMove = finePointer && motion && !reducedMotion;

  return (
    <>
      {canMove && smoothScroll && <SmoothScroll />}
      {canMove && cursor && <Cursor />}
      {finePointer && sound && <ClickSound />}
    </>
  );
}
