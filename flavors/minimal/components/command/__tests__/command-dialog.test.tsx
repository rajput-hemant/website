// @vitest-environment jsdom
import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { RECENT_KEY } from "@/lib/command/recent";
import type { SearchIndex } from "@/lib/command/types";

import { CommandDialog } from "../command-dialog";

const push = vi.fn();
const setPrefs = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));
vi.mock("@/flavors/minimal/lib/prefs-store", () => ({
  setPrefs: (...args: unknown[]) => setPrefs(...args),
}));

const index: SearchIndex = {
  email: "hello@example.com",
  entries: [
    {
      id: "page:/",
      title: "Home",
      subtitle: "About",
      group: "Pages",
      href: "/",
      keywords: ["Lipi"],
    },
    {
      id: "page:/projects",
      title: "Projects",
      group: "Pages",
      href: "/projects",
      keywords: [],
    },
    {
      id: "project:lipi",
      title: "Lipi",
      subtitle: "A workspace app",
      group: "Projects",
      href: "/projects#lipi",
      keywords: ["Next.js"],
    },
    {
      id: "project:jiosaavn-api",
      title: "JioSaavn API",
      subtitle: "A wrapper",
      group: "Projects",
      href: "/projects#jiosaavn-api",
      keywords: ["TypeScript", "Hono"],
    },
    {
      id: "role:zunta",
      title: "Software Engineer, Zunta",
      subtitle: "Jan 2026 – Present",
      group: "Work",
      href: "/work#zunta",
      keywords: ["Zunta"],
    },
  ],
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function Harness() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        reopen
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

const input = () => screen.getByRole("combobox");
const options = () => screen.queryAllByRole("option");
const selected = () =>
  options().find((option) => option.getAttribute("aria-selected") === "true");

async function renderOpen() {
  render(<Harness />);
  await waitFor(() => expect(options().length).toBeGreaterThan(0));
  await waitFor(() => expect(screen.getByText("Copy email")).toBeTruthy());
}

describe("CommandDialog", () => {
  beforeEach(() => {
    push.mockClear();
    setPrefs.mockClear();
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(index)))
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows pages and actions before a query, with the first option active", async () => {
    await renderOpen();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(options().map((o) => o.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Home"),
        expect.stringContaining("Toggle theme"),
      ])
    );
    expect(screen.queryByText("Lipi")).toBeNull();
    expect(selected()?.textContent).toContain("Home");
    expect(input().getAttribute("aria-activedescendant")).toBe(selected()?.id);
  });

  it("filters as you type: fuzzy on titles, verbatim on keywords, with title hits highlighted", async () => {
    await renderOpen();
    fireEvent.change(input(), { target: { value: "hono" } });
    await waitFor(() =>
      expect(options().map((o) => o.textContent)).toEqual([
        expect.stringContaining("JioSaavn API"),
      ])
    );
    fireEvent.change(input(), { target: { value: "hno" } });
    await waitFor(() =>
      expect(screen.getByText(/No results for/)).toBeTruthy()
    );
    fireEvent.change(input(), { target: { value: "lipi" } });
    // Projects (title hit) outranks Pages (keyword hit on Home), so it comes first.
    await waitFor(() => expect(selected()?.textContent).toContain("Lipi"));
    expect(options().map((o) => o.textContent?.slice(0, 4))).toEqual([
      "Lipi",
      "Home",
    ]);
    expect(selected()?.querySelector("mark")?.textContent).toBe("Lipi");
  });

  it("moves with the arrow keys and shows an empty state", async () => {
    await renderOpen();
    const first = selected()?.id;
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(selected()?.id).not.toBe(first);
    fireEvent.keyDown(input(), { key: "End" });
    expect(selected()?.textContent).toContain("View as markdown");
    fireEvent.keyDown(input(), { key: "Home" });
    expect(selected()?.id).toBe(first);
    fireEvent.change(input(), { target: { value: "qqqqzz" } });
    await waitFor(() =>
      expect(screen.getByText(/No results for/)).toBeTruthy()
    );
  });

  it("navigates on Enter after closing, and remembers the pick as recent", async () => {
    await renderOpen();
    fireEvent.change(input(), { target: { value: "zunta" } });
    await waitFor(() => expect(selected()?.textContent).toContain("Zunta"));
    fireEvent.keyDown(input(), { key: "Enter" });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/work#zunta"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")).toEqual([
      "role:zunta",
    ]);

    fireEvent.click(screen.getByText("reopen"));
    await waitFor(() => expect(screen.getByText("Recent")).toBeTruthy());
    expect(selected()?.textContent).toContain("Software Engineer, Zunta");
  });

  it("jumps with g then a page key typed into the empty field", async () => {
    await renderOpen();
    fireEvent.change(input(), { target: { value: "g" } });
    fireEvent.keyDown(input(), { key: "w" });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/work"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps searching when g starts a longer query", async () => {
    await renderOpen();
    fireEvent.change(input(), { target: { value: "gi" } });
    fireEvent.keyDown(input(), { key: "w" });
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("runs actions: theme toggles through prefs, customize dispatches its event", async () => {
    const onCustomize = vi.fn();
    window.addEventListener("hr:open-customize", onCustomize);
    await renderOpen();
    fireEvent.change(input(), { target: { value: "theme" } });
    await waitFor(() =>
      expect(selected()?.textContent).toContain("Toggle theme")
    );
    fireEvent.keyDown(input(), { key: "Enter" });
    await waitFor(() =>
      expect(setPrefs).toHaveBeenCalledWith({ theme: "dark" })
    );

    fireEvent.click(screen.getByText("reopen"));
    await waitFor(() => expect(input()).toBeTruthy());
    fireEvent.change(input(), { target: { value: "customize" } });
    await waitFor(() => expect(selected()?.textContent).toContain("Customize"));
    fireEvent.keyDown(input(), { key: "Enter" });
    await waitFor(() => expect(onCustomize).toHaveBeenCalledOnce());
    window.removeEventListener("hr:open-customize", onCustomize);
  });

  it("copies the email, announces it and fires hr:copied", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const onCopied = vi.fn();
    window.addEventListener("hr:copied", onCopied);
    await renderOpen();
    fireEvent.change(input(), { target: { value: "copy email" } });
    await waitFor(() =>
      expect(selected()?.textContent).toContain("Copy email")
    );
    await act(async () => {
      fireEvent.keyDown(input(), { key: "Enter" });
    });
    expect(writeText).toHaveBeenCalledWith("hello@example.com");
    expect(onCopied).toHaveBeenCalledOnce();
    expect(
      screen.getByText("Copied hello@example.com to the clipboard")
    ).toBeTruthy();
    expect(screen.getByText("Copied to the clipboard")).toBeTruthy();
    window.removeEventListener("hr:copied", onCopied);
  });
});
