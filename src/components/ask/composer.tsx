'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import type { SignInOptions } from '~/lib/ask/auth-options';
import { askConfig } from '~/lib/ask/config';
import { displayName } from '~/lib/ask/display';
import type { PostResult } from '~/lib/ask/types';
import { askApi } from './api';
import { AuthorAvatar } from './parts';
import { useViewer } from './viewer';

export const fieldClass =
  'border-rule bg-bg placeholder:text-fg-muted min-w-0 rounded-sm border px-3';
export const textareaClass = `${fieldClass} w-full py-2 field-sizing-content max-h-80 min-h-24 resize-none`;
export const buttonClass =
  'bg-accent text-bg cursor-pointer rounded-sm px-3 py-1 text-sm font-medium disabled:cursor-default disabled:opacity-60';

const COUNTER_FROM = askConfig.body.max - 200;

export function submitOnModEnter(
  event: React.KeyboardEvent<HTMLTextAreaElement>,
) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function Composer({
  slug,
  providers,
}: {
  slug?: string | undefined;
  providers: SignInOptions;
}) {
  const router = useRouter();
  const { state, refresh } = useViewer();
  const id = useId();
  const startedAt = useRef(0);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [devName, setDevName] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean }>();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const viewer = state?.viewer;
  const label = slug ? 'Write a reply' : 'Ask a question';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !body.trim()) return;
    setBusy(true);
    setStatus(undefined);
    const result = await askApi<PostResult>(
      slug ? `/api/ask/${encodeURIComponent(slug)}/reply` : '/api/ask',
      'POST',
      {
        body,
        ...(viewer?.kind === 'anonymous' && name.trim() ? { name } : {}),
        website: '',
        t: startedAt.current,
      },
    );

    if ('error' in result) {
      setStatus({ text: result.error, error: true });
    } else if (result.status === 'held') {
      setBody('');
      setStatus({
        text: 'Thanks. It will be reviewed and shown once approved.',
        error: false,
      });
      await refresh();
    } else if (!slug) {
      router.push(`/ask/${result.slug}`);
      return;
    } else {
      setBody('');
      await refresh();
    }
    setBusy(false);
  }

  async function devLogin() {
    const result = await signIn('dev', { name: devName, redirect: false });
    if (result.error) {
      setStatus({ text: 'Could not sign in.', error: true });
      return;
    }
    await refresh();
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-3"
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
        onKeyDown={submitOnModEnter}
        placeholder={label}
        maxLength={askConfig.body.max}
        readOnly={busy}
        required
        className={textareaClass}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {viewer?.kind === 'signed-in' ? (
          <p className="text-fg-muted flex min-w-0 items-center gap-2 text-sm">
            Posting as
            <AuthorAvatar
              name={displayName(viewer)}
              avatarUrl={viewer.image}
              seed={null}
              size={20}
            />
            <span className="text-fg truncate">{displayName(viewer)}</span>
            <button
              type="button"
              onClick={() => void signOut({ redirect: false }).then(refresh)}
              className="quiet-link cursor-pointer"
            >
              Sign out
            </button>
          </p>
        ) : viewer ? (
          <input
            aria-label="Name (optional)"
            placeholder="Name (optional)"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            maxLength={askConfig.name.max}
            autoComplete="nickname"
            className={`${fieldClass} max-w-56 flex-1 py-1 text-sm`}
          />
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          {body.length > COUNTER_FROM ? (
            <span className="text-fg-muted font-mono text-xs tabular-nums">
              {askConfig.body.max - body.length} left
            </span>
          ) : null}
          <button type="submit" disabled={busy} className={buttonClass}>
            {slug ? 'Reply' : 'Ask'}
          </button>
        </div>
      </div>

      {viewer?.kind === 'anonymous' &&
      (providers.github || providers.google || providers.dev) ? (
        <div className="text-fg-muted flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span>Sign in to post right away:</span>
          {providers.github ? (
            <button
              type="button"
              onClick={() => void signIn('github')}
              className="quiet-link cursor-pointer"
            >
              GitHub
            </button>
          ) : null}
          {providers.google ? (
            <button
              type="button"
              onClick={() => void signIn('google')}
              className="quiet-link cursor-pointer"
            >
              Google
            </button>
          ) : null}
          {providers.dev ? (
            <span className="flex items-center gap-2">
              <input
                aria-label="Dev login name"
                placeholder="Dev name"
                value={devName}
                onChange={(event) => {
                  setDevName(event.target.value);
                }}
                className={`${fieldClass} w-28 py-0.5`}
              />
              <button
                type="button"
                disabled={!devName.trim()}
                onClick={() => void devLogin()}
                className="quiet-link cursor-pointer disabled:cursor-default"
              >
                Dev login
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      <p
        aria-live="polite"
        className={`text-sm ${status?.error ? 'text-fg' : 'text-fg-muted'}`}
      >
        {status?.text}
      </p>
    </form>
  );
}
