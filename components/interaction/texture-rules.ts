import { type Texture } from "@/lib/prefs";

export type TextureGate = {
  texture: Texture;
  /** The site's motion switch. */
  motion: boolean;
  /** The OS reduced-motion setting. */
  reducedMotion: boolean;
};

/**
 * Whether the live texture (ambient drift, parallax, grain, tap or click
 * ripple) should load at all: only with a texture on and motion allowed by
 * both the site switch and the OS, on any pointer. The pointer spotlight is
 * the one part that needs a mouse (see `hasSpotlight`). Otherwise the texture
 * is a still CSS layer and the effects code is never fetched.
 */
export function textureIsLive({
  texture,
  motion,
  reducedMotion,
}: TextureGate): boolean {
  return texture !== "none" && motion && !reducedMotion;
}

/**
 * The pointer spotlight follows a mouse or trackpad, so touch screens skip
 * it. Every line and dot texture has a lit version; noise only flickers.
 */
export function hasSpotlight(texture: Texture, finePointer: boolean): boolean {
  return finePointer && texture !== "none" && texture !== "noise";
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
  '[tabindex]:not([tabindex="-1"])',
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
