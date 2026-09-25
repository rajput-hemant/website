import type { DocumentActionsResolver } from "sanity";

import { singletonTypes } from "../schemas";
import {
  markSpamAction,
  publishAnswerAction,
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
      publishAnswerAction,
      rejectAction,
      markSpamAction,
      ...prev.filter(
        ({ action }) => action !== "publish" && action !== "duplicate"
      ),
    ];
  }
  return prev;
};
