// @vitest-environment jsdom
import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CommandInput, CommandList, CommandRoot } from "cmdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { goSequence } from "@/lib/command/shortcuts";
import type { ActionCopy } from "@/lib/command/standard-actions";
import { standardDefaults } from "@/lib/prefs/standard";

import { useAfterClose } from "../use-after-close";
import { useCommandDialog } from "../use-command-dialog";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/command/load-index", () => ({
  loadSearchIndex: () => Promise.resolve({ email: "a@b.dev", entries: [] }),
  loadOwnerSession: () => Promise.resolve(false),
}));

// cmdk measures its list with ResizeObserver, which jsdom lacks.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const keys = { p: "/projects", h: "/" } as const;
const copy: ActionCopy = {
  resume: { title: "Resume", subtitle: "" },
  toDark: "Dark",
  toLight: "Light",
  themeSubtitle: "",
  motionSubtitle: "",
  soundSubtitle: "",
  sceneName: "Scene",
};

/** The dialog as every edition builds it: Base UI around cmdk, driven by the shared controller. */
function Menu() {
  const [open, setOpen] = React.useState(true);
  const menu = useCommandDialog({
    open,
    onOpenChange: setOpen,
    prefs: standardDefaults,
    setPrefs: () => {},
    copy,
    goSequence: (query, startedAt, event) =>
      goSequence(query, startedAt, event, keys),
    hrefForUpdate: (year) => `/now#${year}`,
  });
  return (
    <Dialog.Root
      open={open}
      onOpenChange={menu.onDialogOpenChange}
      onOpenChangeComplete={menu.onDialogOpenChangeComplete}
    >
      <Dialog.Portal>
        <Dialog.Popup>
          <Dialog.Title>Search</Dialog.Title>
          <CommandRoot label="Search" {...menu.rootProps}>
            <CommandInput aria-label="Search" {...menu.inputProps} />
            <CommandList />
          </CommandRoot>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

beforeEach(() => {
  push.mockClear();
  vi.stubGlobal("ResizeObserver", NoopResizeObserver);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useCommandDialog", () => {
  it("`g` then a page key in the field closes the menu and then navigates", async () => {
    render(<Menu />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "g" } });
    fireEvent.keyDown(input, { key: "p" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(push).toHaveBeenCalledWith("/projects"));
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("navigates only after the dialog has left the page", async () => {
    let dialogOnScreenAtPush: boolean | null = null;
    push.mockImplementation(() => {
      dialogOnScreenAtPush = document.querySelector("[role=dialog]") !== null;
    });
    render(<Menu />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "g" } });
    fireEvent.keyDown(input, { key: "p" });

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(dialogOnScreenAtPush).toBe(false);
  });
});

function Harness({
  onReady,
  onOpenChange,
}: {
  onReady: (api: Api) => void;
  onOpenChange?: ((open: boolean) => void) | undefined;
}) {
  const [open, setOpen] = React.useState(true);
  const change = (next: boolean) => {
    onOpenChange?.(next);
    setOpen(next);
  };
  const { close, closeLater, onDialogOpenChange, onOpenChangeComplete } =
    useAfterClose(open, change);
  React.useEffect(() => {
    onReady({ close, closeLater, reopen: () => setOpen(true) });
  });
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onDialogOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <Dialog.Portal>
        <Dialog.Popup>
          <Dialog.Title>Menu</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type Api = {
  close: (then?: () => void) => void;
  closeLater: (delayMs: number) => void;
  reopen: () => void;
};

function renderHarness(onOpenChange?: (open: boolean) => void) {
  let api: Api | null = null;
  const view = render(
    <Harness onReady={(next) => (api = next)} onOpenChange={onOpenChange} />
  );
  const get = () => {
    if (!api) throw new Error("harness not ready");
    return api;
  };
  return { api: get, unmount: view.unmount };
}

const escape = () =>
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

describe("useAfterClose", () => {
  it("runs the queued work after a close the owner starts", async () => {
    const { api } = renderHarness();
    const then = vi.fn();

    act(() => api().close(then));

    await waitFor(() => expect(then).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("never replays work queued for an earlier close", async () => {
    const { api } = renderHarness();
    const then = vi.fn();

    act(() => api().close(then));
    await waitFor(() => expect(then).toHaveBeenCalledTimes(1));
    act(() => api().reopen());
    await screen.findByRole("dialog");
    escape();

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(then).toHaveBeenCalledTimes(1);
  });

  it("drops the queued work when the menu reopens during the exit", async () => {
    const { api } = renderHarness();
    const then = vi.fn();

    act(() => api().close(then));
    act(() => api().reopen());
    await screen.findByRole("dialog");
    escape();

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await sleep(50);
    expect(then).not.toHaveBeenCalled();
  });

  it("drops the queued work when Escape lands before the reopen settles", async () => {
    const { api } = renderHarness();
    const then = vi.fn();

    act(() => {
      api().close(then);
      api().reopen();
    });
    escape();

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await sleep(50);
    expect(then).not.toHaveBeenCalled();
  });

  it("a delayed close does not shut a menu reopened in the meantime", async () => {
    const { api } = renderHarness();

    act(() => api().closeLater(30));
    escape();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    act(() => api().reopen());
    await screen.findByRole("dialog");
    await act(() => sleep(80));

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("a delayed close never fires after unmount", async () => {
    const onOpenChange = vi.fn();
    const { api, unmount } = renderHarness(onOpenChange);

    act(() => api().closeLater(30));
    unmount();
    await sleep(80);

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
