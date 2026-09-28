import {
  filter,
  isAction,
  keywordsFor,
  type ActionItem as SharedActionItem,
  type Item as SharedItem,
} from "@/lib/command/items";

export type Action = "copy-email" | "theme" | "customize" | "markdown";

export type ActionItem = SharedActionItem<Action>;
export type Item = SharedItem<Action>;

export { filter, isAction, keywordsFor };

/** The Actions group. Copy email needs the index; markdown needs a mirrored page. */
export function buildActions({
  email,
  markdownPath,
}: {
  email?: string;
  markdownPath?: string;
}): ActionItem[] {
  const actions: ActionItem[] = [];
  if (email) {
    actions.push({
      id: "action:copy-email",
      title: "Copy email",
      subtitle: email,
      group: "Actions",
      action: "copy-email",
      keywords: ["contact", "mail", "clipboard"],
    });
  }
  actions.push(
    {
      id: "action:theme",
      title: "Toggle theme",
      subtitle: "Switch between light and dark",
      group: "Actions",
      action: "theme",
      keywords: ["dark", "light", "mode", "appearance"],
    },
    {
      id: "action:customize",
      title: "Customize",
      subtitle: "Accent, reading font, motion and effects",
      group: "Actions",
      action: "customize",
      keywords: ["preferences", "settings", "accent", "font", "motion"],
    }
  );
  if (markdownPath) {
    actions.push({
      id: "action:markdown",
      title: "View as markdown",
      subtitle: markdownPath,
      group: "Actions",
      action: "markdown",
      keywords: ["md", "source", "raw", "text", "llm"],
    });
  }
  return actions;
}
