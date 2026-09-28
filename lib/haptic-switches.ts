/**
 * The iOS side of `TouchHaptics`. Safari's only haptic is the tick of a native
 * `<input type=checkbox switch>` toggled by a real tap, so a transparent one
 * is laid over each toggle control: the finger toggles it (iOS ticks) and the
 * click bubbles on to the control, whose own state stays the source of truth.
 * `ios-haptics` builds the overlay (aria-hidden, tabIndex -1, opacity 0,
 * absolutely placed, so no layout shift and nothing announced); a tap that
 * would focus it focuses the control instead.
 *
 * Only toggles get one: a native switch keeps a touch that starts on it from
 * scrolling the page, fine on a small control, not on every link.
 */

/** Controls that get the overlay: switches, and toggles that opt in. */
export const SWITCH_HOSTS = "[role=switch], [data-haptic-switch]";

/** The attribute `ios-haptics` marks its overlay with. */
const OVERLAY = "[data-haptic-trigger]";

type Attach = (host: HTMLElement) => void;

const wired = new WeakSet<Element>();

/** Hands focus from the overlay to its control, as a tap on the control would. */
function keepFocusOnHost(host: HTMLElement): void {
  const overlay = host.querySelector(`:scope > ${OVERLAY}`);
  if (!overlay || wired.has(overlay)) return;
  wired.add(overlay);
  overlay.addEventListener("focus", () => {
    host.focus({ preventScroll: true });
  });
}

function hostsIn(node: Element): HTMLElement[] {
  const found = [
    ...(node.matches(SWITCH_HOSTS) ? [node] : []),
    ...node.querySelectorAll(SWITCH_HOSTS),
  ];
  return found.filter(
    (host): host is HTMLElement =>
      host instanceof HTMLElement && !host.closest('[data-haptic="none"]')
  );
}

/**
 * Overlays a native switch on every toggle control under `root`, now and as
 * more mount (a Customize panel opening). Returns the teardown, which stops
 * watching, removes the overlays and undoes the positioning they needed.
 */
export function overlaySwitches(root: Element, attach: Attach): () => void {
  // `ios-haptics` makes a static host `position: relative` inline so the
  // overlay can fill it; the inline value it replaced, restored on teardown.
  const positioned = new Map<HTMLElement, string>();
  const add = (node: Node) => {
    if (!(node instanceof Element)) return;
    for (const host of hostsIn(node)) {
      const before = host.style.position;
      attach(host);
      if (host.style.position !== before && !positioned.has(host)) {
        positioned.set(host, before);
      }
      keepFocusOnHost(host);
    }
  };
  // React replacing a host's children (a text change sets `textContent`)
  // deletes the overlay with them; put it back on that host. Re-attaching
  // only adds nodes, so it never feeds this branch again.
  const restore = (record: MutationRecord) => {
    const lost = [...record.removedNodes].some(
      (node) => node instanceof Element && node.matches(OVERLAY)
    );
    if (!lost || !(record.target instanceof Element)) return;
    const host = record.target.closest(SWITCH_HOSTS);
    if (host && root.contains(host)) add(host);
  };
  add(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach(add);
      restore(record);
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    for (const overlay of root.querySelectorAll(OVERLAY)) overlay.remove();
    for (const [host, before] of positioned) host.style.position = before;
    positioned.clear();
  };
}
