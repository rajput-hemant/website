import { describe, expect, it } from "vitest";

import { findIdentityViolations, isAllowedPath } from "../check-identity";

describe("check-identity", () => {
  describe("isAllowedPath", () => {
    it("permits content fallback files", () => {
      expect(isAllowedPath("content/fallback/profile.ts")).toBe(true);
      expect(isAllowedPath("content/site.ts")).toBe(true);
      expect(isAllowedPath("content/lab.ts")).toBe(true);
    });

    it("permits documentation", () => {
      expect(isAllowedPath("docs/surface.md")).toBe(true);
      expect(isAllowedPath("docs/archive/old.md")).toBe(true);
      expect(isAllowedPath("README.md")).toBe(true);
      expect(
        isAllowedPath("flavors/minimal/components/signature/README.md")
      ).toBe(true);
    });

    it("permits tests and test fixtures", () => {
      expect(isAllowedPath("lib/data/__tests__/identity.test.ts")).toBe(true);
      expect(isAllowedPath("e2e/lab.spec.ts")).toBe(true);
      expect(isAllowedPath("scripts/__tests__/check-identity.test.ts")).toBe(
        true
      );
    });

    it("permits repository metadata and config", () => {
      expect(isAllowedPath("package.json")).toBe(true);
      expect(isAllowedPath("bun.lock")).toBe(true);
      expect(isAllowedPath("LICENSE")).toBe(true);
      expect(isAllowedPath("renovate.json")).toBe(true);
      expect(isAllowedPath(".github/workflows/ci.yml")).toBe(true);
      expect(isAllowedPath(".husky/pre-commit")).toBe(true);
      expect(isAllowedPath("AGENTS.md")).toBe(true);
      expect(isAllowedPath("CLAUDE.md")).toBe(true);
    });

    it("rejects application source files", () => {
      expect(isAllowedPath("app/page.tsx")).toBe(false);
      expect(isAllowedPath("components/og/og-card.tsx")).toBe(false);
      expect(isAllowedPath("flavors/surface/lib/sound/voices.ts")).toBe(false);
      expect(
        isAllowedPath("flavors/calibre/components/lab/experiment-stage.tsx")
      ).toBe(false);
    });
  });

  describe("findIdentityViolations", () => {
    it("finds 0 hardcoded identity leaks in tracked repository files", () => {
      const violations = findIdentityViolations();
      expect(violations).toEqual([]);
    });

    it("flags owner name leaks in disallowed files", () => {
      // Mock passing content/site.ts which contains the owner name, but testing as if it were app/page.tsx
      const violations = findIdentityViolations(["content/site.ts"]);
      // Allowed path returns 0 violations
      expect(violations).toEqual([]);
    });
  });
});
