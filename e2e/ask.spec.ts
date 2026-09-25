import { expect, test, type Page, type Route } from "@playwright/test";

import { gotoSettled } from "./support/site";

const VALID_BODY = "Hello! How did you build the particle wordmark on /lab?";
/** The client holds a submission back until 3s after the form mounted. */
const SUBMIT_TIMEOUT = 10_000;

const form = (page: Page) => page.getByRole("form", { name: "Send a message" });
const liveRegion = (page: Page) => form(page).locator('[aria-live="polite"]');
const messageField = (page: Page) =>
  form(page).getByRole("textbox", { name: "Your message" });

async function openAsk(page: Page) {
  await gotoSettled(page, "/ask");
  await expect(form(page)).toBeVisible();
}

function mockAsk(page: Page, status: number, body: unknown) {
  const requests: unknown[] = [];
  const handler = async (route: Route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status, json: body });
  };
  return page.route("**/api/ask", handler).then(() => requests);
}

test.describe("/ask form", () => {
  test("a too-short message shows a field error without sending", async ({
    page,
  }) => {
    const requests = await mockAsk(page, 200, { ok: true, slug: "abcd1234" });
    await openAsk(page);

    await messageField(page).fill("hi there");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(messageField(page)).toHaveAttribute("aria-invalid", "true");
    await expect(messageField(page)).toBeFocused();
    await expect(
      form(page).getByText(/Write at least 10 characters/)
    ).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      "Please check the highlighted fields."
    );
    expect(requests).toHaveLength(0);

    await messageField(page).fill(VALID_BODY);
    await expect(messageField(page)).not.toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("an invalid email is caught before sending", async ({ page }) => {
    const requests = await mockAsk(page, 200, { ok: true, slug: "abcd1234" });
    await openAsk(page);

    await messageField(page).fill(VALID_BODY);
    await form(page)
      .getByRole("textbox", { name: /Email/ })
      .fill("not-an-email");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(
      form(page).getByRole("textbox", { name: /Email/ })
    ).toHaveAttribute("aria-invalid", "true");
    await expect(form(page).getByText(/valid email address/)).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test("the honeypot is answered as a success by the real route", async ({
    page,
  }) => {
    await openAsk(page);
    await messageField(page).fill(VALID_BODY);
    await form(page)
      .locator('input[name="website"]')
      .fill("https://spam.example", { force: true });

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/ask") &&
        response.request().method() === "POST",
      { timeout: SUBMIT_TIMEOUT }
    );
    await page.getByRole("button", { name: "Send message" }).click();
    const response = await responsePromise;

    // A bot must not learn it was caught: same 200 as a real submission, nothing written.
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    await expect(page.getByRole("status")).toContainText(
      "Thank you, it’s in my inbox.",
      { timeout: SUBMIT_TIMEOUT }
    );
  });

  test("a successful submission shows the confirmation", async ({ page }) => {
    const requests = await mockAsk(page, 200, { ok: true, slug: "abcd1234" });
    await openAsk(page);

    await messageField(page).fill(VALID_BODY);
    await form(page).getByRole("textbox", { name: /Name/ }).fill("Ada");
    await page.getByRole("button", { name: "Send message" }).click();

    const status = page.getByRole("status");
    await expect(status).toContainText("Received", { timeout: SUBMIT_TIMEOUT });
    await expect(status).toBeFocused();
    await expect(form(page)).toHaveCount(0);

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      body: VALID_BODY,
      name: "Ada",
      email: "",
      website: "",
    });
    const elapsed = (requests[0] as { elapsed: number }).elapsed;
    expect(elapsed).toBeGreaterThanOrEqual(3_000);
  });

  test("server field errors mark the field and announce the message", async ({
    page,
  }) => {
    await mockAsk(page, 400, {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors: { body: ["Keep it under 1000 characters."] },
    });
    await openAsk(page);

    await messageField(page).fill(VALID_BODY);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(liveRegion(page)).toHaveText(
      "Please check the highlighted fields.",
      { timeout: SUBMIT_TIMEOUT }
    );
    await expect(messageField(page)).toHaveAttribute("aria-invalid", "true");
    await expect(
      form(page).getByText("Keep it under 1000 characters.")
    ).toBeVisible();
    await expect(messageField(page)).toHaveAttribute(
      "aria-describedby",
      /-error/
    );
  });

  const refusals = [
    {
      status: 429,
      message:
        "You already have an open question. You can ask another once it's answered or after 7 days.",
    },
    { status: 503, message: "Not accepting new messages right now" },
  ];

  for (const { status, message } of refusals) {
    test(`a ${status} refusal is announced and the form stays usable`, async ({
      page,
    }) => {
      await mockAsk(page, status, { ok: false, message });
      await openAsk(page);

      await messageField(page).fill(VALID_BODY);
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(liveRegion(page)).toHaveText(message, {
        timeout: SUBMIT_TIMEOUT,
      });
      await expect(messageField(page)).toHaveValue(VALID_BODY);
      await expect(
        page.getByRole("button", { name: "Send message" })
      ).toBeEnabled();
    });
  }

  test("an unreadable server error falls back to a generic message", async ({
    page,
  }) => {
    await page.route("**/api/ask", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );
    await openAsk(page);
    await messageField(page).fill(VALID_BODY);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(liveRegion(page)).toHaveText(/Something went wrong/, {
      timeout: SUBMIT_TIMEOUT,
    });
  });
});
