import 'server-only';
import { cacheLife } from 'next/cache';
import { createClient } from 'next-sanity';
import { askEnv } from '~/env/ask';
import { serverEnv } from '~/env/server';
import { apiVersion, dataset, projectId } from '~/sanity/env';
import { exceedsCircuitBreakerCap } from './circuit-breaker';
import { askConfig } from './config';

function cdnReadClient() {
  return createClient({ projectId, dataset, apiVersion, useCdn: true });
}

function freshReadClient() {
  return createClient({ projectId, dataset, apiVersion, useCdn: false }).withConfig(
    { token: serverEnv.SANITY_API_READ_TOKEN },
  );
}

function writeClient() {
  return createClient({ projectId, dataset, apiVersion, useCdn: false }).withConfig(
    { token: serverEnv.SANITY_API_WRITE_TOKEN },
  );
}

export async function getOpenQuestionCount(): Promise<number> {
  'use cache';
  cacheLife({ revalidate: askConfig.circuitBreaker.cacheLifeSeconds });

  return cdnReadClient().fetch<number>(
    `count(*[_type == "question" && status in ["pending", "unreviewed"]])`,
  );
}

export async function isCircuitBreakerOpen(): Promise<boolean> {
  return exceedsCircuitBreakerCap(await getOpenQuestionCount());
}

export async function findOpenThread(providerId: string): Promise<boolean> {
  const cutoff = new Date(
    Date.now() - askConfig.openThreadWindowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const openThread = await freshReadClient().fetch<string | null>(
    `*[
      _type == "question" &&
      author.providerId == $providerId &&
      !defined(closedAt) &&
      submittedAt > $cutoff
    ][0]._id`,
    { providerId, cutoff },
  );

  return Boolean(openThread);
}

export async function isInCooldown(providerId: string): Promise<boolean> {
  const cutoff = new Date(
    Date.now() - askConfig.cooldownAfterCloseHours * 60 * 60 * 1000,
  ).toISOString();

  const recentlyClosed = await freshReadClient().fetch<string | null>(
    `*[
      _type == "question" &&
      author.providerId == $providerId &&
      defined(closedAt) &&
      closedAt > $cutoff
    ][0]._id`,
    { providerId, cutoff },
  );

  return Boolean(recentlyClosed);
}

export async function findDuplicatePendingSlug(
  providerId: string,
  messageBody: string,
): Promise<string | null> {
  return freshReadClient().fetch<string | null>(
    `*[
      _type == "question" &&
      author.providerId == $providerId &&
      status == "pending" &&
      body == $messageBody
    ][0].slug.current`,
    { providerId, messageBody },
  );
}

export interface CreateQuestionInput {
  body: string;
  name: string | undefined;
  email: string | undefined;
  providerId: string;
  status: 'pending' | 'spam';
  slug: string;
  submittedAt: string;
  moderation: {
    heuristicsScore: number;
    botid: string;
    ipHash: string;
    ua: string;
    elapsedMs: number;
  };
}

export interface CreatedQuestion {
  id: string;
  slug: string;
}

export async function createQuestion(
  input: CreateQuestionInput,
): Promise<CreatedQuestion> {
  if (askEnv.SANITY_WRITE_DRY_RUN) {
    return { id: `dry-run-${input.slug}`, slug: input.slug };
  }

  const doc = await writeClient().create({
    _type: 'question',
    body: input.body,
    author: {
      _type: 'object',
      kind: 'anonymous',
      name: input.name,
      email: input.email,
      providerId: input.providerId,
    },
    status: input.status,
    slug: { _type: 'slug', current: input.slug },
    submittedAt: input.submittedAt,
    moderation: { _type: 'object', ...input.moderation },
  });

  return { id: doc._id, slug: input.slug };
}
