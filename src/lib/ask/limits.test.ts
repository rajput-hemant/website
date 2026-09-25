import { describe, expect, it } from 'vitest';
import { askConfig } from './config';
import {
  canDelete,
  canEdit,
  checkPostLimits,
  countReactions,
  initialStatus,
  isOwnerId,
  privateDocId,
  reactionItemKey,
  type Activity,
  type Actor,
} from './limits';

const quiet: Activity = {
  banned: false,
  questionsToday: 0,
  repliesLastHour: 0,
  heldNow: 0,
  postsToday: 0,
  postsTodayByIp: 0,
};
const member: Actor = {
  kind: 'signed-in',
  providerId: 'github:1',
  isOwner: false,
};
const owner: Actor = {
  kind: 'signed-in',
  providerId: 'github:2',
  isOwner: true,
};
const visitor: Actor = { kind: 'anonymous', providerId: 'anon:x', ipHash: 'h' };
const { signedIn, anonymous } = askConfig.limits;

describe('checkPostLimits', () => {
  it('lets a quiet member post', () => {
    expect(checkPostLimits(member, 'question', quiet)).toBeNull();
  });

  it('refuses anyone banned, the owner included', () => {
    const banned = { ...quiet, banned: true };
    expect(checkPostLimits(member, 'question', banned)?.status).toBe(403);
    expect(checkPostLimits(owner, 'reply', banned)?.status).toBe(403);
  });

  it('caps member questions per day without capping replies', () => {
    const busy = { ...quiet, questionsToday: signedIn.questionsPerDay };
    expect(checkPostLimits(member, 'question', busy)?.status).toBe(429);
    expect(checkPostLimits(member, 'reply', busy)).toBeNull();
  });

  it('caps member replies per hour but not the owner', () => {
    const busy = { ...quiet, repliesLastHour: signedIn.repliesPerHour };
    expect(checkPostLimits(member, 'reply', busy)?.status).toBe(429);
    expect(
      checkPostLimits(owner, 'reply', { ...quiet, repliesLastHour: 1000 }),
    ).toBeNull();
  });

  it('caps anonymous held messages, daily posts and daily posts per ip', () => {
    expect(checkPostLimits(visitor, 'reply', quiet)).toBeNull();
    expect(
      checkPostLimits(visitor, 'reply', {
        ...quiet,
        heldNow: anonymous.heldAtOnce,
      })?.status,
    ).toBe(429);
    expect(
      checkPostLimits(visitor, 'question', {
        ...quiet,
        postsToday: anonymous.postsPerDay,
      })?.status,
    ).toBe(429);
    expect(
      checkPostLimits(visitor, 'question', {
        ...quiet,
        postsTodayByIp: anonymous.postsPerDayPerIp,
      })?.status,
    ).toBe(429);
  });
});

describe('initialStatus', () => {
  it('publishes members, flags spam and holds anonymous posts', () => {
    expect(initialStatus(member, false)).toBe('published');
    expect(initialStatus(member, true)).toBe('spam');
    expect(initialStatus(visitor, false)).toBe('pending');
  });
});

describe('canEdit and canDelete', () => {
  const nowMs = Date.parse('2026-09-26T12:00:00Z');
  const own = {
    providerId: 'github:1',
    submittedAt: '2026-09-26T11:50:00Z',
    deletedAt: null,
  };

  it('allows the author to edit inside the window only', () => {
    expect(canEdit(own, 'github:1', nowMs)).toBe(true);
    expect(canEdit(own, 'github:1', nowMs + askConfig.editWindowMs)).toBe(
      false,
    );
    expect(canEdit(own, 'github:9', nowMs)).toBe(false);
    expect(
      canEdit({ ...own, deletedAt: '2026-09-26T11:55:00Z' }, 'github:1', nowMs),
    ).toBe(false);
  });

  it('allows the author to delete at any time', () => {
    expect(
      canDelete({ ...own, submittedAt: '2020-01-01T00:00:00Z' }, 'github:1'),
    ).toBe(true);
    expect(canDelete(own, 'github:9')).toBe(false);
  });
});

describe('identity helpers', () => {
  it('matches owner ids exactly', () => {
    expect(isOwnerId('github:2', ['github:2'])).toBe(true);
    expect(isOwnerId('google:2', ['github:2'])).toBe(false);
  });

  it('counts known reactions and drops unknown keys', () => {
    expect(countReactions(['heart', 'pray', 'heart', 'bogus'])).toEqual([
      { key: 'heart', count: 2 },
      { key: 'pray', count: 1 },
    ]);
  });

  it('sanitises provider ids into keys and dotted private ids', () => {
    expect(reactionItemKey('heart', 'github:1')).toBe('heart-github-1');
    expect(reactionItemKey('heart', 'x"]|y')).toBe('heart-x---y');
    expect(privateDocId('askBan', 'github:1')).toBe('askBan.github-1');
  });
});
