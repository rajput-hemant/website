"use client";

import * as React from "react";
import { setPrefs } from "@/flavors/surface/lib/prefs-store";
import { cn } from "@/flavors/surface/lib/utils";

import { playTick } from "@/lib/sound";
import { useRootData } from "@/components/semantic/use-root-data";

type PlateSwitchProps = {
  legend: string;
  off: string;
  on: string;
  /** The accessible name; it should describe the "on" state. */
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Hide the side legends below this breakpoint (the header on narrow screens). */
  compact?: boolean;
  className?: string;
};

/** A slide switch engraved with its legend above and both positions beside it. */
export function PlateSwitch({
  legend,
  off,
  on,
  label,
  checked,
  onChange,
  compact,
  className,
}: PlateSwitchProps) {
  return (
    <div className={cn("grid justify-items-center gap-1.5", className)}>
      <span aria-hidden className="legend text-[0.59375rem]">
        {legend}
      </span>
      <div className="flex items-center gap-[7px]">
        <span
          aria-hidden
          className={cn(
            "legend text-[0.59375rem]",
            compact && "hidden xl:inline"
          )}
        >
          {off}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => {
            if (document.documentElement.dataset.sound === "on") {
              playTick("button");
            }
            onChange(!checked);
          }}
          className="slide"
        >
          <span />
        </button>
        <span
          aria-hidden
          className={cn(
            "legend text-[0.59375rem]",
            compact && "hidden xl:inline"
          )}
        >
          {on}
        </span>
      </div>
    </div>
  );
}

export function EditionSwitch({ compact }: { compact?: boolean }) {
  const black = useRootData("theme", "light") === "dark";
  return (
    <PlateSwitch
      legend="Edition"
      off="Grey"
      on="Black"
      label="Black edition (dark theme)"
      checked={black}
      onChange={(next) => setPrefs({ theme: next ? "dark" : "light" })}
      compact={compact}
    />
  );
}

export function MotionSwitch({ compact }: { compact?: boolean }) {
  const on = useRootData("motion", "on") === "on";
  return (
    <PlateSwitch
      legend="Motion"
      off="Off"
      on="On"
      label="Motion"
      checked={on}
      onChange={(next) => setPrefs({ motion: next })}
      compact={compact}
    />
  );
}

export function SceneSwitch() {
  const on = useRootData("scene", "auto") !== "off";
  return (
    <PlateSwitch
      legend="3D knob"
      off="Off"
      on="On"
      label="3D knob"
      checked={on}
      onChange={(next) => setPrefs({ scene: next ? "auto" : "off" })}
    />
  );
}

export function SoundSwitch() {
  const on = useRootData("sound", "off") === "on";
  return (
    <PlateSwitch
      legend="Clicks"
      off="Off"
      on="On"
      label="Detent clicks"
      checked={on}
      onChange={(next) => setPrefs({ sound: next })}
    />
  );
}
