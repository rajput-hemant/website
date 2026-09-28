"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/jacquard/components/ui/segmented-control";
import { Switch } from "@/flavors/jacquard/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/jacquard/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/jacquard/lib/prefs-store";
import { voices } from "@/flavors/jacquard/lib/sound/voices";

import { playVoice } from "@/lib/sound";
import { usePrefersReducedMotion } from "@/components/semantic/use-media-query";

const themeOptions: readonly { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Day" },
  { value: "dark", label: "Night" },
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

/** Every preference, saved in this browser: the loom, motion, the 3D cloth, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="font-display text-h3 leading-none">Customize</p>
      <Row label="Loom" id={`${id}-theme`}>
        <SegmentedControl
          aria-labelledby={`${id}-theme`}
          value={prefs.theme}
          onValueChange={(theme) => setPrefs({ theme })}
          options={themeOptions}
        />
      </Row>
      <Row label="3D cloth" id={`${id}-scene`}>
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
              : "The weave-in, the shuttle, the cloth"
          }
          checked={prefs.motion}
          onCheckedChange={(motion) => setPrefs({ motion })}
        />
        <Switch
          label="Sound"
          description="Shuttle, heddle and beater, off by default"
          checked={prefs.sound}
          onCheckedChange={(sound) => {
            setPrefs({ sound });
            // This click is the gesture that unlocks WebAudio.
            if (sound) playVoice(voices.bobbinUp);
          }}
        />
        <Switch
          label="Link previews"
          checked={prefs.linkPreviews}
          onCheckedChange={(linkPreviews) => setPrefs({ linkPreviews })}
        />
      </div>
      <div className="-mx-4 -mb-4 flex items-center justify-between rounded-b-[4px] border-t border-rule bg-sunk px-4 py-1">
        <span className="label">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="thread-link min-h-11 px-1 label text-ink!"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
