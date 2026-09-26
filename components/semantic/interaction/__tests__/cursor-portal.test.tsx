/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { CursorPortal } from "../cursor-portal";

describe("CursorPortal", () => {
  test("renders children as direct descendants of document.body", () => {
    render(
      <CursorPortal>
        <div data-testid="cursor-layer" />
      </CursorPortal>
    );
    const layer = screen.getByTestId("cursor-layer");
    expect(layer.parentElement).toBe(document.body);
  });
});
