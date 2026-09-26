import * as React from "react";
import { Ban, CheckCheck, CircleX, Send } from "lucide-react";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";

import type { QuestionStatusValue } from "../schemas/question";

type StatusActionOptions = {
  status: QuestionStatusValue;
  label: string;
  tone: "positive" | "caution" | "critical";
  icon: React.ComponentType;
};

type QuestionFields = {
  status?: string;
  publishedAt?: string;
  replies?: { _key?: string; status?: string }[];
};

/** Whether the draft publishes a reply that the live document does not show yet. */
function publishesNewReply(
  draft: QuestionFields | null,
  live: QuestionFields | null
): boolean {
  const liveKeys = new Set(
    (live?.replies ?? []).flatMap((reply) =>
      reply.status === "published" && reply._key ? [reply._key] : []
    )
  );
  return (draft?.replies ?? []).some(
    (reply) =>
      reply.status === "published" && reply._key && !liveKeys.has(reply._key)
  );
}

/**
 * Moderation is a field, not Sanity's publish state: the submission routes
 * create threads as published documents, so each action patches `status`
 * and then publishes, which also ships drafted reply edits in the same step.
 */
function createStatusAction({
  status,
  label,
  tone,
  icon,
}: StatusActionOptions): DocumentActionComponent {
  const StatusAction: DocumentActionComponent = ({
    id,
    type,
    draft,
    published,
  }) => {
    const { patch, publish } = useDocumentOperation(id, type);
    const current = (draft ?? published) as QuestionFields | null;
    const isPublishing = status === "published";
    const live = published as QuestionFields | null;
    const isLive = live?.status === "published";

    if (!isPublishing && current?.status === status) return null;

    return {
      label: isPublishing && isLive ? "Update" : label,
      icon,
      tone,
      disabled:
        !current ||
        Boolean(patch.disabled) ||
        (isPublishing && isLive && !draft),
      onHandle: () => {
        const now = new Date().toISOString();
        patch.execute([
          {
            set: {
              status,
              ...(isPublishing &&
              (!isLive ||
                publishesNewReply(draft as QuestionFields | null, live))
                ? { lastActivityAt: now }
                : {}),
              ...(isPublishing && !current?.publishedAt
                ? { publishedAt: now }
                : {}),
            },
          },
        ]);
        publish.execute();
      },
    };
  };
  StatusAction.displayName = `QuestionStatusAction(${status})`;
  return StatusAction;
}

export const publishThreadAction = createStatusAction({
  status: "published",
  label: "Publish",
  tone: "positive",
  icon: Send,
});

export const rejectAction = createStatusAction({
  status: "rejected",
  label: "Reject",
  tone: "caution",
  icon: CircleX,
});

export const markSpamAction = createStatusAction({
  status: "spam",
  label: "Mark spam",
  tone: "critical",
  icon: Ban,
});

/**
 * Publishes every pending reply in the thread at once and bumps
 * `lastActivityAt`, the Studio twin of approving them from the site. Single
 * replies can still be approved by editing their status and publishing.
 */
const ApproveRepliesAction: DocumentActionComponent = ({
  id,
  type,
  draft,
  published,
}) => {
  const { patch, publish } = useDocumentOperation(id, type);
  const current = (draft ?? published) as QuestionFields | null;
  const pendingKeys = (current?.replies ?? []).flatMap((reply) =>
    reply.status === "pending" && reply._key ? [reply._key] : []
  );

  if (pendingKeys.length === 0) return null;

  return {
    label:
      pendingKeys.length === 1
        ? "Approve reply"
        : `Approve ${pendingKeys.length} replies`,
    icon: CheckCheck,
    tone: "positive",
    disabled: Boolean(patch.disabled),
    onHandle: () => {
      const set: Record<string, string> = {
        lastActivityAt: new Date().toISOString(),
      };
      for (const key of pendingKeys) {
        set[`replies[_key=="${key}"].status`] = "published";
      }
      patch.execute([{ set }]);
      publish.execute();
    },
  };
};
ApproveRepliesAction.displayName = "ApproveRepliesAction";

export const approveRepliesAction = ApproveRepliesAction;
