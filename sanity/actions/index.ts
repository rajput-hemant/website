import type { DocumentActionsResolver } from "sanity";

import { singletonTypes } from "../schemas";
import {
  approveRepliesAction,
  markSpamAction,
  publishThreadAction,
  rejectAction,
} from "./question-status";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export const resolveDocumentActions: DocumentActionsResolver = (
  prev,
  { schemaType }
) => {
  if (singletonTypes.has(schemaType)) {
    return prev.filter(
      ({ action }) => action !== undefined && singletonActions.has(action)
    );
  }
  if (schemaType === "question") {
    return [
      publishThreadAction,
      approveRepliesAction,
      rejectAction,
      markSpamAction,
      ...prev.filter(
        ({ action }) => action !== "publish" && action !== "duplicate"
      ),
    ];
  }
  return prev;
};
