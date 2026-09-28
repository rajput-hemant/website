// @vitest-environment jsdom
import { contactSheet } from "@/flavors/darkroom/lib/roll";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Project } from "@/lib/data/types";

import { Frame } from "../frame";

const project: Project = {
  id: "lipi",
  slug: "lipi",
  name: "Lipi",
  tagline: "A script converter",
  description: [],
  stack: [],
  featured: true,
  status: "maintained",
  year: 2023,
};

/** The text a screen reader names an element by: its content minus aria-hidden parts. */
function nameOf(el: Element): string {
  const copy = document.createElement("div");
  copy.innerHTML = el.innerHTML;
  for (const hidden of copy.querySelectorAll("[aria-hidden]")) hidden.remove();
  return copy.textContent.trim();
}

describe("Frame", () => {
  const [frame] = contactSheet([project]);
  document.body.innerHTML = frame
    ? renderToStaticMarkup(<Frame frame={frame} last />)
    : "";
  const link = document.querySelector("a");

  it("prints the project title on the rebate, inside the link", () => {
    expect(link?.querySelector(".frame-caption")?.textContent).toBe("Lipi");
  });

  it("names the link by the project title alone", () => {
    expect(link && nameOf(link)).toBe("Lipi");
  });

  it("describes the frame number and line beside the name", () => {
    const note = document.getElementById(
      link?.getAttribute("aria-describedby") ?? ""
    );
    expect(note?.textContent).toBe("Frame 1, A script converter, marked");
  });
});
