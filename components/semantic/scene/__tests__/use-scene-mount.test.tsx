// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SceneModule } from "../use-scene-mount";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/scene/tier", () => ({ detectTier: () => 2 }));

/** The part of an IntersectionObserverEntry the hook reads. */
type Entry = { target: Element; isIntersecting: boolean };

/** A controllable IntersectionObserver: `fire(true)` puts every watched element in range. */
class FakeObserver {
  static all: FakeObserver[] = [];
  readonly targets = new Set<Element>();
  constructor(
    readonly callback: (entries: Entry[]) => void,
    readonly options: IntersectionObserverInit = {}
  ) {
    FakeObserver.all.push(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
  static fire(isIntersecting: boolean) {
    for (const io of FakeObserver.all) {
      const entries = [...io.targets].map((target) => ({
        target,
        isIntersecting,
      }));
      if (entries.length) io.callback(entries);
    }
  }
}

function fakeScene() {
  const detach = vi.fn();
  const chunk: SceneModule = {
    mountScene: vi.fn((_host, _tier, onReady: () => void) => {
      onReady();
      return detach;
    }),
    enableTilt: vi.fn(() => Promise.resolve(false)),
  };
  return { chunk, detach, importer: vi.fn(() => Promise.resolve(chunk)) };
}

async function setup(importer: () => Promise<SceneModule>) {
  // Fresh module state (loaded chunk, fade flag) for every test.
  const { useSceneMount } = await import("../use-scene-mount");
  function Slot() {
    const { rootRef, hostRef } = useSceneMount("home", importer);
    return (
      <div data-testid="slot">
        <div data-scene-poster="" data-testid="poster" />
        <div ref={rootRef}>
          <div ref={hostRef} />
        </div>
      </div>
    );
  }
  return render(<Slot />);
}

/** Lets the load-and-idle wait, the import and the mount settle. */
async function flush() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  FakeObserver.all = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useSceneMount", () => {
  it("watches the host with a margin and imports nothing while it's far away", async () => {
    const { importer } = fakeScene();
    await setup(importer);
    const { NEAR_MARGIN } = await import("../use-scene-mount");
    expect(FakeObserver.all).toHaveLength(1);
    expect(FakeObserver.all[0]?.options.rootMargin).toBe(NEAR_MARGIN);

    FakeObserver.fire(false);
    await flush();
    expect(importer).not.toHaveBeenCalled();
  });

  it("imports once the slot nears the viewport, then hides the poster", async () => {
    const { chunk, importer } = fakeScene();
    const { getByTestId } = await setup(importer);
    const poster = getByTestId("poster");
    expect(poster.dataset.scenePoster).toBe("");

    FakeObserver.fire(true);
    await flush();
    expect(importer).toHaveBeenCalledTimes(1);
    expect(chunk.mountScene).toHaveBeenCalledTimes(1);
    expect(poster.dataset.scenePoster).toBe("hidden");

    // One import per session, and the observer is done.
    FakeObserver.fire(true);
    await flush();
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it("stops watching on unmount, before the slot came near", async () => {
    const { importer } = fakeScene();
    const { unmount } = await setup(importer);
    unmount();
    FakeObserver.fire(true);
    await flush();
    expect(importer).not.toHaveBeenCalled();
  });

  it("mounts a later slot at once when the chunk is already in", async () => {
    const { chunk, importer, detach } = fakeScene();
    const first = await setup(importer);
    FakeObserver.fire(true);
    await flush();
    first.unmount();
    expect(detach).toHaveBeenCalledTimes(1);

    const { useSceneMount } = await import("../use-scene-mount");
    function Next() {
      const { rootRef, hostRef } = useSceneMount("about", importer);
      return (
        <div>
          <div data-scene-poster="" />
          <div ref={rootRef}>
            <div ref={hostRef} />
          </div>
        </div>
      );
    }
    const observers = FakeObserver.all.length;
    render(<Next />);
    expect(chunk.mountScene).toHaveBeenCalledTimes(2);
    expect(FakeObserver.all).toHaveLength(observers);
  });

  it("keeps the poster and loads nothing on T0", async () => {
    vi.doMock("@/lib/scene/tier", () => ({ detectTier: () => 0 }));
    const { importer } = fakeScene();
    const { getByTestId } = await setup(importer);
    FakeObserver.fire(true);
    await flush();
    expect(importer).not.toHaveBeenCalled();
    expect(FakeObserver.all).toHaveLength(0);
    expect(getByTestId("poster").dataset.scenePoster).toBe("");
    vi.doMock("@/lib/scene/tier", () => ({ detectTier: () => 2 }));
  });

  it("hands the slot back to its poster while a foreign canvas pauses the scene", async () => {
    const { pauseScene, sceneStore } = await import("@/lib/scene/store");
    sceneStore.setState({ paused: 0 });
    const { chunk, importer, detach } = fakeScene();
    const { getByTestId } = await setup(importer);
    FakeObserver.fire(true);
    await flush();
    const poster = getByTestId("poster");
    expect(poster.dataset.scenePoster).toBe("hidden");

    const release = pauseScene();
    expect(detach).toHaveBeenCalledTimes(1);
    expect(poster.dataset.scenePoster).toBe("");

    release();
    expect(chunk.mountScene).toHaveBeenCalledTimes(2);
    expect(poster.dataset.scenePoster).toBe("hidden");
  });

  it("waits for the release before mounting a slot that loads while paused", async () => {
    const { pauseScene, sceneStore } = await import("@/lib/scene/store");
    sceneStore.setState({ paused: 0 });
    const release = pauseScene();
    const { chunk, importer } = fakeScene();
    await setup(importer);
    FakeObserver.fire(true);
    await flush();
    expect(chunk.mountScene).not.toHaveBeenCalled();
    release();
    expect(chunk.mountScene).toHaveBeenCalledTimes(1);
  });
});
