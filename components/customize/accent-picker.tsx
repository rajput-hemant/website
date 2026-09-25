"use client";

import { type CSSProperties } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { accentPresets, type AccentPreset } from "@/lib/prefs";
import { Slider } from "@/components/ui/slider";

const presetNames = Object.keys(accentPresets) as AccentPreset[];

const hueTrack = `linear-gradient(to right, ${Array.from(
  { length: 13 },
  (_, index) => `oklch(var(--accent-lc) ${index * 30})`
).join(", ")})`;

const capitalize = (word: string) => word[0]?.toUpperCase() + word.slice(1);

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
    <>
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
                "--swatch": `oklch(var(--accent-lc) ${accentPresets[name]})`,
              } as CSSProperties
            }
            className="size-6 rounded-full bg-(--swatch) shadow-[inset_0_0_0_1px_oklch(0_0_0/0.12)] transition-[box-shadow,scale] duration-200 ease-snappy hover:scale-110 focus-visible:outline-offset-2 data-checked:shadow-[0_0_0_2px_var(--color-background),0_0_0_3.5px_var(--swatch)]"
          />
        ))}
      </RadioGroup>
      <Slider
        label="Accent hue"
        value={hue}
        onValueChange={onHueChange}
        min={0}
        max={360}
        indicator={false}
        getAriaValueText={(formatted) => `${formatted} degrees`}
        trackStyle={{ backgroundImage: hueTrack }}
        trackClassName="h-2 shadow-none"
        thumbClassName="bg-accent"
      />
    </>
  );
}
