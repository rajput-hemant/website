// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { POPUP_CLASS } from "../../command/command-dialog";
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
});

describe("the ⌘K popup", () => {
  it("keeps its top offset from sm up, so it never re-centres as results filter", async () => {
    render(
      <Dialog open title="Search the site" hideHeader className={POPUP_CLASS}>
        <input aria-label="Search" />
      </Dialog>
    );
    const popup = await screen.findByRole("dialog", {
      name: "Search the site",
    });
    const classes = popup.className.split(/\s+/);
    expect(classes).toContain("sm:top-[max(1rem,12vh)]");
    expect(classes).toContain("sm:translate-y-0");
    expect(classes).not.toContain("sm:top-1/2");
    expect(classes).not.toContain("sm:-translate-y-1/2");
  });
});
