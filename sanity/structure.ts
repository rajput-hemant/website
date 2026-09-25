import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  Inbox,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { questionStatuses } from "./schemas/question";

const statusIcons = {
  pending: Clock,
  published: CircleCheck,
  rejected: CircleX,
  spam: Ban,
} as const;

function singleton(
  S: StructureBuilder,
  type: string,
  title: string,
  icon: typeof UserRound
) {
  return S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title));
}

function inbox(S: StructureBuilder) {
  return S.listItem()
    .title("Inbox")
    .id("inbox")
    .icon(Inbox)
    .child(
      S.list()
        .title("Inbox")
        .items([
          ...questionStatuses.map(({ title, value }) =>
            S.listItem()
              .title(title)
              .id(`questions-${value}`)
              .icon(statusIcons[value])
              .child(
                S.documentTypeList("question")
                  .title(title)
                  .filter('_type == "question" && status == $status')
                  .params({ status: value })
                  .defaultOrdering([
                    { field: "submittedAt", direction: "desc" },
                  ])
              )
          ),
          S.divider(),
          S.documentTypeListItem("question").title("All questions"),
        ])
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      singleton(S, "profile", "Profile", UserRound),
      singleton(S, "now", "Now", Sparkles),
      S.divider(),
      S.documentTypeListItem("experience").title("Experience"),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("update").title("Changelog"),
      S.documentTypeListItem("skillGroup").title("Skills"),
      S.documentTypeListItem("education").title("Education"),
      S.divider(),
      inbox(S),
    ]);
