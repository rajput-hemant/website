/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";

import { tiltSurface } from "../tilt-surface";

describe("tiltSurface", () => {
  test("returns the direct .tilt child of a split host", () => {
    const host = document.createElement("article");
    host.setAttribute("data-tilt", "");
    const inner = document.createElement("div");
    inner.className = "tilt";
    host.append(inner);
    expect(tiltSurface(host)).toBe(inner);
  });

  test("falls back to the host when markup is combined", () => {
    const el = document.createElement("div");
    el.className = "tilt";
    el.setAttribute("data-tilt", "");
    expect(tiltSurface(el)).toBe(el);
  });

  test("pointer tilt writes rotation on the surface, not the host", () => {
    const host = document.createElement("article");
    host.setAttribute("data-tilt", "");
    const surface = document.createElement("div");
    surface.className = "tilt";
    host.append(surface);
    document.body.append(host);

    const target = tiltSurface(host);
    target.style.setProperty("--rx", "3.5");
    target.style.setProperty("--ry", "-2");

    expect(host.style.getPropertyValue("--rx")).toBe("");
    expect(surface.style.getPropertyValue("--rx")).toBe("3.5");
    expect(surface.style.getPropertyValue("--ry")).toBe("-2");

    host.remove();
  });
});
