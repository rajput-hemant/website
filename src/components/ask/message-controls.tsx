'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { FaceSlightlySmilingPlus } from 'lucide-react';
import {
  askConfig,
  REACTION_KEYS,
  REACTIONS,
  type ReactionKey,
} from '~/lib/ask/config';
import type { ReactionCount } from '~/lib/ask/types';
import { askApi } from './api';
import { buttonClass, submitOnModEnter, textareaClass } from './composer';
import { useViewer } from './viewer';

type Override = { on: boolean; delta: number };

const pillClass =
  'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs tabular-nums';

export function MessageControls({
  id,
  reactions,
  children,
}: {
  id: string;
  reactions: ReactionCount[];
  children: React.ReactNode;
}) {
  const { state, refresh } = useViewer();
  // Overrides are dropped once fresh server counts arrive (new array identity).
  const [local, setLocal] = useState<{
    base: ReactionCount[];
    keys: Partial<Record<ReactionKey, Override>>;
  }>({ base: reactions, keys: {} });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signedIn = state?.viewer.kind === 'signed-in';
  const own = state?.mine.find((message) => message.id === id);
  const canEdit =
    !!own &&
    !!state &&
    state.fetchedAt - Date.parse(own.createdAt) < askConfig.editWindowMs;
  const reacted = state?.reacted.find((entry) => entry.id === id)?.keys ?? [];
  const overrides = local.base === reactions ? local.keys : {};

  const isOn = (key: ReactionKey) =>
    overrides[key]?.on ?? reacted.includes(key);
  const count = (key: ReactionKey) =>
    (reactions.find((reaction) => reaction.key === key)?.count ?? 0) +
    (overrides[key]?.delta ?? 0);
  const shown = REACTION_KEYS.filter((key) => count(key) > 0);

  async function toggle(key: ReactionKey) {
    setPickerOpen(false);
    const on = !isOn(key);
    const delta = (overrides[key]?.delta ?? 0) + (on ? 1 : -1);
    setLocal({ base: reactions, keys: { ...overrides, [key]: { on, delta } } });
    const result = await askApi<{ ok: true }>(
      `/api/ask/messages/${id}/reactions`,
      'PUT',
      { key, on },
    );
    if ('error' in result) {
      setLocal({ base: reactions, keys: { ...overrides } });
      setError(result.error);
      return;
    }
    await refresh();
  }

  async function mutate(method: 'PATCH' | 'DELETE') {
    setBusy(true);
    setError('');
    const result = await askApi<{ ok: true }>(
      `/api/ask/messages/${id}`,
      method,
      method === 'PATCH' ? { body: draft } : undefined,
    );
    setBusy(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setMode('view');
    await refresh();
  }

  return (
    <>
      {mode === 'edit' && own ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void mutate('PATCH');
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            aria-label="Edit message"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={submitOnModEnter}
            maxLength={askConfig.body.max}
            readOnly={busy}
            required
            autoFocus
            className={textareaClass}
          />
          <div className="flex items-center justify-end gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('view');
              }}
              className="quiet-link cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy} className={buttonClass}>
              Save
            </button>
          </div>
        </form>
      ) : (
        children
      )}

      {shown.length || signedIn || own ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {shown.map((key) => {
            const content = (
              <>
                <span aria-hidden>{REACTIONS[key].emoji}</span>
                <span className="sr-only">{REACTIONS[key].label}</span>
                {count(key)}
              </>
            );

            return signedIn ? (
              <button
                key={key}
                type="button"
                aria-pressed={isOn(key)}
                onClick={() => void toggle(key)}
                className={`${pillClass} cursor-pointer ${isOn(key) ? 'border-accent bg-accent/10' : 'border-rule hover:border-fg-muted'}`}
              >
                {content}
              </button>
            ) : (
              <span key={key} className={`${pillClass} border-rule`}>
                {content}
              </span>
            );
          })}

          {signedIn ? (
            <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
              <Popover.Trigger className="quiet-link inline-flex size-6 cursor-pointer items-center justify-center rounded-sm">
                <FaceSlightlySmilingPlus size={15} aria-hidden />
                <span className="sr-only">Add reaction</span>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side="top" align="start" sideOffset={6}>
                  <Popover.Popup className="bg-bg border-rule shadow-fg/5 flex gap-0.5 rounded-sm border p-1 shadow-lg outline-none">
                    {REACTION_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={isOn(key)}
                        aria-label={REACTIONS[key].label}
                        onClick={() => void toggle(key)}
                        className={`hover:bg-fg/8 size-8 cursor-pointer rounded-sm text-base ${isOn(key) ? 'bg-accent/10' : ''}`}
                      >
                        {REACTIONS[key].emoji}
                      </button>
                    ))}
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          ) : null}

          {own && mode !== 'edit' ? (
            <div className="text-fg-muted ml-auto flex items-center gap-3 text-xs">
              {mode === 'delete' ? (
                <>
                  <span>Delete this message?</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void mutate('DELETE')}
                    className="quiet-link cursor-pointer font-medium"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('view');
                    }}
                    className="quiet-link cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(own.body);
                        setError('');
                        setMode('edit');
                      }}
                      className="quiet-link cursor-pointer"
                    >
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('delete');
                    }}
                    className="quiet-link cursor-pointer"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <p aria-live="polite" className="mt-1 text-sm empty:mt-0">
        {error}
      </p>
    </>
  );
}
