export type CursorState =
  | "default"
  | "link"
  | "external"
  | "copy"
  | "copied"
  | "text"
  | "drag"
  | "disabled"
  | "hidden";

const INTERACTIVE = [
  "a[href]",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "[role=button]",
  "[role=link]",
  "[role=switch]",
  "[role=radio]",
  "[role=checkbox]",
  "[role=tab]",
  "[role=menuitem]",
  "[role=option]",
  "[role=slider]",
].join(", ");
const TEXT_ENTRY = "textarea, [contenteditable]:not([contenteditable=false])";
const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);
/** Media on /lab can be dragged or pointed at; the cursor says so. */
const DRAGGABLE_MEDIA = "canvas, video, img, picture";
const EXPLICIT_STATES = new Set<CursorState>([
  "link",
  "external",
  "copy",
  "text",
  "drag",
]);
/** Targets up to this size (px, both sides) pull the ring towards their centre. */
const MAGNET_MAX_SIZE = 64;

function isExternal(anchor: HTMLAnchorElement) {
  return anchor.target === "_blank" || anchor.host !== window.location.host;
}

function isDisabled(element: Element) {
  return (
    element.matches(":disabled") ||
    element.closest("[aria-disabled=true], fieldset:disabled") !== null
  );
}

export type ResolvedTarget = {
  state: CursorState;
  /** The control the ring may snap towards, when it's small enough to benefit. */
  magnet: Element | null;
};

function magnetFor(control: Element | null): Element | null {
  if (!control) return null;
  if (control.closest("nav")) return control;
  const { width, height } = control.getBoundingClientRect();
  return width <= MAGNET_MAX_SIZE && height <= MAGNET_MAX_SIZE ? control : null;
}

/** What the ring should look like over `target`. */
export function resolveCursorTarget(
  target: Element | null,
  pathname: string
): ResolvedTarget {
  const none = (state: CursorState): ResolvedTarget => ({
    state,
    magnet: null,
  });
  if (!target) return none("default");
  if (target.closest("iframe")) return none("hidden");

  const control = target.closest(INTERACTIVE);
  if (control && isDisabled(control)) return none("disabled");

  // `html` carries `data-cursor="on|off"` for the preference; skip it.
  const tagged = target.closest<HTMLElement>("[data-cursor]:not(html)");
  const explicit = tagged?.dataset.cursor as CursorState | undefined;
  if (explicit && EXPLICIT_STATES.has(explicit)) {
    return { state: explicit, magnet: magnetFor(tagged ?? null) };
  }

  if (target.closest(TEXT_ENTRY)) return none("text");
  if (control) {
    if (
      control instanceof HTMLInputElement &&
      !NON_TEXT_INPUTS.has(control.type)
    ) {
      return none("text");
    }
    const state =
      control instanceof HTMLAnchorElement && isExternal(control)
        ? "external"
        : "link";
    return { state, magnet: magnetFor(control) };
  }

  if (pathname.startsWith("/lab") && target.closest(DRAGGABLE_MEDIA)) {
    return none("drag");
  }
  return none("default");
}
