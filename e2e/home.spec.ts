import { expect, test } from "@playwright/test";

import { gotoSettled } from "./support/site";

/**
 * The home page's structure after the redesign: h1, bio, intro links, the
 * signature, the always-visible contact row, one "Selected" list of
 * `<details>` rows and a single "More" disclosure. See fa281b6, 4c9853f,
 * a59e187 and 404d292.
 */
test.describe("home structure", () => {
  test("h1, bio and intro links", async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The intro's closing line doubles as navigation. Names are matched
    // case-insensitively, so scope to the h1's section, not the header nav
    // (whose "Work" link would otherwise also match "work").
    const intro = page.locator("header").filter({
      has: page.getByRole("heading", { level: 1 }),
    });
    await expect(intro.getByRole("link", { name: "work" })).toHaveAttribute(
      "href",
      "/work"
    );
    await expect(intro.getByRole("link", { name: "projects" })).toHaveAttribute(
      "href",
      "/projects"
    );
    await expect(intro.getByRole("link", { name: "lab" })).toHaveAttribute(
      "href",
      "/lab"
    );
    await expect(
      intro.getByRole("link", { name: "ask me anything" })
    ).toHaveAttribute("href", "/ask");
  });

  test("the signature is present (not in the footer)", async ({ page }) => {
    await gotoSettled(page, "/");
    const signature = page.getByRole("img", { name: /signature/ });
    await expect(signature).toBeVisible();

    const footer = page.locator("[data-site-footer]");
    await expect(footer.getByRole("img", { name: /signature/ })).toHaveCount(0);
  });

  test("the contact row lists every channel, with a Resume link only when the profile has one", async ({
    page,
    request,
  }) => {
    await gotoSettled(page, "/");
    const contact = page.locator("[data-contact]");
    await expect(contact).toHaveAttribute("aria-label", "Contact");

    await expect(
      contact.getByRole("button", { name: /Copy .+ to the clipboard/ })
    ).toBeVisible();
    await expect(contact.getByRole("link", { name: /^GitHub/ })).toBeVisible();
    await expect(
      contact.getByRole("link", { name: /^LinkedIn/ })
    ).toBeVisible();
    await expect(
      contact.getByRole("link", { name: /^WhatsApp/ })
    ).toBeVisible();
    await expect(
      contact.getByRole("link", { name: "Printable resume" })
    ).toHaveAttribute("href", "/resume");

    // The markdown mirror renders "Also on <host> ↗" only when the profile
    // has a `resumeUrl` (see `lib/markdown/pages/resume.ts`), so it doubles
    // as a data-aware oracle: live Sanity content sets one, the fallback
    // profile (no Sanity) doesn't.
    const resumeMd = await (await request.get("/resume.md")).text();
    const hostedResume = resumeMd.match(/\[Also on .+? ↗\]\(([^)]+)\)/)?.[1];

    const resumeLink = contact.getByRole("link", { name: /^Resume/ });
    if (hostedResume) {
      await expect(resumeLink).toHaveAttribute("href", hostedResume);
    } else {
      await expect(resumeLink).toHaveCount(0);
    }
  });

  test("email links to mailto: and links out to a new tab", async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    const contact = page.locator("[data-contact]");
    const mail = contact.getByRole("link").filter({ hasText: "@" });
    await expect(mail).toHaveAttribute("href", /^mailto:/);

    const github = contact.getByRole("link", { name: /^GitHub/ });
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", /noopener/);
  });

  test('"Selected" is a list of disclosure rows', async ({ page }) => {
    await gotoSettled(page, "/");
    await expect(page.getByRole("heading", { name: "Selected" })).toBeVisible();

    // The fallback content's first featured project (no Sanity configured).
    const row = page.getByText("Infinitunes", { exact: true });
    await expect(row).toBeVisible();
    const details = row.locator("xpath=ancestor::details[1]");
    await expect(details).not.toHaveAttribute("open", "");
    await row.click();
    await expect(details).toHaveAttribute("open", "");

    await expect(
      page.getByRole("link", { name: "All projects" })
    ).toHaveAttribute("href", "/projects");
  });

  test('exactly one "More" disclosure holds Now and experience', async ({
    page,
  }) => {
    await gotoSettled(page, "/");
    const more = page.locator("details#more");
    await expect(more).toHaveCount(1);
    await expect(more).not.toHaveAttribute("open", "");
    // "More" is a bare text node beside its siblings, not its own element, so
    // click the summary bar itself rather than hunting for exact text.
    await more.locator(":scope > summary").click();
    await expect(more).toHaveAttribute("open", "");
  });
});
