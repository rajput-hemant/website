import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  isSharedElementName,
  sharedElementName,
} from "@/lib/interaction/shared-element-name";

import { Reveal, RevealGroup, RevealItem } from "../reveal";

describe("Reveal wrappers", () => {
  it("render on the server with the stagger classes and no hidden state", () => {
    const html = renderToStaticMarkup(
      <RevealGroup as="ol" className="list" aria-label="Items">
        <RevealItem as="li" className="row">
          One
        </RevealItem>
        <RevealItem as="li">Two</RevealItem>
      </RevealGroup>
    );
    expect(html).toBe(
      '<ol class="stagger list" aria-label="Items"><li class="row">One</li><li>Two</li></ol>'
    );
    expect(html).not.toMatch(/opacity|transform|style=/);
  });

  it("marks a single block with stagger-self", () => {
    const html = renderToStaticMarkup(
      <Reveal as="section" id="skills" className="pt-section">
        Skills
      </Reveal>
    );
    expect(html).toBe(
      '<section class="stagger-self pt-section" id="skills">Skills</section>'
    );
  });

  it("defaults to a div", () => {
    expect(renderToStaticMarkup(<Reveal>x</Reveal>)).toBe(
      '<div class="stagger-self">x</div>'
    );
  });
});

describe("shared element names", () => {
  it("builds valid, recognisable names", () => {
    const name = sharedElementName("lab", "signature field/2");
    expect(name).toBe("se-lab-signature-field-2");
    expect(isSharedElementName(name)).toBe(true);
  });

  it("does not recognise ad-hoc names such as the retired page-title", () => {
    expect(isSharedElementName("page-title")).toBe(false);
  });
});
