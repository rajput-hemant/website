import { describe, expect, it } from "vitest";

import { pushRecent, readRecent, RECENT_KEY } from "../recent";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

describe("recent", () => {
  it("moves an opened id to the front without duplicates", () => {
    const storage = memoryStorage();
    pushRecent("a", storage);
    pushRecent("b", storage);
    expect(pushRecent("a", storage)).toEqual(["a", "b"]);
    expect(readRecent(storage)).toEqual(["a", "b"]);
  });

  it("keeps at most eight", () => {
    const storage = memoryStorage();
    for (const id of "abcdefghij") pushRecent(id, storage);
    expect(readRecent(storage)).toEqual([..."jihgfedc"]);
  });

  it("survives corrupt or foreign data", () => {
    expect(readRecent(memoryStorage({ [RECENT_KEY]: "{nope" }))).toEqual([]);
    expect(readRecent(memoryStorage({ [RECENT_KEY]: '[1,"a",null]' }))).toEqual(
      ["a"]
    );
  });

  it("tolerates storage that throws", () => {
    const broken = memoryStorage();
    broken.setItem = () => {
      throw new Error("quota");
    };
    expect(pushRecent("a", broken)).toEqual(["a"]);
  });
});
