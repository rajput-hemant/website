import { type Texture } from "@/lib/prefs";

export type TextureGate = {
  texture: Texture;
  finePointer: boolean;
  /** The site's motion switch. */
  motion: boolean;
  /** The OS reduced-motion setting. */
  reducedMotion: boolean;
};

/**
 * Whether the live texture (spotlight, parallax, grain drift, click ripple)
 * should load at all: only with a texture on, a mouse or trackpad, and motion
 * allowed by both the site switch and the OS. Otherwise the texture is a
 * static CSS layer and the effects code is never fetched.
 */
export function textureIsLive({
  texture,
  finePointer,
  motion,
  reducedMotion,
}: TextureGate): boolean {
  return texture !== "none" && finePointer && motion && !reducedMotion;
}

/** Grid and dots have a lit version for the pointer spotlight; noise only drifts. */
export function hasSpotlight(texture: Texture): boolean {
  return texture === "grid" || texture === "dots";
}

/** Anything that is, or reads as, content: a click here is never a background click. */
const CONTENT = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "summary",
  "details[open] > :not(summary)",
  "[role]",
  "[tabindex]",
  "[contenteditable]",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "dt",
  "dd",
  "blockquote",
  "pre",
  "code",
  "figure",
  "img",
  "svg",
  "canvas",
  "video",
  "iframe",
  "table",
  "span",
  "em",
  "strong",
  "time",
  "small",
  "[data-customize]",
  "[data-link-preview]",
].join(", ");

/**
 * Whether a click on `target` landed on empty background (the page, or a
 * layout box around content) rather than on text, media or a control.
 */
export function isBackgroundClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(CONTENT) === null;
}
