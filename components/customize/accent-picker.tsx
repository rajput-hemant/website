"use client";

import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { accentPresets, type AccentPreset } from "@/lib/prefs";
import { Slider } from "@/components/ui/slider";

const presetNames = Object.keys(accentPresets) as AccentPreset[];

/** The accent at `hue`, matching `--color-accent`'s construction in globals.css. */
const accentAt = (hue: number) =>
  `light-dark(oklch(0.52 0.12 ${hue}), oklch(0.8 0.11 ${hue}))`;

const capitalize = (word: string) => word[0]?.toUpperCase() + word.slice(1);

/**
 * Six named presets as swatches, plus a hue slider for anything in between.
 * The slider always reflects the live hue, so dragging it previews instantly
 * and picking a preset snaps the slider to its hue.
 */
export function AccentPicker({
  hue,
  onHueChange,
  labelId,
}: {
  hue: number;
  onHueChange: (hue: number) => void;
  labelId: string;
}) {
  const preset = presetNames.find((name) => accentPresets[name] === hue);

  return (
    <div className="grid gap-3">
      <RadioGroup
        aria-labelledby={labelId}
        value={preset ?? ""}
        onValueChange={(name: string) => {
          const next = accentPresets[name as AccentPreset];
          if (next !== undefined) onHueChange(next);
        }}
        className="flex items-start justify-between gap-1"
      >
        {presetNames.map((name) => (
          <label
            key={name}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <Radio.Root
              value={name}
              aria-label={capitalize(name)}
              style={
                {
                  "--swatch": accentAt(accentPresets[name]),
                } as React.CSSProperties
              }
              className="size-5 rounded-sm bg-(--swatch) shadow-[inset_0_0_0_1px_oklch(0_0_0/0.14)] data-[checked]:scale-110 data-[checked]:shadow-[0_0_0_2px_var(--color-sheet),0_0_0_3.5px_var(--swatch)] motion:transition-[box-shadow,scale] motion:duration-(--duration-press) motion:ease-enter fine:hover:scale-110"
            />
            <span className="font-mono text-mono-xs text-ink-faint">
              {capitalize(name)}
            </span>
          </label>
        ))}
      </RadioGroup>
      <Slider
        label="Accent hue"
        value={hue}
        onValueChange={(next: number) => onHueChange(Math.round(next))}
        min={0}
        max={359}
        step={1}
      />
    </div>
  );
}
