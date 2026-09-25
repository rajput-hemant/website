import { type SkillGroup } from "@/lib/data/types";

export function ResumeSkills({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-[0.9375rem] sm:grid-cols-[6.5rem_1fr] print:grid-cols-[6.5rem_1fr]">
      {groups.map((group) => (
        <div key={group.id} className="contents">
          <dt className="font-semibold text-foreground">{group.title}</dt>
          <dd className="mb-2 text-muted sm:mb-0 print:mb-0">
            {group.items.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
