"use client";

import * as React from "react";
import { accentPresets, type AccentPreset } from "@/flavors/minimal/lib/prefs";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

const presetNames = Object.keys(accentPresets) as AccentPreset[];

/** The accent at `hue`, with the same hue-compensated lightness as `--color-accent` in globals.css. */
const accentAt = (hue: number) =>
  `oklch(calc(var(--accent-l) + var(--accent-l-swing) * cos(${hue - 15}deg)) var(--accent-c) ${hue})`;

const capitalize = (word: string) => word[0]?.toUpperCase() + word.slice(1);

/** Six accent swatches as one radio group. A stored custom hue simply shows none checked. */
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
    <RadioGroup
      aria-labelledby={labelId}
      value={preset ?? ""}
      onValueChange={(name: string) => {
        const next = accentPresets[name as AccentPreset];
        if (next !== undefined) onHueChange(next);
      }}
      className="flex items-center justify-between"
    >
      {presetNames.map((name) => (
        <Radio.Root
          key={name}
          value={name}
          aria-label={capitalize(name)}
          title={capitalize(name)}
          style={
            {
              "--swatch": accentAt(accentPresets[name]),
            } as React.CSSProperties
          }
          className="size-6 rounded-full bg-(--swatch) shadow-[inset_0_0_0_1px_oklch(0_0_0/0.12)] transition-[box-shadow,scale] duration-(--duration-press) ease-enter focus-visible:outline-offset-2 data-checked:shadow-[0_0_0_2px_var(--color-background),0_0_0_3.5px_var(--swatch)]"
        />
      ))}
    </RadioGroup>
  );
}
