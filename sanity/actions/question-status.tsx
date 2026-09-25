import { type ComponentType } from "react";
import { Ban, CircleX, Send } from "lucide-react";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";

import type { QuestionStatusValue } from "../schemas/question";

type StatusActionOptions = {
  status: QuestionStatusValue;
  label: string;
  tone: "positive" | "caution" | "critical";
  icon: ComponentType;
};

type QuestionFields = { status?: string; publishedAt?: string };

/**
 * Moderation is a field, not Sanity's publish state: the submission route
 * creates questions as published documents, so each action patches `status`
 * and then publishes, which also ships a drafted answer in the same step.
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
    const isLive = (published as QuestionFields | null)?.status === "published";

    if (!isPublishing && current?.status === status) return null;

    return {
      label: isPublishing && isLive ? "Update answer" : label,
      icon,
      tone,
      disabled:
        !current ||
        Boolean(patch.disabled) ||
        (isPublishing && isLive && !draft),
      onHandle: () => {
        patch.execute([
          {
            set: {
              status,
              ...(isPublishing && !current?.publishedAt
                ? { publishedAt: new Date().toISOString() }
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

export const publishAnswerAction = createStatusAction({
  status: "published",
  label: "Publish answer",
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
