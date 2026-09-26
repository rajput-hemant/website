import type { SkillGroup } from "@/lib/data/types";
import { Schedule } from "@/components/ui";

/** A, B, C... the item mark for a row within its group's schedule. */
const mark = (index: number) => String.fromCharCode(65 + (index % 26));

/**
 * Skills as drawing schedules: one table per group, an item mark and the
 * skill, the way a set schedules its door or finish types.
 */
export function SkillsSchedule({ groups }: { groups: SkillGroup[] }) {
  return (
    <div
      data-scene-section
      className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {groups.map((group) => (
        <div key={group.id} data-scene-item={`schedule:${group.id}`}>
          <Schedule
            caption={group.title}
            columns={[
              { key: "mark", label: "Mark", className: "sm:w-14" },
              { key: "item", label: "Item" },
            ]}
            rows={group.items.map((item, index) => ({
              mark: mark(index),
              item,
            }))}
          />
        </div>
      ))}
    </div>
  );
}
