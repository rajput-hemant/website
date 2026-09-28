"use client";

import { voiceFor, voiceForToggle } from "@/flavors/minimal/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";

/** Click and disclosure sounds for the "paper and nib" palette. */
export function SoundLayer() {
  return <ClickSound voiceFor={voiceFor} onToggle={voiceForToggle} />;
}
