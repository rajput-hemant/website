import { SRGBColorSpace, WebGLRenderer } from "three";
import type { Camera, Object3D } from "three";

import { isDevelopment } from "@/lib/env";

import { frameStats, recordFrame, SCENE_BUDGET } from "./budget";
import { createFrameLoop } from "./frame-loop";
import type { Tier } from "./store";

/**
 * Blit glyphs (docs/m2-scene-spec.md, "Blit glyphs", slice S3), for plain
 * three.js editions: no R3F, no session canvas. Edition-agnostic: editions
 * pass their glyphs and, if they want, their own renderer.
 */

/** What the engine needs from a renderer; `WebGLRenderer` is one, a test double another. */
export type BlitRenderer = {
  domElement: HTMLCanvasElement;
  getPixelRatio(): number;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  setViewport(x: number, y: number, width: number, height: number): void;
  setScissor(x: number, y: number, width: number, height: number): void;
  setScissorTest(enable: boolean): void;
  render(scene: Object3D, camera: Camera): void;
  /** Read after each render, when present, for the per-frame budget. */
  info?: { render: { calls: number; triangles: number } };
};

/**
 * One glyph: its own small scene, camera and springs. The engine owns the
 * renderer, the frame loop and the pixels; the glyph only poses.
 */
export type Glyph<R extends BlitRenderer = BlitRenderer> = {
  scene: Object3D;
  camera: Camera;
  /** Runs once, the first time the glyph meets the renderer. */
  setup?(renderer: R): void;
  /** Re-read colour tokens after a theme change. */
  paint?(): void;
  /** Advance its springs by `dt` seconds and pose the scene; whether it still moves. */
  step(dt: number): boolean;
};

export type GlyphOptions = {
  /** The page's tier. At T0 nothing is drawn: `onLost` runs and the poster stays. */
  tier: Tier;
  /**
   * The glyph can't be drawn live (T0, no 2D context, over the page budget, or
   * the GL context was lost): show the printed poster again.
   */
  onLost: () => void;
};

/** Live glyphs one engine draws at once (the per-page budget). */
export const BLIT_GLYPHS = SCENE_BUDGET.views;

type Slot<R extends BlitRenderer> = {
  glyph: Glyph<R>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  visible: boolean;
  onLost: () => void;
};

const none = () => {};

/**
 * The engine: one WebGL renderer, off screen, shared by every glyph on the
 * page (create one per session). Each glyph draws into a plain 2D `<canvas>`
 * in the page's flow: when it is dirty (kicked) the engine steps it, renders
 * its scene into the bottom-left corner of the GL canvas and copies that
 * corner into the glyph's canvas in the same task, so no drawing buffer is
 * preserved. The pixels scroll with the page like an image, nothing renders
 * on scroll or while every glyph is at rest, and a glyph off screen does not
 * render at all.
 */
export function createBlit<R extends BlitRenderer>(
  createRenderer: (tier: Tier) => R
) {
  let renderer: R | null = null;
  let lost = false;
  const slots = new Map<HTMLCanvasElement, Slot<R>>();
  const dirty = new Set<Glyph<R>>();
  const ready = new WeakSet<Glyph<R>>();
  const warned = new Set<string>();
  let themes: MutationObserver | null = null;
  // Summed over every draw in one pass (a frame, or a glyph's first paint).
  const pass = { calls: 0, triangles: 0, drawn: 0 };

  const live = (glyph: Glyph<R>) =>
    [...slots.values()].some((s) => s.glyph === glyph && s.visible);

  const frames = createFrameLoop({
    active: () => !lost && [...dirty].some(live),
    onFrame: (dt) => {
      begin();
      for (const glyph of [...dirty]) {
        if (!live(glyph)) continue;
        if (!glyph.step(dt)) dirty.delete(glyph);
        draw(glyph);
      }
      end();
      return [...dirty].some(live);
    },
  });

  function begin() {
    pass.calls = pass.triangles = pass.drawn = 0;
  }

  function end() {
    if (pass.drawn === 0) return;
    const over = recordFrame(pass, slots.size);
    for (const key of over) {
      if (!isDevelopment || warned.has(key)) continue;
      warned.add(key);
      console.warn(`Blit glyphs over budget (${key}):`, frameStats);
    }
  }

  function ensureRenderer(tier: Tier): R {
    if (renderer) return renderer;
    const r = createRenderer(tier);
    r.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
      frames.dispose();
      for (const slot of slots.values()) slot.onLost();
    });
    renderer = r;
    return r;
  }

  /** Render `glyph` once into every visible canvas that shows it. */
  function draw(glyph: Glyph<R>) {
    const r = renderer;
    if (!r || lost) return;
    const dpr = r.getPixelRatio();
    const gl = r.domElement;
    for (const slot of slots.values()) {
      if (slot.glyph !== glyph || !slot.visible) continue;
      const w = slot.canvas.width;
      const h = slot.canvas.height;
      if (w === 0 || h === 0) continue;
      // The GL canvas only grows, so switching between glyphs never reallocates it.
      if (gl.width < w || gl.height < h) {
        r.setSize(
          Math.ceil(Math.max(gl.width, w) / dpr),
          Math.ceil(Math.max(gl.height, h) / dpr),
          false
        );
      }
      // Viewports count from the bottom-left corner, in CSS pixels.
      r.setViewport(0, 0, w / dpr, h / dpr);
      r.setScissor(0, 0, w / dpr, h / dpr);
      r.setScissorTest(true);
      r.render(glyph.scene, glyph.camera);
      if (r.info) {
        pass.calls += r.info.render.calls;
        pass.triangles += r.info.render.triangles;
      }
      pass.drawn++;
      slot.ctx.clearRect(0, 0, w, h);
      slot.ctx.drawImage(gl, 0, gl.height - h, w, h, 0, 0, w, h);
    }
  }

  /** Mark `glyph` (or every glyph) dirty and ask for frames until it settles. */
  function kick(glyph?: Glyph<R>) {
    if (glyph) dirty.add(glyph);
    else for (const slot of slots.values()) dirty.add(slot.glyph);
    frames.kick();
  }

  function watchThemes() {
    themes = new MutationObserver(() => {
      for (const slot of slots.values()) slot.glyph.paint?.();
      kick();
    });
    themes.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-motion"],
    });
  }

  /** Whether a new canvas can go live; runs `onLost` (after the caller mounts) if not. */
  function admit({ tier, onLost }: GlyphOptions): R | null {
    const refuse = (why: string | null) => {
      if (why && isDevelopment && !warned.has(why)) {
        warned.add(why);
        console.warn(`Blit glyph refused (${why}); its poster stays.`);
      }
      // Let the caller finish mounting, then fall back.
      queueMicrotask(onLost);
      return null;
    };
    if (tier === 0) return refuse(null);
    if (slots.size >= BLIT_GLYPHS) return refuse("views");
    const r = ensureRenderer(tier);
    return lost ? refuse(null) : r;
  }

  /**
   * Draw `glyph` into `canvas`, sized from `measure`'s box. Returns the
   * cleanup, which removes nothing from the DOM.
   */
  function mount(
    canvas: HTMLCanvasElement,
    measure: HTMLElement,
    glyph: Glyph<R>,
    options: GlyphOptions
  ): () => void {
    const r = admit(options);
    if (!r) return none;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      queueMicrotask(options.onLost);
      return none;
    }
    if (!ready.has(glyph)) {
      glyph.setup?.(r);
      glyph.paint?.();
      ready.add(glyph);
    }
    const slot: Slot<R> = {
      glyph,
      canvas,
      ctx,
      visible: true,
      onLost: options.onLost,
    };
    slots.set(canvas, slot);
    if (!themes) watchThemes();

    const resize = () => {
      const dpr = r.getPixelRatio();
      canvas.width = Math.round(Math.round(measure.clientWidth) * dpr);
      canvas.height = Math.round(Math.round(measure.clientHeight) * dpr);
      kick(glyph);
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(measure);
    const seen = new IntersectionObserver(([entry]) => {
      slot.visible = !!entry?.isIntersecting;
      kick(glyph);
    });
    seen.observe(measure);

    // Paint the first frame now, so the canvas is never blank once it shows.
    resize();
    if (glyph.step(1 / 60)) dirty.add(glyph);
    else dirty.delete(glyph);
    begin();
    draw(glyph);
    end();

    return () => {
      sizer.disconnect();
      seen.disconnect();
      if (slots.get(canvas) === slot) slots.delete(canvas);
      // A glyph with no canvas left can never draw again; drop it so the
      // frame loop stops holding its scene.
      if (![...slots.values()].some((s) => s.glyph === glyph)) {
        dirty.delete(glyph);
      }
      if (slots.size === 0) {
        frames.dispose();
        dirty.clear();
        themes?.disconnect();
        themes = null;
      }
    };
  }

  /**
   * Draw `glyph` into `canvas`, the glyph's own in-flow `<canvas>` (mark it
   * `aria-hidden`; its CSS box sets the backing size). Returns the cleanup.
   */
  function register(
    canvas: HTMLCanvasElement,
    glyph: Glyph<R>,
    options: GlyphOptions
  ): () => void {
    return mount(canvas, canvas, glyph, options);
  }

  /**
   * Show `glyph` in `host` (a sized element): the engine appends an
   * `aria-hidden` canvas that fills it, and removes it on cleanup.
   */
  function attach(
    host: HTMLElement,
    glyph: Glyph<R>,
    options: GlyphOptions
  ): () => void {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.style.width = canvas.style.height = "100%";
    const cleanup = mount(canvas, host, glyph, options);
    if (cleanup === none) return none;
    host.append(canvas);
    return () => {
      cleanup();
      canvas.remove();
    };
  }

  return { attach, register, kick };
}

/** The default renderer: tier 2 antialiases at up to DPR 2, tier 1 runs at DPR 1 without. */
export function glRenderer(tier: Tier): WebGLRenderer {
  const renderer = new WebGLRenderer({
    canvas: document.createElement("canvas"),
    antialias: tier === 2,
    alpha: true,
    powerPreference: "default",
  });
  renderer.setPixelRatio(tier === 2 ? Math.min(devicePixelRatio, 2) : 1);
  renderer.outputColorSpace = SRGBColorSpace;
  return renderer;
}
