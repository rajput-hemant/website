"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/press/components/ui/segmented-control";
import { Switch } from "@/flavors/press/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/press/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/press/lib/prefs-store";

import { playTick } from "@/lib/sound";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Paper" },
  { value: "dark", label: "Plate" },
];

const sceneOptions: { value: SceneLevel; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "off", label: "Off" },
];

function Row({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 border-t border-rule pt-4">
      <span id={id} className="slug">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Every preference, saved in this browser: theme, motion, the 3D press, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="text-lead leading-none font-black tracking-[-0.02em]">
        Customize
      </p>
      <Row label="Proof" id={`${id}-theme`}>
        <SegmentedControl
          aria-labelledby={`${id}-theme`}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme: theme as Theme })}
          options={themeOptions}
        />
      </Row>
      <Row label="3D press" id={`${id}-scene`}>
        <SegmentedControl
          aria-labelledby={`${id}-scene`}
          value={prefs.scene}
          onValueChange={(scene) => setPrefs({ scene: scene as SceneLevel })}
          options={sceneOptions}
        />
      </Row>
      <div className="border-t border-rule pt-3">
        <Switch
          label="Motion"
          description={
            reducedMotion
              ? "Reduced motion is on in your system"
              : "Registration snaps, sheet feed, the press"
          }
          checked={prefs.motion}
          onCheckedChange={(motion) => setPrefs({ motion })}
        />
        <Switch
          label="Sound"
          checked={prefs.sound}
          onCheckedChange={(sound) => {
            setPrefs({ sound });
            // This click is the gesture that unlocks WebAudio.
            if (sound) playTick("button");
          }}
        />
        <Switch
          label="Link previews"
          checked={prefs.linkPreviews}
          onCheckedChange={(linkPreviews) => setPrefs({ linkPreviews })}
        />
      </div>
      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-rule bg-paper px-4 py-1">
        <span className="slug">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="min-h-11 px-1 slug text-ink! underline decoration-rule underline-offset-[0.3em]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
