import { expect, test, type Page, type Route } from "@playwright/test";

import { askMessages } from "@/lib/ask/response";
import { type ModerationItem } from "@/lib/data/types";

import { gotoSettled } from "./support/site";

const VALID_BODY = "Hello! How did you build the particle wordmark on /lab?";
const PENDING_LABEL = "Only you can see this until it’s approved.";
/** The client holds a message back until 3s after the composer mounted. */
const SEND_TIMEOUT = 10_000;

type Method = "GET" | "POST" | "DELETE";

/**
 * Answers `method` requests to `path` with a fixed JSON response and records
 * their bodies. Other methods on the same path fall through to the next handler.
 */
async function mockApi(
  page: Page,
  path: string,
  method: Method,
  status: number,
  json: unknown
) {
  const requests: unknown[] = [];
  await page.route(`**${path}`, async (route: Route) => {
    if (route.request().method() !== method) return route.fallback();
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status, json });
  });
  return requests;
}

const mockSession = (page: Page, owner: boolean) =>
  mockApi(page, "/api/owner/session", "GET", 200, { owner });

const startComposer = (page: Page) =>
  page.locator("form").filter({
    has: page.getByRole("textbox", { name: "Start a conversation" }),
  });
const messageField = (page: Page) =>
  page.getByRole("textbox", { name: "Start a conversation" });
const sendButton = (page: Page) =>
  startComposer(page).getByRole("button", { name: /^Send/ });
const liveRegion = (page: Page) =>
  startComposer(page).locator('[aria-live="polite"]');

async function openAsk(page: Page) {
  await gotoSettled(page, "/ask");
  await expect(messageField(page)).toBeVisible();
}

test.describe("/ask chat: starting a thread", () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page, false);
  });

  test("a sent thread echoes as pending and survives a reload", async ({
    page,
  }) => {
    const requests = await mockApi(page, "/api/ask", "POST", 200, {
      ok: true,
      slug: "abcd1234",
      status: "pending",
    });
    await openAsk(page);

    await messageField(page).fill(VALID_BODY);
    await startComposer(page)
      .getByRole("textbox", { name: "Your name (optional)" })
      .fill("Ada");
    await sendButton(page).click();

    await expect(liveRegion(page)).toContainText("once it's approved", {
      timeout: SEND_TIMEOUT,
    });
    await expect(messageField(page)).toHaveValue("");

    const pending = page.getByRole("list", {
      name: "Your messages awaiting approval",
    });
    await expect(pending.getByText(VALID_BODY)).toBeVisible();
    await expect(pending.getByText(PENDING_LABEL)).toBeVisible();
    await expect(pending.getByText("Ada")).toBeVisible();

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      body: VALID_BODY,
      name: "Ada",
      website: "",
    });
    expect(requests[0]).not.toHaveProperty("email");
    expect((requests[0] as { elapsed: number }).elapsed).toBeGreaterThanOrEqual(
      3_000
    );

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(pending.getByText(VALID_BODY)).toBeVisible();
    await expect(pending.getByText(PENDING_LABEL)).toBeVisible();
    await expect(
      startComposer(page).getByRole("textbox", {
        name: "Your name (optional)",
      })
    ).toHaveValue("Ada");
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("hr.ask.pending")
    );
    expect(JSON.parse(stored ?? "[]")).toEqual([
      expect.objectContaining({ slug: "abcd1234", body: VALID_BODY }),
    ]);
  });

  test("a too-short message shows a field error without sending", async ({
    page,
  }) => {
    const requests = await mockApi(page, "/api/ask", "POST", 200, {
      ok: true,
      slug: "abcd1234",
      status: "pending",
    });
    await openAsk(page);

    await messageField(page).fill("hi there");
    await sendButton(page).click();

    await expect(messageField(page)).toHaveAttribute("aria-invalid", "true");
    await expect(messageField(page)).toBeFocused();
    await expect(
      startComposer(page).getByText(/Write at least 10 characters/)
    ).toBeVisible();
    expect(requests).toHaveLength(0);

    await messageField(page).fill(VALID_BODY);
    await expect(messageField(page)).not.toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("server field errors mark the field", async ({ page }) => {
    await mockApi(page, "/api/ask", "POST", 400, {
      ok: false,
      message: askMessages.invalid,
      fieldErrors: { body: ["Keep it under 1000 characters."] },
    });
    await openAsk(page);

    await messageField(page).fill(VALID_BODY);
    await sendButton(page).click();

    await expect(
      startComposer(page).getByText("Keep it under 1000 characters.")
    ).toBeVisible({ timeout: SEND_TIMEOUT });
    await expect(messageField(page)).toHaveAttribute("aria-invalid", "true");
    await expect(messageField(page)).toHaveAttribute(
      "aria-describedby",
      /-error/
    );
  });

  const refusals = [
    {
      status: 429,
      message:
        "You already have a message waiting for approval. You can send another once it's reviewed.",
    },
    { status: 503, message: "Not accepting new messages right now" },
  ];

  for (const { status, message } of refusals) {
    test(`a ${status} refusal is announced and the composer stays usable`, async ({
      page,
    }) => {
      await mockApi(page, "/api/ask", "POST", status, { ok: false, message });
      await openAsk(page);

      await messageField(page).fill(VALID_BODY);
      await sendButton(page).click();

      await expect(liveRegion(page)).toHaveText(message, {
        timeout: SEND_TIMEOUT,
      });
      await expect(messageField(page)).toHaveValue(VALID_BODY);
      await expect(sendButton(page)).toBeEnabled();
      await expect(
        page.getByRole("list", { name: "Your messages awaiting approval" })
      ).toHaveCount(0);
    });
  }

  test("the honeypot is answered as a success by the real route", async ({
    page,
  }) => {
    await openAsk(page);
    await messageField(page).fill(VALID_BODY);
    await startComposer(page)
      .locator('input[name="website"]')
      .fill("https://spam.example", { force: true });

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/ask") &&
        response.request().method() === "POST",
      { timeout: SEND_TIMEOUT }
    );
    await sendButton(page).click();
    const response = await responsePromise;

    // A bot must not learn it was caught: the same 200 as a real message, nothing written.
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });
});

test.describe("/ask chat: replying", () => {
  test("a reply echoes as pending inside its thread", async ({ page }) => {
    await mockSession(page, false);
    await gotoSettled(page, "/ask");
    const replyButton = page.getByRole("button", { name: /^Reply/ }).first();
    test.skip(
      (await replyButton.count()) === 0,
      "needs a published thread; the fallback content has none"
    );

    const thread = page.locator("article").filter({ has: replyButton }).first();
    const permalink = await thread
      .getByRole("link", { name: /^Permalink/ })
      .getAttribute("href");
    const slug = permalink?.split("/").pop() ?? "";
    const requests = await mockApi(
      page,
      `/api/ask/${slug}/replies`,
      "POST",
      200,
      { ok: true, slug, key: "r1", status: "pending" }
    );

    await replyButton.click();
    const field = page.getByRole("textbox", { name: /^Reply to/ });
    await field.fill("Thanks, that clears it up for me.");
    await field.press("ControlOrMeta+Enter");

    await expect(
      thread.getByText("Thanks, that clears it up for me.")
    ).toBeVisible({ timeout: SEND_TIMEOUT });
    await expect(thread.getByText(PENDING_LABEL)).toBeVisible();
    expect(requests[0]).toMatchObject({
      body: "Thanks, that clears it up for me.",
    });
  });
});

const pendingThread: ModerationItem = {
  kind: "thread",
  slug: "wxyz5678",
  body: "What does your testing setup look like for the lab experiments?",
  authorName: "Grace",
  submittedAt: "2026-09-24T09:30:00Z",
  status: "pending",
};

test.describe("/ask chat: owner mode", () => {
  test("the moderation strip lists pending messages and Approve publishes", async ({
    page,
  }) => {
    await mockSession(page, true);
    await mockApi(page, "/api/ask/moderation", "GET", 200, {
      ok: true,
      items: [pendingThread],
    });
    const moderations = await mockApi(page, "/api/ask/moderate", "POST", 200, {
      ok: true,
    });
    await openAsk(page);

    const strip = page.getByRole("region", { name: /Moderation/ });
    await expect(strip).toBeVisible();
    await expect(strip.getByText("1 pending")).toBeVisible();
    await expect(strip.getByText(pendingThread.body)).toBeVisible();
    await expect(startComposer(page).getByText(/Posting as/)).toBeVisible();

    await strip.getByRole("button", { name: "Approve" }).click();

    await expect(strip.getByText(pendingThread.body)).toHaveCount(0);
    expect(moderations).toEqual([
      { slug: pendingThread.slug, target: "thread", action: "publish" },
    ]);
  });

  test("visitors never see the moderation strip", async ({ page }) => {
    await mockSession(page, false);
    await openAsk(page);
    await expect(page.getByRole("region", { name: /Moderation/ })).toHaveCount(
      0
    );
    await expect(
      startComposer(page).getByRole("textbox", {
        name: "Your name (optional)",
      })
    ).toBeVisible();
  });
});

test.describe("/owner sign-in", () => {
  test("a wrong passphrase shows an error and keeps the form", async ({
    page,
  }) => {
    await mockSession(page, false);
    const attempts = await mockApi(page, "/api/owner/session", "POST", 401, {
      ok: false,
      message: askMessages.ownerWrong,
    });
    await gotoSettled(page, "/owner");

    const passphrase = page.getByLabel("Passphrase");
    await passphrase.fill("not the passphrase");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(askMessages.ownerWrong)).toBeVisible();
    await expect(passphrase).toHaveAttribute("aria-invalid", "true");
    await expect(passphrase).toBeFocused();
    expect(attempts).toEqual([{ passphrase: "not the passphrase" }]);
  });

  test("a correct passphrase signs in and goes to /ask", async ({ page }) => {
    await mockSession(page, false);
    await mockApi(page, "/api/owner/session", "POST", 200, { owner: true });
    await gotoSettled(page, "/owner");

    await page.getByLabel("Passphrase").fill("correct horse battery staple");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/ask$/);
  });

  test("is kept out of search results", async ({ page }) => {
    await mockSession(page, false);
    await gotoSettled(page, "/owner");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
  });
});
