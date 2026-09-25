import { useState } from 'react';
import type { DocumentActionComponent, DocumentActionProps } from 'sanity';
import { useClient, useDocumentOperation } from 'sanity';
import { privateDocId } from '~/lib/ask/limits';
import { apiVersion } from '../env';

const read = (obj: unknown, key: string): string | undefined => {
  if (typeof obj !== 'object' || obj === null) return undefined;
  const value: unknown = Object.getOwnPropertyDescriptor(obj, key)?.value;
  return typeof value === 'string' ? value : undefined;
};

const current = (props: DocumentActionProps) => props.published ?? props.draft;

const useSetStatus = (props: DocumentActionProps) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const doc = current(props);

  return {
    status: read(doc, 'status'),
    publishedAt: read(doc, 'publishedAt'),
    disabled: Boolean(patch.disabled),
    set: (status: string, publishedAt?: string) => {
      patch.execute([
        { set: publishedAt ? { status, publishedAt } : { status } },
      ]);
      publish.execute();
      props.onComplete();
    },
  };
};

export const ApproveAction: DocumentActionComponent = (props) => {
  const { status, disabled, set } = useSetStatus(props);
  if (status !== 'pending' && status !== 'spam') return null;

  return {
    label: 'Approve',
    tone: 'positive',
    disabled,
    onHandle: () => set('published', new Date().toISOString()),
  };
};

export const HideAction: DocumentActionComponent = (props) => {
  const { status, disabled, set } = useSetStatus(props);
  if (status !== 'published' && status !== 'pending' && status !== 'spam') {
    return null;
  }

  return {
    label: 'Hide',
    tone: 'caution',
    disabled,
    onHandle: () => set('hidden'),
  };
};

export const UnhideAction: DocumentActionComponent = (props) => {
  const { status, disabled, set, publishedAt } = useSetStatus(props);
  if (status !== 'hidden') return null;

  return {
    label: 'Unhide',
    disabled,
    onHandle: () =>
      set('published', publishedAt ? undefined : new Date().toISOString()),
  };
};

export const BanAuthorAction: DocumentActionComponent = (props) => {
  const { disabled, set } = useSetStatus(props);
  const client = useClient({ apiVersion });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const doc = current(props);
  const author: unknown = doc?.author;
  const providerId = read(author, 'providerId');
  if (!providerId) return null;

  const name = read(author, 'name');
  const ban = async () => {
    const profile = await client.getDocument(
      privateDocId('askAuthor', providerId),
    );
    await client.createOrReplace({
      _id: privateDocId('askBan', providerId),
      _type: 'askBan',
      providerId,
      kind: read(author, 'kind'),
      name,
      email: read(profile, 'email'),
      ipHash: read(doc?.moderation, 'ipHash'),
      bannedAt: new Date().toISOString(),
    });
    set('hidden');
  };

  return {
    label: 'Ban author',
    tone: 'critical',
    disabled,
    onHandle: () => setOpen(true),
    dialog: error
      ? { type: 'popover', content: error, onClose: () => setError('') }
      : open && {
          type: 'confirm',
          tone: 'critical',
          message: `Ban ${name ?? providerId} and hide this message?`,
          onCancel: () => setOpen(false),
          onConfirm: () => {
            setOpen(false);
            ban().catch((reason: unknown) =>
              setError(reason instanceof Error ? reason.message : 'Ban failed'),
            );
          },
        },
  };
};
