// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { views } from "..";
import { createPosts, createPylon } from "../about";
import { createInfoSign, createValidator } from "../ask";
import { createYearDrum } from "../now";
import { createBogie, createTicket } from "../project";
import {
  createBufferStop,
  createLevers,
  createPrinter,
  createTurntable,
} from "../yard";

const factories = {
  ticket: createTicket,
  bogie: createBogie,
  pylon: createPylon,
  posts: createPosts,
  drum: createYearDrum,
  info: createInfoSign,
  validator: createValidator,
  turntable: createTurntable,
  printer: createPrinter,
  levers: createLevers,
  buffer: createBufferStop,
};

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  // jsdom has no 2d canvas; the atlas simply stays blank.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("in-page views", () => {
  it("registers every placeholder id", () => {
    for (const id of Object.keys(factories)) expect(views).toHaveProperty(id);
  });

  it.each(Object.entries(factories))(
    "%s has one root group and draws nothing more once at rest",
    (_, make) => {
      const host = document.createElement("div");
      document.body.append(host);
      const view = make(host);
      expect(view.root.type).toBe("Group");
      const off = view.bind();
      let frames = 0;
      while (view.frame(1 / 60, 160, 90) && frames < 2000) frames++;
      expect(frames).toBeLessThan(2000);
      off();
    }
  );
});
