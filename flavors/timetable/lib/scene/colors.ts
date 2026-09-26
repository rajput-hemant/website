let probe: HTMLSpanElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

/**
 * A CSS colour token as `rgb(r, g, b)`, which three.js can parse. The probe
 * resolves light-dark() for the current theme, and a 1px canvas turns any
 * colour syntax into sRGB bytes.
 */
export function tokenColor(token: string, fallback = "#000000"): string {
  if (!probe) {
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;visibility:hidden;pointer-events:none;inset:0 auto auto 0";
    document.body.append(probe);
  }
  probe.style.color = `var(${token}, ${fallback})`;
  const css = getComputedStyle(probe).color;
  ctx ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = fallback;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Calls `onChange` when the theme flips. */
export function watchTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
