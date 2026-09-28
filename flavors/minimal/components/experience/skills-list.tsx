import { TagList } from "@/flavors/minimal/components/ui/tag";

import type { SkillGroup } from "@/lib/data/types";

/** Skill groups as label and tag rows; labels sit above the tags on phones. */
export function SkillsList({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-6 sm:gap-5">
      {groups.map((group) => (
        <div
          key={group.id}
          className="grid gap-2.5 sm:grid-cols-[8rem_1fr] sm:gap-8"
        >
          <dt className="text-sm font-medium text-muted sm:pt-0.5">
            {group.title}
          </dt>
          <dd>
            <TagList tags={group.items} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
