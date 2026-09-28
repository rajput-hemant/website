import { kick, renderNow } from "./clock";
import {
  clearHovered,
  input,
  sceneStore,
  setHovered,
  type SceneItem,
} from "./store";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The page side of the contract: `[data-scene-item]` elements become items and
 * hover sources, `[data-scene-section]` drives progress, and the scene's
 * `active` id comes back as `data-scene-active`.
 */
export function bindSceneDom() {
  const itemOf = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLElement>("[data-scene-item]")
      : null;
  const over = (e: Event) => {
    const id = itemOf(e.target)?.dataset.sceneItem;
    if (id) setHovered(id);
  };
  const out = (e: PointerEvent | FocusEvent) => {
    const el = itemOf(e.target);
    const id = el?.dataset.sceneItem;
    if (!el || !id) return;
    if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
    clearHovered(id);
  };

  let section: Element | null = null;
  const board = () => {
    const slot = document.querySelector<HTMLElement>("[data-scene-board]");
    const next = slot?.dataset.sceneBoard ?? null;
    if (next !== sceneStore.getState().board)
      sceneStore.setState({ board: next });
  };
  const progress = () => {
    let p: number;
    if (section) {
      const r = section.getBoundingClientRect();
      p = (innerHeight - r.top) / (innerHeight + r.height);
    } else {
      const max = document.documentElement.scrollHeight - innerHeight;
      p = max > 0 ? scrollY / max : 0;
    }
    p = clamp(p, 0, 1);
    if (Math.abs(p - sceneStore.getState().progress) > 1e-4) {
      sceneStore.setState({ progress: p });
    }
  };

  let marked: Element[] = [];
  const mirror = () => {
    const { active } = sceneStore.getState();
    for (const el of marked) el.removeAttribute("data-scene-active");
    marked = active
      ? [
          ...document.querySelectorAll(
            `[data-scene-item="${CSS.escape(active)}"]`
          ),
        ]
      : [];
    for (const el of marked) el.setAttribute("data-scene-active", "");
  };

  const scan = () => {
    section = document.querySelector("[data-scene-section]");
    const seen = new Set<string>();
    const items: SceneItem[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-scene-item]"
    )) {
      const id = el.dataset.sceneItem;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push({
        id,
        href: el.dataset.sceneHref ?? el.getAttribute("href"),
        weight: Number(el.dataset.sceneWeight) || 1,
        label: el.dataset.sceneLabel ?? null,
        line: Number(el.dataset.sceneLine) || null,
      });
    }
    if (JSON.stringify(items) !== JSON.stringify(sceneStore.getState().items)) {
      sceneStore.setState({ items });
    }
    board();
    progress();
    mirror();
  };

  let queued = 0;
  const observer = new MutationObserver((records) => {
    const outside = records.some(
      (r) =>
        !(r.target instanceof Element && r.target.closest("[data-scene-root]"))
    );
    if (outside && !queued) {
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const offActive = sceneStore.subscribe((s, prev) => {
    if (s.active !== prev.active) mirror();
  });

  document.addEventListener("pointerover", over);
  document.addEventListener("focusin", over);
  document.addEventListener("pointerout", out);
  document.addEventListener("focusout", out);
  addEventListener("scroll", progress, { passive: true });
  addEventListener("resize", progress);
  scan();

  return () => {
    observer.disconnect();
    cancelAnimationFrame(queued);
    offActive();
    document.removeEventListener("pointerover", over);
    document.removeEventListener("focusin", over);
    document.removeEventListener("pointerout", out);
    document.removeEventListener("focusout", out);
    removeEventListener("scroll", progress);
    removeEventListener("resize", progress);
    for (const el of marked) el.removeAttribute("data-scene-active");
  };
}

/**
 * Lends an edition's session canvas to a slot's `host`: sizes it, tracks
 * visibility, binds the DOM contract and the edition's own pointer input,
 * then renders one frame so the caller can hide the poster without a flash.
 */
export function attachScene(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  options: {
    setSize: (width: number, height: number) => void;
    bindInput: (host: HTMLElement) => () => void;
    onReady: () => void;
  }
): () => void {
  host.append(canvas);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    options.setSize(width, height);
    kick();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    sceneStore.setState({ visible: !!entry?.isIntersecting });
    kick();
  });
  io.observe(host);
  const offInput = options.bindInput(host);
  const offDom = bindSceneDom();

  sceneStore.setState({ live: true, visible: true });
  renderNow();
  options.onReady();

  return () => {
    ro.disconnect();
    io.disconnect();
    offInput();
    offDom();
    if (canvas.parentElement === host) canvas.remove();
    sceneStore.setState({
      live: false,
      hovered: null,
      focused: null,
      active: null,
    });
  };
}

let tilting = false;

/** Device tilt as a small orbit offset; call from a user gesture (iOS asks permission). */
export async function enableTilt(): Promise<boolean> {
  if (tilting) return true;
  const Orientation = globalThis.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      })
    | undefined;
  if (!Orientation) return false;
  try {
    if (
      Orientation.requestPermission &&
      (await Orientation.requestPermission()) !== "granted"
    ) {
      return false;
    }
  } catch {
    return false;
  }
  tilting = true;
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || e.beta == null) return;
    input.tiltX = clamp(e.gamma / 90, -0.5, 0.5) * 0.5;
    input.tiltY = clamp((e.beta - 45) / 90, -0.5, 0.5) * 0.3;
    input.movedAt = performance.now();
  });
  return true;
}
