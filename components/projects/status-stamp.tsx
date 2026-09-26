import type { ProjectStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Stamp } from "@/components/ui";

const STAMPS: Record<
  ProjectStatus,
  { word: string; meaning: string; tone: "accent" | "ink" }
> = {
  active: { word: "Issued", meaning: "Active", tone: "ink" },
  maintained: { word: "As built", meaning: "Maintained", tone: "ink" },
  wip: { word: "In progress", meaning: "Being built", tone: "accent" },
  archived: { word: "Superseded", meaning: "Archived", tone: "ink" },
};

const ORDER: ProjectStatus[] = ["active", "maintained", "wip", "archived"];

export function stampWord(status: ProjectStatus) {
  return STAMPS[status].word;
}

export function StatusStamp({ status }: { status: ProjectStatus }) {
  const { word, meaning, tone } = STAMPS[status];
  return (
    <Stamp
      meaning={meaning}
      tone={tone}
      className={cn(status === "archived" && "opacity-65")}
    >
      {word}
    </Stamp>
  );
}

/** The key above the register: each stamp word with its plain meaning. */
export function StampLegend({ className }: { className?: string }) {
  return (
    <dl
      aria-label="Status stamps"
      className={cn(
        "flex flex-wrap gap-x-7 gap-y-2 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase",
        className
      )}
    >
      {ORDER.map((status) => (
        <div key={status} className="flex gap-2">
          <dt className="font-semibold text-ink-soft">{STAMPS[status].word}</dt>
          <dd>{STAMPS[status].meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
