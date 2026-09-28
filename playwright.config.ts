import { defineConfig, devices } from "@playwright/test";

const PORT = 3020;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

// Unset locally and in CI: Playwright then finds its own Chromium via PLAYWRIGHT_BROWSERS_PATH.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? undefined;

const BUILD_SPEC = /static-routes\.spec\.ts$/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 45_000,
  expect: { timeout: 7_500 },
  use: {
    baseURL,
    // The suite covers the default edition; without the cookie `/` is the picker.
    storageState: {
      cookies: [
        {
          name: "hr_flavor",
          value: "minimal",
          domain: "localhost",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    // Reads the build output only; no browser pages.
    { name: "build", testMatch: BUILD_SPEC },
    {
      name: "desktop",
      testIgnore: BUILD_SPEC,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      testIgnore: BUILD_SPEC,
      // Pixel 7 metrics on Chromium: touch, coarse pointer, no hover.
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: `bun run build && bun run start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
