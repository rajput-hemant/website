import * as React from "react";
import { ExternalLink as Calibre } from "@/flavors/calibre/components/ui/external-link";
import { ExternalLink as Darkroom } from "@/flavors/darkroom/components/ui/external-link";
import { ExternalLink as DrawingSet } from "@/flavors/drawing-set/components/ui/external-link";
import { ExternalLink as Jacquard } from "@/flavors/jacquard/components/ui/external-link";
import { ExternalLink as Maquette } from "@/flavors/maquette/components/ui/external-link";
import { ExternalLink as Minimal } from "@/flavors/minimal/components/ui/external-link";
import { ExternalLink as Mission } from "@/flavors/mission/components/ui/external-link";
import { ExternalLink as Press } from "@/flavors/press/components/ui/external-link";
import { ExternalLink as Surface } from "@/flavors/surface/components/ui/primitives";
import { ExternalLink as Survey } from "@/flavors/survey/components/ui/external-link";
import { ExternalLink as Timetable } from "@/flavors/timetable/components/ui/external-link";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

type Anchor = (props: {
  href: string;
  children: React.ReactNode;
}) => React.ReactNode;

/** Every edition's new-tab link, which CMS socials and project links reach. */
const LINKS: [string, Anchor][] = [
  ["calibre", Calibre],
  ["darkroom", Darkroom],
  ["drawing-set", DrawingSet],
  ["jacquard", Jacquard],
  ["maquette", Maquette],
  ["minimal", Minimal],
  ["mission", Mission],
  ["press", Press],
  ["survey", Survey],
  ["timetable", Timetable],
  ["surface", Surface],
];

describe.each(LINKS)("%s external link", (_, ExternalLink) => {
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.example"])(
    "renders %s without an href",
    (href) => {
      const html = renderToStaticMarkup(
        <ExternalLink href={href}>label</ExternalLink>
      );
      expect(html).not.toMatch(/href=/);
      expect(html).toContain("label");
    }
  );

  it("keeps a safe href and cuts the opener and the referrer", () => {
    const html = renderToStaticMarkup(
      <ExternalLink href="https://example.com">label</ExternalLink>
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
