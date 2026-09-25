import { BadgeCheck } from 'lucide-react';
import { displayName } from '~/lib/ask/display';
import type { ThreadMessage } from '~/lib/ask/types';
import { MessageBody } from './message-body';
import { MessageControls } from './message-controls';
import { AuthorAvatar, MessageFrame, Tag, When } from './parts';

export function Message({ message }: { message: ThreadMessage }) {
  const { author } = message;
  const name = displayName(author);

  return (
    <MessageFrame
      className="border-rule first:not-last:border-b first:not-last:pb-8"
      avatar={
        <AuthorAvatar
          name={name}
          avatarUrl={author.kind === 'anonymous' ? null : author.avatarUrl}
          seed={author.avatarSeed}
        />
      }
      header={
        <>
          <span className="flex items-center gap-1 font-medium">
            {name}
            {author.isOwner ? (
              <span title="Verified" className="text-accent inline-flex">
                <BadgeCheck size={15} aria-hidden />
                <span className="sr-only">Verified</span>
              </span>
            ) : null}
          </span>
          {author.isThreadAuthor ? <Tag>Author</Tag> : null}
          <span className="text-fg-muted font-mono text-xs">
            <When iso={message.createdAt} />
            {message.editedAt ? ' · edited' : null}
          </span>
        </>
      }
    >
      {message.deleted || !message.body ? (
        <p className="text-fg-muted italic">Message deleted</p>
      ) : (
        <MessageControls id={message.id} reactions={message.reactions}>
          <MessageBody body={message.body} />
        </MessageControls>
      )}
    </MessageFrame>
  );
}
