"use client";

import { useId } from "react";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";

import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { type Font, type Prefs, type Texture, type Theme } from "@/lib/prefs";
import { resetPrefs, setPrefs, usePrefs } from "@/lib/prefs-store";
import { cn } from "@/lib/utils";
import { PopoverTitle } from "@/components/ui/popover";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { AccentPicker } from "./accent-picker";
import { ControlRow } from "./control-row";

const themeOptions: SegmentedOption<Theme>[] = [
  {
    value: "system",
    label: (
      <>
        <Monitor aria-hidden />
        Auto
      </>
    ),
  },
  {
    value: "light",
    label: (
      <>
        <Sun aria-hidden />
        Light
      </>
    ),
  },
  {
    value: "dark",
    label: (
      <>
        <Moon aria-hidden />
        Dark
      </>
    ),
  },
];

const fontFaces: Record<Font, { name: string; className: string }> = {
  sans: { name: "Sans", className: "font-sans" },
  serif: { name: "Serif", className: "font-serif" },
  mono: { name: "Mono", className: "font-mono text-[0.82em]" },
};

const fontOptions: SegmentedOption<Font>[] = (
  Object.keys(fontFaces) as Font[]
).map((font) => ({
  value: font,
  ariaLabel: fontFaces[font].name,
  label: (
    <span className="flex flex-col items-center gap-1">
      <span className={cn("text-base leading-none", fontFaces[font].className)}>
        Aa
      </span>
      <span className="text-2xs leading-none">{fontFaces[font].name}</span>
    </span>
  ),
}));

const textureOptions: SegmentedOption<Texture>[] = [
  { value: "none", label: "None" },
  { value: "noise", label: "Noise" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
];

type ToggleKey = "motion" | "smoothScroll" | "cursor" | "sound";

const toggles: { key: ToggleKey; label: string }[] = [
  { key: "motion", label: "Motion" },
  { key: "smoothScroll", label: "Smooth scroll" },
  { key: "cursor", label: "Cursor" },
  { key: "sound", label: "Sound" },
];

export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const id = useId();
  const labelId = (name: string) => `${id}-${name}`;
  const motionNoteId = labelId("motion-note");

  return (
    <div className="grid gap-4 p-4">
      <PopoverTitle className="meta text-foreground">Customize</PopoverTitle>

      <ControlRow label="Theme" labelId={labelId("theme")}>
        <SegmentedControl
          aria-labelledby={labelId("theme")}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme })}
          options={themeOptions}
        />
      </ControlRow>

      <ControlRow
        label="Accent"
        labelId={labelId("accent")}
        value={`${prefs.accentHue}°`}
      >
        <AccentPicker
          labelId={labelId("accent")}
          hue={prefs.accentHue}
          onHueChange={(accentHue) => setPrefs({ accentHue })}
        />
      </ControlRow>

      <ControlRow label="Font" labelId={labelId("font")}>
        <SegmentedControl
          aria-labelledby={labelId("font")}
          value={prefs.font}
          onValueChange={(font) => setPrefs({ font })}
          options={fontOptions}
          itemClassName="h-12"
        />
      </ControlRow>

      <ControlRow
        label="Radius"
        labelId={labelId("radius")}
        value={`${prefs.radius}px`}
      >
        <Slider
          label="Corner radius"
          value={prefs.radius}
          onValueChange={(radius) => setPrefs({ radius })}
          min={0}
          max={16}
          getAriaValueText={(formatted) => `${formatted} pixels`}
        />
      </ControlRow>

      <ControlRow label="Texture" labelId={labelId("texture")}>
        <SegmentedControl
          aria-labelledby={labelId("texture")}
          value={prefs.texture}
          onValueChange={(texture) => setPrefs({ texture })}
          options={textureOptions}
        />
      </ControlRow>

      <div className="-mx-4 border-t border-border" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
        {toggles.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            {label}
            <Switch
              checked={prefs[key]}
              onCheckedChange={(checked) => {
                const patch: Partial<Prefs> = {};
                patch[key] = checked;
                setPrefs(patch);
              }}
              aria-describedby={
                key === "motion" && reducedMotion ? motionNoteId : undefined
              }
            />
          </label>
        ))}
      </div>
      {reducedMotion && (
        <p
          id={motionNoteId}
          className="-mt-1 flex items-center gap-2 text-xs text-muted"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Reduced motion is on in your system
        </p>
      )}

      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-border bg-surface/60 px-4 py-2.5">
        <span className="meta text-subtle">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="flex items-center gap-1.5 rounded-sm meta text-muted transition-colors hover:text-foreground"
        >
          <RotateCcw aria-hidden strokeWidth={2} className="size-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
