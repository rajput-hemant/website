'use client';

import { displayName, excerpt } from '~/lib/ask/display';
import { AuthorAvatar, MessageFrame, Tag, When } from './parts';
import { useViewer } from './viewer';

const WAITING = 'Waiting for review';

function useHeld(threadSlug: string | null) {
  const { state } = useViewer();
  return state?.held.filter((message) => message.threadSlug === threadSlug);
}

export function HeldQuestions() {
  const held = useHeld(null);
  if (!held?.length) return null;

  return (
    <ul className="text-fg-muted flex flex-col gap-6">
      {held.map((message) => (
        <li key={message.id}>
          <p className="line-clamp-2">{excerpt(message.body)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs">
            <Tag>{WAITING}</Tag>
            <When iso={message.createdAt} />
          </p>
        </li>
      ))}
    </ul>
  );
}

export function HeldReplies({ slug }: { slug: string }) {
  const held = useHeld(slug);
  if (!held?.length) return null;

  return held.map((message) => {
    const name = displayName({ name: message.name, isOwner: false });

    return (
      <MessageFrame
        key={message.id}
        className="text-fg-muted"
        avatar={
          <AuthorAvatar
            name={name}
            avatarUrl={null}
            seed={message.avatarSeed}
          />
        }
        header={
          <>
            <span className="font-medium">{name}</span>
            <Tag>{WAITING}</Tag>
            <span className="font-mono text-xs">
              <When iso={message.createdAt} />
            </span>
          </>
        }
      >
        <p className="wrap-break-word whitespace-pre-wrap">{message.body}</p>
      </MessageFrame>
    );
  });
}
