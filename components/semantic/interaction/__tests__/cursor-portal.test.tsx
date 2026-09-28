/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { CursorPortal } from "../cursor-portal";
import { fixedContainingBlockAncestor } from "../fixed-containing-block";

describe("CursorPortal", () => {
  test("portals the cursor layer with no fixed re-anchor ancestor up to body", () => {
    render(
      <div style={{ transform: "translateX(1px)" }}>
        <CursorPortal>
          <div data-testid="cursor-layer" />
        </CursorPortal>
      </div>
    );
    const layer = screen.getByTestId("cursor-layer");
    expect(layer.parentElement).toBe(document.body);
    expect(fixedContainingBlockAncestor(layer)).toBeNull();
  });
});
