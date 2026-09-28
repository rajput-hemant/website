import { defineConfig, devices } from "@playwright/test";

import { liveFlavors } from "./flavors/registry";
import { serverEnv } from "./lib/env.server";

const PORT = 3020;
const baseURL = `http://localhost:${PORT}`;
const isCI = Boolean(serverEnv.CI);

// Unset locally and in CI: Playwright then finds its own Chromium via PLAYWRIGHT_BROWSERS_PATH.
const executablePath = serverEnv.PLAYWRIGHT_CHROMIUM_PATH;

const BUILD_SPEC = /static-routes\.spec\.ts$/;
// The shared-shell spec for the newer editions; Minimal and Drawing Set have their own.
const EDITIONS_SPEC = /editions\.spec\.ts$/;
// What each newer edition runs: its shell, axe over every route, and the shared ⌘K dialog contracts.
const EDITION_SPECS = [
  EDITIONS_SPEC,
  /a11y\.spec\.ts$/,
  /command-dialog\.spec\.ts$/,
];

// Every live edition without a bespoke suite.
const sharedShellEditions = liveFlavors.filter(
  (id) => id !== "minimal" && id !== "drawing-set"
);

function flavorCookie(value: string) {
  return {
    cookies: [
      {
        name: "hr_flavor",
        value,
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  ...(isCI && { workers: 2 }),
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 45_000,
  expect: { timeout: 7_500 },
  use: {
    baseURL,
    // The suite covers the default edition; without the cookie `/` is the picker.
    storageState: flavorCookie("minimal"),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: executablePath !== undefined ? { executablePath } : {},
  },
  projects: [
    // Reads the build output only; no browser pages.
    { name: "build", testMatch: BUILD_SPEC },
    {
      name: "desktop",
      testIgnore: [BUILD_SPEC, EDITIONS_SPEC],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      testIgnore: [BUILD_SPEC, EDITIONS_SPEC],
      // Pixel 7 metrics on Chromium: touch, coarse pointer, no hover.
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop-drawing-set",
      testIgnore: [BUILD_SPEC, EDITIONS_SPEC],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: flavorCookie("drawing-set"),
      },
    },
    {
      name: "mobile-drawing-set",
      testIgnore: [BUILD_SPEC, EDITIONS_SPEC],
      // Pixel 7 metrics on Chromium: touch, coarse pointer, no hover.
      use: {
        ...devices["Pixel 7"],
        storageState: flavorCookie("drawing-set"),
      },
    },
    ...sharedShellEditions.flatMap((id) => [
      {
        name: `desktop-${id}`,
        testMatch: EDITION_SPECS,
        use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 1440, height: 900 },
          storageState: flavorCookie(id),
        },
      },
      {
        name: `mobile-${id}`,
        testMatch: EDITION_SPECS,
        use: { ...devices["Pixel 7"], storageState: flavorCookie(id) },
      },
    ]),
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
