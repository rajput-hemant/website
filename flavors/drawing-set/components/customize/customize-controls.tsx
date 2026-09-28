"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/drawing-set/components/ui/segmented-control";
import { Switch } from "@/flavors/drawing-set/components/ui/switch";
import {
  type Prefs,
  type SceneLevel,
  type Theme,
} from "@/flavors/drawing-set/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/drawing-set/lib/prefs-store";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";

import { playTick } from "@/lib/sound";
import {
  useFinePointer,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

import { AccentPicker } from "./accent-picker";
import { ControlRow } from "./control-row";

const themeOptions: { value: Theme; label: React.ReactNode }[] = [
  {
    value: "system",
    label: (
      <>
        <Monitor aria-hidden className="size-3.5" />
        Auto
      </>
    ),
  },
  {
    value: "light",
    label: (
      <>
        <Sun aria-hidden className="size-3.5" />
        Light
      </>
    ),
  },
  {
    value: "dark",
    label: (
      <>
        <Moon aria-hidden className="size-3.5" />
        Dark
      </>
    ),
  },
];

const sceneOptions: { value: SceneLevel; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "off", label: "Off" },
];

type SwitchKey = "cursor" | "sound" | "linkPreviews";

const switches: { key: SwitchKey; label: string; fineOnly?: boolean }[] = [
  { key: "cursor", label: "Cursor", fineOnly: true },
  { key: "sound", label: "Sound" },
  { key: "linkPreviews", label: "Link previews" },
];

/**
 * Every visitor preference: theme, accent, motion, 3D scene quality, cursor
 * follower, sound and link previews, plus a reset. Corner radius and layout
 * come from the popover/dialog that hosts this.
 */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const fine = useFinePointer();
  const id = React.useId();
  const labelId = (name: string) => `${id}-${name}`;
  const motionNoteId = labelId("motion-note");

  const setSwitch = (key: SwitchKey, checked: boolean) => {
    const patch: Partial<Prefs> = { [key]: checked };
    setPrefs(patch);
    // This click is the user gesture that unlocks WebAudio.
    if (key === "sound" && checked) playTick("button");
  };

  return (
    <div className="grid gap-4 p-4">
      <p className="font-mono text-mono-xs tracking-[0.14em] text-ink uppercase">
        Customize
      </p>

      <ControlRow label="Theme" labelId={labelId("theme")}>
        <SegmentedControl
          aria-labelledby={labelId("theme")}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme: theme as Theme })}
          options={themeOptions}
        />
      </ControlRow>

      <ControlRow label="Accent" labelId={labelId("accent")}>
        <AccentPicker
          labelId={labelId("accent")}
          hue={prefs.accentHue}
          onHueChange={(accentHue) => setPrefs({ accentHue })}
        />
      </ControlRow>

      <ControlRow label="Motion" labelId={labelId("motion")}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-soft">
            {reducedMotion ? (
              <span id={motionNoteId} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                Reduced motion is on in your system
              </span>
            ) : (
              "Reveals, transitions and camera moves"
            )}
          </span>
          <Switch
            aria-labelledby={labelId("motion")}
            aria-describedby={reducedMotion ? motionNoteId : undefined}
            checked={prefs.motion}
            onCheckedChange={(motion: boolean) => setPrefs({ motion })}
          />
        </div>
      </ControlRow>

      <ControlRow label="3D scene" labelId={labelId("scene")}>
        <SegmentedControl
          aria-labelledby={labelId("scene")}
          value={prefs.scene}
          onValueChange={(scene) => setPrefs({ scene: scene as SceneLevel })}
          options={sceneOptions}
        />
      </ControlRow>

      {switches
        .filter(({ fineOnly }) => !fineOnly || fine)
        .map(({ key, label }) => (
          <div key={key} className="border-t border-line pt-4">
            <Switch
              label={label}
              checked={prefs[key]}
              onCheckedChange={(checked: boolean) => setSwitch(key, checked)}
            />
          </div>
        ))}

      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-line bg-sheet-deep px-4 py-2.5">
        <span className="font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase">
          Saved in this browser
        </span>
        <button
          type="button"
          onClick={resetPrefs}
          className="flex items-center gap-1.5 rounded-sm font-mono text-mono-xs text-ink-soft transition-colors duration-(--duration-press) ease-enter hover:text-ink"
        >
          <RotateCcw aria-hidden strokeWidth={2} className="size-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
