/**
 * The poster handoff (docs/m2-scene-spec.md): a server-rendered
 * `[data-scene-poster]` holds its box until a live frame covers it, then fades
 * out over 400ms on `--ease-enter` and reads `data-scene-poster="hidden"`.
 * Dependency-free, so the loader in the initial JS can use it.
 */
export function showPoster(
  poster: HTMLElement,
  visible: boolean,
  fade: boolean
) {
  poster.style.transition = fade ? "opacity 400ms var(--ease-enter, ease)" : "";
  poster.style.opacity = visible ? "" : "0";
  poster.dataset.scenePoster = visible ? "" : "hidden";
}

/** The posters that belong to `owner`: its direct `[data-scene-poster]` children. */
export function postersOf(owner: Element): HTMLElement[] {
  return [
    ...owner.querySelectorAll<HTMLElement>(":scope > [data-scene-poster]"),
  ];
}
