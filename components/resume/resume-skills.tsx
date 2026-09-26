import type { SkillGroup } from "@/lib/data/types";

/** Skill groups as label and list rows; from tablet width on screen, a two-column list. */
export function ResumeSkills({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-y-2 text-[0.9375rem] md:columns-2 md:gap-x-8 print:columns-2 print:gap-y-2">
      {groups.map((group) => (
        <div
          key={group.id}
          className="grid gap-x-6 sm:grid-cols-[6.5rem_1fr] md:block md:break-inside-avoid md:border-t md:border-hairline md:py-3 print:grid print:grid-cols-[6.5rem_1fr] print:border-0 print:py-0"
        >
          <dt className="font-semibold text-paper md:text-sm">{group.title}</dt>
          <dd className="mb-2 text-graphite sm:mb-0 md:mt-1 print:mt-0">
            {group.items.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
