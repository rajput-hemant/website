"use client";

import * as React from "react";
import { Disclosure } from "@/flavors/minimal/components/ui/disclosure";
import { PopoverTitle } from "@/flavors/minimal/components/ui/popover";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/flavors/minimal/components/ui/segmented-control";
import { Switch } from "@/flavors/minimal/components/ui/switch";
import { usePrefersReducedMotion } from "@/flavors/minimal/lib/hooks/use-media-query";
import {
  centerOf,
  revealTheme,
  type Point,
} from "@/flavors/minimal/lib/interaction/theme-reveal";
import { type Font, type Prefs, type Theme } from "@/flavors/minimal/lib/prefs";
import {
  resetPrefs,
  setPrefs,
  usePrefs,
} from "@/flavors/minimal/lib/prefs-store";
import { playTick } from "@/flavors/minimal/lib/sound";
import { cn } from "@/flavors/minimal/lib/utils";
import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";

import { AccentPicker } from "./accent-picker";
import { ControlRow } from "./control-row";
import { TexturePicker } from "./texture-picker";

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

const readingFonts: { value: Font; name: string; className: string }[] = [
  { value: "sans", name: "Sans", className: "font-sans" },
  { value: "serif", name: "Serif", className: "font-serif" },
  { value: "mono", name: "Mono", className: "font-mono" },
];

const fontOptions: SegmentedOption<Font>[] = readingFonts.map((font) => ({
  value: font.value,
  ariaLabel: font.name,
  label: (
    <>
      <span className={cn("text-sm leading-none", font.className)}>Aa</span>
      {font.name}
    </>
  ),
}));

type EffectKey = "linkPreviews" | "cursor" | "smoothScroll" | "sound";

const effects: { key: EffectKey; label: string }[] = [
  { key: "linkPreviews", label: "Link previews" },
  { key: "cursor", label: "Cursor follower" },
  { key: "smoothScroll", label: "Smooth scroll" },
  { key: "sound", label: "Sound" },
];

/** How recent a pointer press must be to count as the origin of a change. */
const POINTER_ORIGIN_MS = 1000;

function effectsSummary(prefs: Prefs): string {
  const on =
    effects.filter(({ key }) => prefs[key]).length +
    (prefs.texture === "none" ? 0 : 1);
  return on === 0 ? "All off" : `${on} on`;
}

/**
 * Five controls: theme, accent, reading font, motion, and an Effects
 * disclosure for the optional extras (link previews, cursor follower, smooth
 * scroll, sound, texture). Corner radius is a fixed design token.
 */
export function CustomizeControls() {
  const prefs = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const id = React.useId();
  const labelId = (name: string) => `${id}-${name}`;
  const motionNoteId = labelId("motion-note");
  const themePress = React.useRef<{ at: number; point: Point } | null>(null);

  const rememberPress = (event: React.PointerEvent) => {
    themePress.current = {
      at: event.timeStamp,
      point: { x: event.clientX, y: event.clientY },
    };
  };

  const changeTheme = (theme: Theme) => {
    const press = themePress.current;
    themePress.current = null;
    const fromPointer =
      press !== null && performance.now() - press.at < POINTER_ORIGIN_MS;
    const focused = document.activeElement;
    const origin = fromPointer
      ? press.point
      : focused
        ? centerOf(focused)
        : { x: window.innerWidth / 2, y: 0 };
    revealTheme(theme, origin);
  };

  const setEffect = (key: EffectKey, checked: boolean) => {
    const patch: Partial<Prefs> = {};
    patch[key] = checked;
    setPrefs(patch);
    // This click is the user gesture that unlocks WebAudio.
    if (key === "sound" && checked) playTick("button");
  };

  return (
    <div className="grid gap-4 p-4">
      <PopoverTitle className="meta text-foreground">Customize</PopoverTitle>

      <ControlRow label="Theme" labelId={labelId("theme")}>
        <div onPointerDown={rememberPress}>
          <SegmentedControl
            aria-labelledby={labelId("theme")}
            value={prefs.theme}
            onValueChange={changeTheme}
            options={themeOptions}
          />
        </div>
      </ControlRow>

      <ControlRow label="Accent" labelId={labelId("accent")}>
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
        />
      </ControlRow>

      <ControlRow label="Motion" labelId={labelId("motion")}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {reducedMotion ? (
              <span id={motionNoteId} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                Reduced motion is on in your system
              </span>
            ) : (
              "Transitions and entrances"
            )}
          </span>
          <Switch
            aria-labelledby={labelId("motion")}
            aria-describedby={reducedMotion ? motionNoteId : undefined}
            checked={prefs.motion}
            onCheckedChange={(motion) => setPrefs({ motion })}
          />
        </div>
      </ControlRow>

      <Disclosure
        summary={
          <span className="flex items-baseline justify-between gap-3">
            <span className="meta text-subtle">Effects</span>
            <span className="font-mono text-2xs text-muted tabular-nums">
              {effectsSummary(prefs)}
            </span>
          </span>
        }
        className="-mx-4 border-t border-hairline px-4 pt-3"
        summaryClassName="items-center rounded-sm"
        contentClassName="grid gap-3 pt-3"
      >
        {effects.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 text-sm font-medium"
          >
            {label}
            <Switch
              checked={prefs[key]}
              onCheckedChange={(checked) => setEffect(key, checked)}
            />
          </label>
        ))}
        <div className="grid gap-2 pt-1">
          <span id={labelId("texture")} className="text-sm font-medium">
            Texture
          </span>
          <TexturePicker
            labelId={labelId("texture")}
            value={prefs.texture}
            onValueChange={(texture) => setPrefs({ texture })}
          />
        </div>
        <p className="text-xs text-muted">
          The cursor follower, smooth scroll and the texture&rsquo;s pointer
          effects need a mouse or trackpad and motion on.
        </p>
      </Disclosure>

      <div className="-mx-4 -mb-4 flex items-center justify-between border-t border-hairline bg-surface/60 px-4 py-2.5">
        <span className="meta text-subtle">Saved in this browser</span>
        <button
          type="button"
          onClick={resetPrefs}
          className="flex items-center gap-1.5 rounded-sm meta text-muted transition-[color,scale] duration-(--duration-press) ease-enter hover:text-foreground"
        >
          <RotateCcw aria-hidden strokeWidth={2} className="size-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
