import { describe, expect, it } from "vitest";

import { askConfig } from "../config";
import { dailyCap, identityLimit } from "../limits";

const quiet = {
  pendingThreads: 0,
  pendingReplies: 0,
  repliesToday: 0,
  today: 0,
};
const { limits } = askConfig;

describe("dailyCap", () => {
  it("is per IP behind a trusted proxy and global otherwise", () => {
    expect(dailyCap(true)).toBe(limits.dailyPerIp);
    expect(dailyCap(false)).toBe(limits.dailyWithoutTrustedProxy);
  });
});

describe("identityLimit for threads", () => {
  it("allows a quiet identity", () => {
    expect(identityLimit("thread", quiet, 5)).toBeNull();
    expect(identityLimit("thread", { ...quiet, today: 4 }, 5)).toBeNull();
  });

  it("reports the daily cap first, then a pending thread", () => {
    expect(
      identityLimit("thread", { ...quiet, pendingThreads: 1, today: 5 }, 5)
    ).toBe("daily-cap");
    expect(identityLimit("thread", { ...quiet, pendingThreads: 1 }, 5)).toBe(
      "pending-thread"
    );
  });

  it("ignores reply activity", () => {
    expect(
      identityLimit(
        "thread",
        { ...quiet, pendingReplies: 99, repliesToday: 99 },
        5
      )
    ).toBeNull();
  });
});

describe("identityLimit for replies", () => {
  it("is not blocked by the sender's own pending thread", () => {
    expect(
      identityLimit("reply", { ...quiet, pendingThreads: 1 }, 5)
    ).toBeNull();
  });

  it("caps replies per day, then pending replies", () => {
    expect(
      identityLimit(
        "reply",
        { ...quiet, repliesToday: limits.repliesPerDay },
        99
      )
    ).toBe("reply-cap");
    expect(
      identityLimit(
        "reply",
        {
          ...quiet,
          repliesToday: limits.pendingRepliesPerIdentity,
          pendingReplies: limits.pendingRepliesPerIdentity,
        },
        99,
        { ...limits, repliesPerDay: 10 }
      )
    ).toBe("pending-replies");
    expect(
      identityLimit(
        "reply",
        { ...quiet, pendingReplies: limits.pendingRepliesPerIdentity - 1 },
        99
      )
    ).toBeNull();
  });

  it("still applies the network daily cap", () => {
    expect(identityLimit("reply", { ...quiet, today: 5 }, 5)).toBe("daily-cap");
  });
});
