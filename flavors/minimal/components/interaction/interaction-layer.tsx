"use client";

import dynamic from "next/dynamic";
import {
  useFinePointer,
  usePrefersReducedMotion,
} from "@/flavors/minimal/lib/hooks/use-media-query";
import { usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePublicPathname } from "@/lib/public-pathname";

import { hasSpotlight, textureIsLive } from "./texture-rules";

// Every piece is fetched only for visitors who will actually get it, so the
// defaults (all effects off except link previews) ship none of this code.
const SmoothScroll = dynamic(
  () => import("./smooth-scroll").then((mod) => mod.SmoothScroll),
  { ssr: false }
);

const Cursor = dynamic(() => import("./cursor").then((mod) => mod.Cursor), {
  ssr: false,
});

const ClickSound = dynamic(
  () => import("./click-sound").then((mod) => mod.ClickSound),
  { ssr: false }
);

// The live texture and the Motion code it uses load only once it's switched on.
const TextureEffects = dynamic(
  () => import("./texture-effects").then((mod) => mod.TextureEffects),
  { ssr: false }
);

// Base UI's positioning code only loads for visitors who can hover links.
const LinkPreviewLayer = dynamic(
  () =>
    import("@/flavors/minimal/components/link-preview/link-preview-layer").then(
      (mod) => mod.LinkPreviewLayer
    ),
  { ssr: false }
);

/**
 * The optional interaction layer: smooth scroll, cursor follower, live
 * texture, link hover cards and click sound. Each piece mounts only when its preference is on and
 * the device suits it (fine pointer; for anything that moves, the motion switch
 * on and no OS reduced motion). Link previews have their own preference and
 * stay available under reduced motion, where they simply appear without
 * animating. Renders nothing during SSR and hydration, and nothing in the
 * Studio.
 */
export function InteractionLayer() {
  const pathname = usePublicPathname();
  const { motion, smoothScroll, cursor, sound, linkPreviews, texture } =
    usePrefs();
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();

  if (pathname.startsWith("/studio")) return null;

  const canMove = finePointer && motion && !reducedMotion;
  const liveTexture = textureIsLive({ texture, motion, reducedMotion });

  return (
    <>
      {canMove && smoothScroll && <SmoothScroll />}
      {canMove && cursor && <Cursor />}
      {liveTexture && (
        <TextureEffects
          key={texture}
          spotlight={hasSpotlight(texture, finePointer)}
        />
      )}
      {finePointer && linkPreviews && <LinkPreviewLayer />}
      {finePointer && sound && <ClickSound />}
    </>
  );
}
