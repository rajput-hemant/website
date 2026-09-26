"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  moderate,
  type ModerateRequest,
  type ModerationAction,
} from "@/lib/ask/client";

import { useOwner } from "./owner-provider";

const doneLabels: Partial<Record<ModerationAction, string>> = {
  reject: "Hidden",
  spam: "Marked spam",
};

/**
 * Owner actions on one published message: hide it or mark it as spam.
 * `result` is the outcome to announce, or the server's error.
 */
export function useMessageModeration(
  slug: string,
  target: ModerateRequest["target"]
) {
  const { owner } = useOwner();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<string | null>(null);

  function run(action: ModerationAction) {
    startTransition(async () => {
      const response = await moderate({ slug, target, action });
      setResult(
        response.ok ? (doneLabels[action] ?? "Updated") : response.message
      );
      if (response.ok) router.refresh();
    });
  }

  return { owner, isPending, result, run };
}
