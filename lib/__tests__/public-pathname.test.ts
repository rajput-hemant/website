import { expect, test } from "vitest";

import { publicPath } from "@/lib/public-pathname";

test("strips the edition prefix and nothing else", () => {
  expect(publicPath("/f/minimal")).toBe("/");
  expect(publicPath("/f/drawing-set/projects/lipi")).toBe("/projects/lipi");
  expect(publicPath("/work")).toBe("/work");
  expect(publicPath("/flavors")).toBe("/flavors");
});
