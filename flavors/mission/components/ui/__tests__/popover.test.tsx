// @vitest-environment jsdom
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Popover } from "../popover";

afterEach(cleanup);

function Anchored({ label }: { label?: string }) {
  const anchor = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">
        Open
      </button>
      <Popover open anchor={anchor} {...(label !== undefined && { label })}>
        <p>Body</p>
      </Popover>
    </>
  );
}

describe("Popover", () => {
  it("names its dialog from `label`", async () => {
    render(<Anchored label="Customize" />);
    expect(
      await screen.findByRole("dialog", { name: "Customize" })
    ).toBeTruthy();
  });
});
