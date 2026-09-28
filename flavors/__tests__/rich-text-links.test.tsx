import * as React from "react";
import { RichText as Calibre } from "@/flavors/calibre/components/ui/rich-text";
import { RichText as Darkroom } from "@/flavors/darkroom/components/ui/rich-text";
import { RichText as DrawingSet } from "@/flavors/drawing-set/components/ui/rich-text";
import { RichText as Jacquard } from "@/flavors/jacquard/components/ui/rich-text";
import { RichText as Maquette } from "@/flavors/maquette/components/ui/rich-text";
import { RichText as Minimal } from "@/flavors/minimal/components/ui/portable-text";
import { RichText as Mission } from "@/flavors/mission/components/ui/rich-text";
import { RichText as Press } from "@/flavors/press/components/ui/rich-text";
import { RichText as Surface } from "@/flavors/surface/components/ui/rich-text";
import { RichText as Survey } from "@/flavors/survey/components/ui/rich-text";
import { RichText as Timetable } from "@/flavors/timetable/components/ui/rich-text";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { RichText as RichTextValue } from "@/lib/data/types";

type Renderer = (props: { value: RichTextValue }) => React.ReactNode;

/** Every edition's CMS rich-text renderer. */
const RENDERERS: [string, Renderer][] = [
  ["calibre", Calibre],
  ["darkroom", Darkroom],
  ["drawing-set", DrawingSet],
  ["jacquard", Jacquard],
  ["maquette", Maquette],
  ["minimal", Minimal],
  ["mission", Mission],
  ["press", Press],
  ["surface", Surface],
  ["survey", Survey],
  ["timetable", Timetable],
];

/** One paragraph whose spans each carry a link mark with the given href. */
function paragraph(hrefs: unknown[]): RichTextValue {
  return [
    {
      _type: "block",
      _key: "b",
      style: "normal",
      markDefs: hrefs.map((href, i) => ({
        _key: `l${i}`,
        _type: "link",
        href,
      })),
      children: hrefs.map((_, i) => ({
        _type: "span",
        _key: `s${i}`,
        text: `text${i} `,
        marks: [`l${i}`],
      })),
    },
  ];
}

/** The renderers are the last line of defence, so these skip the data layer. */
const UNSAFE = [
  "javascript:alert(1)",
  " JavaScript:alert(1)",
  "java\tscript:alert(1)",
  "data:text/html,<b>x</b>",
  "vbscript:msgbox(1)",
  "//evil.example",
  "/\\evil.example",
];

const hrefsIn = (html: string) =>
  [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);

describe.each(RENDERERS)("%s rich text links", (_, Render) => {
  it("renders unsafe hrefs as plain text", () => {
    const html = renderToStaticMarkup(<Render value={paragraph(UNSAFE)} />);
    expect(hrefsIn(html)).toEqual([]);
    for (const i of UNSAFE.keys()) expect(html).toContain(`text${i}`);
  });

  it("keeps safe hrefs and gives external ones noopener noreferrer", () => {
    const safe = [
      "/work",
      "#top",
      "https://example.com",
      "mailto:a@example.com",
    ];
    const html = renderToStaticMarkup(<Render value={paragraph(safe)} />);
    expect(hrefsIn(html)).toEqual(safe);
    const external = /<a[^>]*href="https:\/\/example\.com"[^>]*>/.exec(html);
    expect(external?.[0]).toMatch(/rel="noopener noreferrer"/);
  });
});
