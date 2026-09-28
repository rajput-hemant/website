"use client";

import * as React from "react";
import { setPrefs } from "@/flavors/surface/lib/prefs-store";
import { VOICES, type VoiceName } from "@/flavors/surface/lib/sound/voices";
import { cn } from "@/flavors/surface/lib/utils";

import { playVoice } from "@/lib/sound";
import { useCoarsePointer } from "@/components/semantic/use-media-query";
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
  compact?: boolean | undefined;
  /** What ClickSound plays for it (named, so it also plays on touch). */
  voice?: VoiceName | "none";
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
  voice = "slide",
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
          data-voice={voice}
          onClick={() => onChange(!checked)}
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
      voice="latch"
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
      legend="Sound"
      off="Off"
      on="On"
      label="Sound"
      voice="none"
      checked={on}
      onChange={(next) => {
        // This click is the user gesture that unlocks WebAudio; the preview
        // plays before sound is on, so it skips the preference check.
        if (next) playVoice(VOICES.slide);
        setPrefs({ sound: next });
      }}
    />
  );
}

/** Touch feedback; only fingers feel it, so only coarse pointers see it. */
export function HapticsSwitch() {
  const on = useRootData("haptics", "on") === "on";
  const coarse = useCoarsePointer();
  if (!coarse) return null;
  return (
    <PlateSwitch
      legend="Haptics"
      off="Off"
      on="On"
      label="Haptics"
      checked={on}
      onChange={(next) => setPrefs({ haptics: next })}
    />
  );
}
