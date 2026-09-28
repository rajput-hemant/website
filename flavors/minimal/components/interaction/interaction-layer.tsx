"use client";

import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePublicPathname } from "@/lib/public-pathname";
import {
  useFinePointer,
  useMediaQuery,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

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

// Touch UI clicks stay silent (audit 2.2), so the click layer is fine pointer
// only; confirmations (copied, sent) play on touch through confirmSound.
const SoundLayer = dynamic(
  () => import("./sound-layer").then((mod) => mod.SoundLayer),
  { ssr: false }
);

const TouchHaptics = dynamic(
  () =>
    import("@/components/semantic/touch-haptics").then(
      (mod) => mod.TouchHaptics
    ),
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
 * texture, link hover cards, click sound and touch haptics. Each piece mounts
 * only when its preference is on and the device suits it (fine pointer, or a
 * touch screen for haptics; for anything that moves, the motion switch on and
 * no OS reduced motion). Link previews have their own preference and
 * stay available under reduced motion, where they simply appear without
 * animating. Renders nothing during SSR and hydration, and nothing in the
 * Studio.
 */
export function InteractionLayer() {
  const pathname = usePublicPathname();
  const {
    motion,
    smoothScroll,
    cursor,
    sound,
    haptics,
    linkPreviews,
    texture,
  } = usePrefs();
  const finePointer = useFinePointer();
  const touch = useMediaQuery("(any-pointer: coarse)");
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
      {finePointer && sound && <SoundLayer />}
      {touch && haptics && <TouchHaptics />}
    </>
  );
}
