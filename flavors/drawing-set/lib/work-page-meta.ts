import { formatMonthYear } from "@/lib/format";

export type WorkMetaItem = { label: string; value: string };

export function workPageMeta(
  experience: readonly { startDate: string }[]
): WorkMetaItem[] {
  const earliest = experience.at(-1);
  return [
    {
      label: "Roles",
      value: `${experience.length} ${experience.length === 1 ? "role" : "roles"}`,
    },
    ...(earliest
      ? [
          {
            label: "Since",
            value: `Since ${formatMonthYear(earliest.startDate)}`,
          },
        ]
      : []),
  ];
}
