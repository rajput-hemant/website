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
});
