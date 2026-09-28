"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/mission/components/ui/segmented-control";
import { Switch } from "@/flavors/mission/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/mission/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/mission/lib/prefs-store";
import { voices } from "@/flavors/mission/lib/sound/voices";

import { playVoice } from "@/lib/sound";
import {
  useCoarsePointer,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

const themeOptions: readonly { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Paper" },
  { value: "dark", label: "Orbit" },
];

const sceneOptions: readonly { value: SceneLevel; label: string }[] = [
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
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 border-t border-rule pt-4">
      <span id={id} className="label">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Every preference, saved in this browser: the theme, motion, the 3D globe, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="font-display text-h3 leading-none">Customize</p>
      <Row label="Theme" id={`${id}-theme`}>
        <SegmentedControl
          aria-labelledby={`${id}-theme`}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme })}
          options={themeOptions}
        />
      </Row>
      <Row label="3D globe" id={`${id}-scene`}>
        <SegmentedControl
          aria-labelledby={`${id}-scene`}
          value={prefs.scene}
          onValueChange={(scene) => setPrefs({ scene })}
          options={sceneOptions}
        />
      </Row>
      <div className="border-t border-rule pt-3">
        <Switch
          label="Motion"
          description={
            reducedMotion
              ? "Reduced motion is on in your system"
              : "The globe's settle, the patches, page changes"
          }
          checked={prefs.motion}
          onCheckedChange={(motion) => setPrefs({ motion })}
        />
        <Switch
          label="Sound"
          description="Console keys and the capcom tone"
          checked={prefs.sound}
          onCheckedChange={(sound) => {
            setPrefs({ sound });
            // This click is the gesture that unlocks WebAudio.
            if (sound) playVoice(voices.toggleUp);
          }}
        />
        {coarse && (
          <Switch
            label="Haptics"
            checked={prefs.haptics}
            onCheckedChange={(haptics) => setPrefs({ haptics })}
          />
        )}
        <Switch
          label="Link previews"
          checked={prefs.linkPreviews}
          onCheckedChange={(linkPreviews) => setPrefs({ linkPreviews })}
        />
      </div>
      <div className="-mx-4 -mb-4 flex items-center justify-between rounded-none border-t border-rule bg-sunk px-4 py-1">
        <span className="label">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="rule-link min-h-11 px-1 label text-ink!"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
