"use client";

import { knobStore } from "@/flavors/surface/lib/knob/store";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { cn } from "@/flavors/surface/lib/utils";

import { Levers } from "./toggles";

const PITCH = 36;

/**
 * The lab's toggle bank: one lever per study, up while it is live or in
 * progress and down once archived (real status). Clicking a lever turns the
 * knob to that study. Pointer only: the study list is the accessible way.
 */
export function StudyToggles({
  studies,
  className,
}: {
  studies: readonly { status: string }[];
  className?: string;
}) {
  const count = studies.length;
  const width = Math.max(count * PITCH, 48);

  return (
    <span
      aria-hidden
      className={cn("inline-grid justify-items-center gap-1.5", className)}
    >
      <Levers
        name="lab-studies"
        layout={{ count, axis: "y", pitch: PITCH }}
        positions={studies.map((study) =>
          study.status === "archived" ? -1 : 1
        )}
        width={width}
        height={44}
        data-cursor="Select"
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const offset =
            event.clientX - box.left - (box.width - count * PITCH) / 2;
          const i = Math.floor(offset / PITCH);
          if (i < 0 || i >= count || i === knobStore.getState().index) return;
          knobSounds.detent(i, count);
          knobStore.setState({ index: i, preview: null });
          document.querySelector(`[data-knob-item="${i}"]`)?.scrollIntoView({
            block: "center",
            behavior:
              document.documentElement.dataset.motion === "on"
                ? "smooth"
                : "auto",
          });
        }}
        className="cursor-pointer"
      />
      <span className="flex">
        {studies.map((_, i) => (
          <span
            key={i}
            className="legend text-center text-[0.5625rem]"
            style={{ width: PITCH }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
        ))}
      </span>
    </span>
  );
}
