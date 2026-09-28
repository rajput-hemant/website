/** The element that owns the perspective transform for a `[data-tilt]` host. */
export function tiltSurface(host: HTMLElement): HTMLElement {
  return host.querySelector<HTMLElement>(":scope > .tilt") ?? host;
}
