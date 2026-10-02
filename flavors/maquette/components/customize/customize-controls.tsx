"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/maquette/components/ui/segmented-control";
import { Switch } from "@/flavors/maquette/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/maquette/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/maquette/lib/prefs-store";
import { voices } from "@/flavors/maquette/lib/sound/voices";

import { playVoice } from "@/lib/sound";
import { RefreshSiteButton } from "@/components/semantic/owner/refresh-site-button";
import {
  useCoarsePointer,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Day" },
  { value: "dark", label: "Night" },
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
      <span id={id} className="caps">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Every preference, saved in this browser: the light, motion, the 3D model, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="font-display text-lead leading-none font-normal tracking-[-0.01em]">
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
      <Row label="3D model" id={`${id}-scene`}>
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
              : "Shadows easing, pieces lifting"
          }
          checked={prefs.motion}
          onCheckedChange={(motion) => setPrefs({ motion })}
        />
        <Switch
          label="Sound"
          description="Card, knife, dowels and the lamp"
          checked={prefs.sound}
          onCheckedChange={(sound) => {
            setPrefs({ sound });
            // This click is the gesture that unlocks WebAudio: a preview of the lamp.
            if (sound) playVoice(voices.lamp);
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
      <RefreshSiteButton
        containerClassName="flex items-center justify-between gap-3 border-t border-line pt-3"
        statusClassName="caps"
        className="min-h-11 px-1 caps text-ink! underline decoration-line-strong underline-offset-[0.3em]"
      />
      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-line bg-ground px-4 py-1">
        <span className="caps">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="min-h-11 px-1 caps text-ink! underline decoration-line-strong underline-offset-[0.3em]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
