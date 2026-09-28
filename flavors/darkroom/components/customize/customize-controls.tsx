"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/darkroom/components/ui/segmented-control";
import { Switch } from "@/flavors/darkroom/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/darkroom/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/darkroom/lib/prefs-store";
import { voices } from "@/flavors/darkroom/lib/sound/voices";

import { playVoice } from "@/lib/sound";
import {
  useCoarsePointer,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light table" },
  { value: "dark", label: "Safelight" },
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
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 border-t border-line pt-4">
      <span id={id} className="edge">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Every preference, saved in this browser: the light, motion, the 3D tray, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="text-lead leading-none font-bold tracking-[-0.02em]">
        Customize
      </p>
      <Row label="Light" id={`${id}-theme`}>
        <SegmentedControl
          aria-labelledby={`${id}-theme`}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme })}
          options={themeOptions}
        />
      </Row>
      <Row label="3D tray" id={`${id}-scene`}>
        <SegmentedControl
          aria-labelledby={`${id}-scene`}
          value={prefs.scene}
          onValueChange={(scene) => setPrefs({ scene })}
          options={sceneOptions}
        />
      </Row>
      <div className="border-t border-line pt-3">
        <Switch
          label="Motion"
          description={
            reducedMotion
              ? "Reduced motion is on in your system"
              : "Prints developing, ripples, the pencil"
          }
          checked={prefs.motion}
          onCheckedChange={(motion) => setPrefs({ motion })}
        />
        <Switch
          label="Sound"
          description="Timer, tongs and relay"
          checked={prefs.sound}
          onCheckedChange={(sound) => {
            setPrefs({ sound });
            // This click is the gesture that unlocks WebAudio: a preview of the relay.
            if (sound) playVoice(voices.relay);
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
      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-line bg-ground px-4 py-1">
        <span className="edge">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="min-h-11 px-1 edge text-ink! underline decoration-line-strong underline-offset-[0.3em]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
