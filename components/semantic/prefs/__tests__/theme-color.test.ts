// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { syncThemeColor } from "../theme-color";

const contents = () =>
  Array.from(
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    (meta) => meta.content
  );

beforeEach(() => {
  document.head.innerHTML = `
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#eeeeee">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111111">`;
  delete document.documentElement.dataset.theme;
});

describe("syncThemeColor", () => {
  it("points both metas at an explicit dark or light theme", () => {
    document.documentElement.dataset.theme = "dark";
    syncThemeColor();
    expect(contents()).toEqual(["#111111", "#111111"]);
    document.documentElement.dataset.theme = "light";
    syncThemeColor();
    expect(contents()).toEqual(["#eeeeee", "#eeeeee"]);
  });

  it("restores the per-scheme colours without a resolved theme", () => {
    document.documentElement.dataset.theme = "dark";
    syncThemeColor();
    delete document.documentElement.dataset.theme;
    syncThemeColor();
    expect(contents()).toEqual(["#eeeeee", "#111111"]);
  });
});
