"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/survey/components/ui/segmented-control";
import { Switch } from "@/flavors/survey/components/ui/switch";
import {
  type Prefs,
  type SceneLevel,
  type Theme,
} from "@/flavors/survey/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/survey/lib/prefs-store";
import { RotateCcw } from "lucide-react";

import { playTick } from "@/lib/sound";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

import { ControlRow } from "./control-row";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Day sheet" },
  { value: "dark", label: "Night chart" },
];

const sceneOptions: { value: SceneLevel; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "off", label: "Off" },
];

type SwitchKey = "sound" | "linkPreviews";

const switches: { key: SwitchKey; label: string }[] = [
  { key: "sound", label: "Sound" },
  { key: "linkPreviews", label: "Link previews" },
];

/** Every visitor preference: theme, motion, 3D relief, sound and link previews, plus a reset. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
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
      <p className="spaced text-base leading-none">Customize</p>

      <ControlRow label="Theme" labelId={labelId("theme")}>
        <SegmentedControl
          aria-labelledby={labelId("theme")}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme: theme as Theme })}
          options={themeOptions}
        />
      </ControlRow>

      <ControlRow label="Motion" labelId={labelId("motion")}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-soft">
            {reducedMotion ? (
              <span id={motionNoteId} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-revision"
                />
                Reduced motion is on in your system
              </span>
            ) : (
              "The loupe, contour drawing and camera flights"
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

      <ControlRow label="3D relief" labelId={labelId("scene")}>
        <SegmentedControl
          aria-labelledby={labelId("scene")}
          value={prefs.scene}
          onValueChange={(scene) => setPrefs({ scene: scene as SceneLevel })}
          options={sceneOptions}
        />
      </ControlRow>

      {switches.map(({ key, label }) => (
        <div key={key} className="border-t border-rule pt-3">
          <Switch
            label={label}
            checked={prefs[key]}
            onCheckedChange={(checked: boolean) => setSwitch(key, checked)}
          />
        </div>
      ))}

      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-rule-strong bg-ground px-4">
        <span className="caps text-ink-faint">Kept in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="caps flex min-h-11 items-center gap-1.5 text-ink-soft transition-colors duration-(--duration-press) ease-enter fine:hover:text-water"
        >
          <RotateCcw aria-hidden strokeWidth={1.75} className="size-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
