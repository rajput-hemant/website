import type { SkillGroup } from "@/lib/data/types";

/**
 * "Type case": one compartment per skill group, a mono label over a stack of
 * hairline-divided slots. Groups sit in a responsive grid so the whole case
 * reads as drawers, not a tag cloud.
 */
export function SkillsCase({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.id} className="border border-hairline">
          <h3 className="border-b border-hairline px-3 py-2 font-mono text-mono-xs tracking-[0.14em] text-pencil uppercase">
            {group.title}
          </h3>
          <ul className="divide-y divide-hairline">
            {group.items.map((item) => (
              <li key={item} className="px-3 py-2 text-sm text-graphite">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
