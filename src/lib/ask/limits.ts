import { askConfig, REACTION_KEYS, type ReactionKey } from './config';
import type { MessageStatus, ReactionCount } from './types';

export type Actor =
  | { kind: 'signed-in'; providerId: string; isOwner: boolean }
  | { kind: 'anonymous'; providerId: string; ipHash: string };

export type PostKind = 'question' | 'reply';

export type Activity = {
  banned: boolean;
  questionsToday: number;
  repliesLastHour: number;
  heldNow: number;
  postsToday: number;
  postsTodayByIp: number;
};

export type Refusal = { status: 403 | 429; error: string };

export function checkPostLimits(
  actor: Actor,
  kind: PostKind,
  activity: Activity,
): Refusal | null {
  if (activity.banned) {
    return { status: 403, error: 'You can no longer post here.' };
  }

  if (actor.kind === 'signed-in') {
    if (actor.isOwner) return null;
    const { questionsPerDay, repliesPerHour } = askConfig.limits.signedIn;
    if (kind === 'question' && activity.questionsToday >= questionsPerDay) {
      return {
        status: 429,
        error: `You can ask ${questionsPerDay} questions a day. Try again tomorrow.`,
      };
    }
    if (kind === 'reply' && activity.repliesLastHour >= repliesPerHour) {
      return {
        status: 429,
        error: 'You are replying a lot. Try again in a little while.',
      };
    }
    return null;
  }

  const { heldAtOnce, postsPerDay, postsPerDayPerIp } =
    askConfig.limits.anonymous;
  if (activity.heldNow >= heldAtOnce) {
    return {
      status: 429,
      error: 'Your last message is still waiting for review.',
    };
  }
  if (
    activity.postsToday >= postsPerDay ||
    activity.postsTodayByIp >= postsPerDayPerIp
  ) {
    return {
      status: 429,
      error: 'Daily limit reached. Sign in or try again tomorrow.',
    };
  }
  return null;
}

export function initialStatus(actor: Actor, flagged: boolean): MessageStatus {
  if (flagged) return 'spam';
  return actor.kind === 'signed-in' ? 'published' : 'pending';
}

export type OwnedMessage = {
  providerId: string | null;
  submittedAt: string;
  deletedAt: string | null;
};

export function canEdit(
  message: OwnedMessage,
  providerId: string,
  nowMs: number,
): boolean {
  return (
    message.providerId === providerId &&
    !message.deletedAt &&
    nowMs - Date.parse(message.submittedAt) <= askConfig.editWindowMs
  );
}

export function canDelete(message: OwnedMessage, providerId: string): boolean {
  return message.providerId === providerId && !message.deletedAt;
}

export function isOwnerId(
  providerId: string,
  ownerIds: readonly string[],
): boolean {
  return ownerIds.includes(providerId);
}

export function isReactionKey(value: string): value is ReactionKey {
  return REACTION_KEYS.some((key) => key === value);
}

export function countReactions(keys: readonly string[]): ReactionCount[] {
  return REACTION_KEYS.map((key) => ({
    key,
    count: keys.filter((value) => value === key).length,
  })).filter((reaction) => reaction.count > 0);
}

export function reactionItemKey(key: ReactionKey, providerId: string): string {
  return `${key}-${providerId.replace(/[^\w-]/g, '-')}`;
}

export function privateDocId(
  type: 'askBan' | 'askAuthor',
  providerId: string,
): string {
  return `${type}.${providerId.replace(/[^\w-]/g, '-')}`;
}
