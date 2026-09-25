import type { SkillGroup } from "@/lib/data/types";
import { TagList } from "@/components/ui/tag";

/** Skill groups as label and tag rows; labels sit above the tags on phones. */
export function SkillsList({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-6 sm:gap-5">
      {groups.map((group) => (
        <div
          key={group.id}
          className="grid gap-2.5 sm:grid-cols-[8rem_1fr] sm:gap-8"
        >
          <dt className="meta text-subtle sm:pt-1">{group.title}</dt>
          <dd>
            <TagList tags={group.items} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
