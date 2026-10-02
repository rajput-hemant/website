// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Dialog } from "../dialog";

afterEach(cleanup);

describe("Dialog", () => {
  it("keeps a visible close button by default", async () => {
    render(
      <Dialog open title="Customize">
        <p>Body</p>
      </Dialog>
    );
    expect(await screen.findByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("with hideHeader, names the dialog but leaves no hidden stop in the focus trap", async () => {
    render(
      <Dialog open title="Search the site" hideHeader>
        <input aria-label="Search" />
      </Dialog>
    );
    expect(
      await screen.findByRole("dialog", { name: "Search the site" })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("centres on wide screens by default", async () => {
    render(
      <Dialog open title="Customize">
        <p>Body</p>
      </Dialog>
    );
    const popup = await screen.findByRole("dialog", { name: "Customize" });
    expect(popup.className).toContain("sm:top-1/2");
    expect(popup.className).toContain("sm:-translate-y-1/2");
  });

  it("with placement top, pins the popup to a top offset at every width", async () => {
    render(
      <Dialog open title="Search the site" hideHeader placement="top">
        <input aria-label="Search" />
      </Dialog>
    );
    const popup = await screen.findByRole("dialog", {
      name: "Search the site",
    });
    const classes = popup.className.split(/\s+/);
    expect(classes).toContain("top-[max(1rem,12vh)]");
    expect(classes).toContain("bottom-auto");
    // Nothing re-centres it (or stretches it to the bottom) as its content changes height.
    expect(classes.some((c) => c.includes("top-1/2"))).toBe(false);
    expect(classes.some((c) => c.includes("-translate-y-1/2"))).toBe(false);
    expect(classes).not.toContain("bottom-0");
  });
});
