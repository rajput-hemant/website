import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function render(flavor: string | undefined) {
  vi.stubEnv("NEXT_PUBLIC_FLAVOR", flavor);
  const { EditionChoice } = await import("../edition-choice");
  return renderToStaticMarkup(
    <EditionChoice>
      <a href="/flavors">Change edition</a>
    </EditionChoice>
  );
}

describe("EditionChoice", () => {
  it("renders the edition's picker link when visitors choose", async () => {
    expect(await render(undefined)).toBe(
      '<a href="/flavors">Change edition</a>'
    );
    expect(await render("")).toContain("Change edition");
  });

  it("renders nothing on a pinned deploy", async () => {
    expect(await render("press")).toBe("");
  });
});
