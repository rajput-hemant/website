import { describe, expect, it } from "vitest";

import type { RichText } from "@/lib/data/types";

import {
  EXTERNAL_REL,
  hrefProps,
  isExternalHref,
  isInternalHref,
  safeHref,
  sanitizeRichText,
} from "../safe-href";

describe("safeHref", () => {
  it.each([
    "https://example.com",
    "https://example.com/a/b?c=1#d",
    "http://example.com",
    "HTTPS://EXAMPLE.COM/Path",
    "https://docs.google.com/document/d/abc/edit?usp=sharing",
    "https://example.com:8443/x",
    "mailto:someone@example.com",
    "mailto:someone@example.com?subject=Hi%20there",
    "MAILTO:someone@example.com",
    "tel:+15551234567",
    "/",
    "/work",
    "/projects/site#top",
    "/ask?page=2",
    "#section",
    "?q=1",
    "./notes",
    "../up",
  ])("accepts %s unchanged", (href) => {
    expect(safeHref(href)).toBe(href);
  });

  it("trims surrounding whitespace", () => {
    expect(safeHref("  https://example.com \n")).toBe("https://example.com");
    expect(safeHref("\t/work ")).toBe("/work");
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "JAVASCRIPT:alert(1)",
    " javascript:alert(1)",
    "javascript://example.com/%0Aalert(1)",
    "data:text/html,<script>alert(1)</script>",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "ftp://example.com/file",
    "blob:https://example.com/uuid",
    "about:blank",
    "intent://scan/#Intent;scheme=zxing;end",
    "chrome://settings",
    "ws://example.com",
    "sms:+15551234567",
  ])("rejects the scheme in %s", (href) => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each([
    ["tab inside the scheme", "java\tscript:alert(1)"],
    ["newline inside the scheme", "java\nscript:alert(1)"],
    ["carriage return inside the scheme", "java\rscript:alert(1)"],
    ["a leading NUL", "\u0000javascript:alert(1)"],
    ["a leading control character", "\u0001javascript:alert(1)"],
    ["DEL", "https://exa\u007fmple.com"],
    ["a C1 control", "https://example.com/\u0085"],
    ["a tab inside a path", "/\t/evil.example"],
  ])("rejects %s", (_, href) => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each([
    "//evil.example",
    "//evil.example/path",
    "///evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "\\/evil.example",
    "https:\\\\evil.example",
  ])("rejects the protocol-relative or backslash form %s", (href) => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each([
    ["no host", "https://"],
    ["an empty mailto", "mailto:"],
    ["an empty tel", "tel:"],
    ["no slashes after the scheme", "https:evil.example"],
    ["one slash after the scheme", "http:/evil.example"],
    ["three slashes after the scheme", "http:///evil.example"],
    ["no slashes after an uppercase scheme", "HTTPS:evil.example"],
    ["credentials", "https://user:pass@example.com"],
    ["a user part that disguises the host", "https://example.com@evil.example"],
    ["an unparsable host", "https://exa mple.com"],
  ])("rejects a URL with %s", (_, href) => {
    expect(safeHref(href)).toBeUndefined();
  });

  it.each(["example.com", "www.example.com/x", "notes/x", "evil.example/%2F"])(
    "rejects the bare relative value %s",
    (href) => {
      expect(safeHref(href)).toBeUndefined();
    }
  );

  it.each([undefined, null, 0, {}, [], "", "   "])(
    "returns undefined for %j",
    (value) => {
      expect(safeHref(value)).toBeUndefined();
    }
  );
});

describe("isInternalHref", () => {
  it.each(["/", "/work", "#top", "?q=1", "./x"])("%s is internal", (h) => {
    expect(isInternalHref(h)).toBe(true);
  });

  it.each([
    "https://example.com",
    "mailto:a@example.com",
    "tel:+1555",
    "//evil.example",
    "javascript:alert(1)",
    "",
  ])("%s is not internal", (href) => {
    expect(isInternalHref(href)).toBe(false);
  });
});

describe("isExternalHref", () => {
  it.each(["https://example.com", "http://example.com/x", "HTTPS://A.COM"])(
    "%s is external",
    (href) => {
      expect(isExternalHref(href)).toBe(true);
    }
  );

  it.each([
    "/work",
    "#top",
    "mailto:a@example.com",
    "tel:+1555",
    "//evil.example",
    "https://example.com@evil.example",
    "javascript:alert(1)",
  ])("%s is not external", (href) => {
    expect(isExternalHref(href)).toBe(false);
  });
});

describe("hrefProps", () => {
  it("adds rel to external links only", () => {
    expect(hrefProps(" https://example.com ")).toEqual({
      href: "https://example.com",
      rel: EXTERNAL_REL,
    });
    expect(hrefProps("/work")).toEqual({ href: "/work" });
    expect(hrefProps("mailto:a@example.com")).toEqual({
      href: "mailto:a@example.com",
    });
  });

  it.each(["javascript:alert(1)", "//evil.example", undefined, ""])(
    "is empty for %j",
    (raw) => {
      expect(hrefProps(raw)).toEqual({});
    }
  );
});

describe("EXTERNAL_REL", () => {
  it("cuts the opener and the referrer", () => {
    expect(EXTERNAL_REL.split(" ").sort()).toEqual(["noopener", "noreferrer"]);
  });
});

const block = (
  markDefs: { _key: string; _type: string; [field: string]: unknown }[]
): RichText[number] => ({
  _type: "block",
  _key: "b",
  style: "normal",
  markDefs,
  children: [
    {
      _type: "span",
      _key: "s",
      text: "hello",
      marks: markDefs.map((d) => d._key),
    },
  ],
});

describe("sanitizeRichText", () => {
  it("keeps safe link marks as they are", () => {
    const value = [
      block([
        { _key: "a", _type: "link", href: "https://example.com" },
        { _key: "b", _type: "link", href: "/work" },
        { _key: "c", _type: "link", href: "mailto:a@example.com" },
      ]),
    ];
    expect(sanitizeRichText(value)).toEqual(value);
  });

  it("trims a link mark's href", () => {
    const [out] = sanitizeRichText([
      block([{ _key: "a", _type: "link", href: " https://example.com " }]),
    ]);
    expect(out?.markDefs).toEqual([
      { _key: "a", _type: "link", href: "https://example.com" },
    ]);
  });

  it("drops the href of an unsafe link mark but keeps the mark and its text", () => {
    const value = [
      block([
        { _key: "a", _type: "link", href: "javascript:alert(1)" },
        { _key: "b", _type: "link", href: "//evil.example" },
        { _key: "c", _type: "link", href: 42 },
      ]),
    ];
    const [out] = sanitizeRichText(value);
    expect(out?.markDefs).toEqual([
      { _key: "a", _type: "link" },
      { _key: "b", _type: "link" },
      { _key: "c", _type: "link" },
    ]);
    expect(out?.children).toEqual(value[0]?.children);
  });

  it("drops null and malformed mark definitions instead of throwing", () => {
    const value = [
      {
        _type: "block",
        _key: "b",
        markDefs: [
          null,
          "link",
          { _type: "link" },
          { _key: "a", _type: "link", href: "https://example.com" },
        ],
        children: [],
      },
    ];
    expect(sanitizeRichText(value)[0]?.markDefs).toEqual([
      { _key: "a", _type: "link", href: "https://example.com" },
    ]);
  });

  it("leaves other mark types, blocks without markDefs and the input alone", () => {
    const other = { _key: "x", _type: "highlight", href: "javascript:x" };
    const plain = { _type: "code", _key: "k", code: "x" };
    const value = [block([other]), plain];
    const snapshot = structuredClone(value);
    expect(sanitizeRichText(value)).toEqual(value);
    expect(value).toEqual(snapshot);
  });
});
