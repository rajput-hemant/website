"use client";

import * as React from "react";
import { SegmentedControl } from "@/flavors/calibre/components/ui/segmented-control";
import { Switch } from "@/flavors/calibre/components/ui/switch";
import type { SceneLevel, Theme } from "@/flavors/calibre/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/calibre/lib/prefs-store";
import { voices } from "@/flavors/calibre/lib/sound/voices";

import { playVoice } from "@/lib/sound";
import { RefreshSiteButton } from "@/components/semantic/owner/refresh-site-button";
import {
  useCoarsePointer,
  usePrefersReducedMotion,
} from "@/components/semantic/use-media-query";

const themeOptions: { value: Theme; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Dial" },
  { value: "dark", label: "Caseback" },
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
      <span id={id} className="spec">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Every preference, saved in this browser: the side shown, motion, the 3D movement, sound, link previews. */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const id = React.useId();

  return (
    <div className="grid gap-4 p-4">
      <p className="text-lead leading-none font-medium tracking-[-0.02em]">
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
      <Row label="3D movement" id={`${id}-scene`}>
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
              : "The beat, the index and the balance"
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
            if (sound) playVoice(voices.detent);
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
        statusClassName="spec"
        className="min-h-11 px-1 spec text-ink! underline decoration-line-strong underline-offset-[0.3em]"
      />
      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-line bg-ground px-4 py-1">
        <span className="spec">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="min-h-11 px-1 spec text-ink! underline decoration-line-strong underline-offset-[0.3em]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
