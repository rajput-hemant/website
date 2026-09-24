'use client';

import { useId, useRef } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Slider } from '@base-ui/react/slider';
import { Switch } from '@base-ui/react/switch';
import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  MAX_HUE,
  MAX_RADIUS,
  resetPrefs,
  setPref,
  usePrefs,
  useReducedMotion,
  type Font,
  type Prefs,
  type Texture,
} from '~/lib/prefs';

declare module 'react' {
  interface CSSProperties {
    '--accent-hue'?: number;
  }
}

const ACCENTS = [
  { name: 'Teal', hue: 190 },
  { name: 'Blue', hue: 250 },
  { name: 'Violet', hue: 295 },
  { name: 'Rose', hue: 355 },
  { name: 'Amber', hue: 70 },
  { name: 'Green', hue: 150 },
] as const;

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const FONT_OPTIONS: readonly { value: Font; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
];

const TEXTURE_OPTIONS: readonly { value: Texture; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'noise', label: 'Noise' },
  { value: 'grid', label: 'Grid' },
  { value: 'dots', label: 'Dots' },
];

const SWITCHES: readonly {
  key: 'motion' | 'smoothScroll' | 'cursor' | 'sound';
  label: string;
}[] = [
  { key: 'motion', label: 'Motion' },
  { key: 'smoothScroll', label: 'Smooth scroll' },
  { key: 'cursor', label: 'Cursor' },
  { key: 'sound', label: 'Sound' },
];

const segmentClass =
  'text-fg-muted hover:text-fg data-checked:bg-fg/8 data-checked:text-fg min-w-0 flex-1 cursor-pointer rounded-[max(0px,calc(var(--radius)-3px))] px-1.5 py-0.5 text-center text-xs transition-colors select-none';

function Segmented<V extends string>({
  label,
  value,
  options,
  onChange,
  fontPreview,
}: {
  label: string;
  value: V;
  options: readonly { value: V; label: string }[];
  onChange: (value: V) => void;
  fontPreview?: boolean;
}) {
  const id = useId();

  return (
    <>
      <span id={id}>{label}</span>
      <RadioGroup
        aria-labelledby={id}
        value={value}
        onValueChange={onChange}
        className="border-rule flex rounded-sm border p-0.5"
      >
        {options.map((option) => (
          <Radio.Root
            key={option.value}
            value={option.value}
            className={segmentClass}
            style={
              fontPreview
                ? { fontFamily: `var(--font-${option.value})` }
                : undefined
            }
          >
            {option.label}
          </Radio.Root>
        ))}
      </RadioGroup>
    </>
  );
}

function Range({
  label,
  value,
  max,
  unit,
  onChange,
  hueTrack,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  hueTrack?: boolean;
}) {
  return (
    <Slider.Root
      value={value}
      max={max}
      onValueChange={onChange}
      className="col-span-2 grid grid-cols-subgrid items-center"
    >
      <Slider.Label>{label}</Slider.Label>
      <div className="flex items-center gap-3">
        <Slider.Control className="flex flex-1 touch-none items-center py-2 select-none">
          <Slider.Track
            data-accent-scope={hueTrack ? '' : undefined}
            className={`h-1 w-full rounded-full ${hueTrack ? 'hue-track' : 'bg-rule'}`}
          >
            <Slider.Thumb
              getAriaValueText={(formatted) => `${formatted}${unit}`}
              className="bg-bg border-fg size-3.5 rounded-full border shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--accent)"
            />
          </Slider.Track>
        </Slider.Control>
        <span
          aria-hidden
          className="text-fg-muted w-9 text-right text-xs tabular-nums"
        >
          {value}
          {unit}
        </span>
      </div>
    </Slider.Root>
  );
}

function PrefSwitch({
  label,
  checked,
  onChange,
  note,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  note?: string | undefined;
}) {
  const noteId = useId();

  return (
    <li>
      <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
        {label}
        <Switch.Root
          checked={checked}
          onCheckedChange={onChange}
          aria-describedby={note ? noteId : undefined}
          className="bg-rule data-checked:bg-accent flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors"
        >
          <Switch.Thumb className="bg-bg size-3.5 rounded-full shadow-sm transition-transform data-checked:translate-x-3.5" />
        </Switch.Root>
      </label>
      {note ? (
        <p id={noteId} className="text-fg-muted text-xs">
          {note}
        </p>
      ) : null}
    </li>
  );
}

export function Customize() {
  const prefs = usePrefs();
  const reducedMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();
  const accentId = useId();
  const popupRef = useRef<HTMLDivElement>(null);
  const preset = ACCENTS.find((accent) => accent.hue === prefs.hue);

  const set =
    <K extends keyof Prefs>(key: K) =>
    (value: Prefs[K]) => {
      setPref(key, value);
    };

  return (
    <Popover.Root>
      <Popover.Trigger className="quiet-link inline-flex size-6 cursor-pointer items-center justify-center rounded-sm">
        <SlidersHorizontal size={16} aria-hidden />
        <span className="sr-only">Customize</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={12}
          collisionPadding={16}
        >
          <Popover.Popup
            ref={popupRef}
            initialFocus={popupRef}
            className="bg-bg border-rule shadow-fg/5 w-[min(21rem,calc(100vw-2rem))] rounded-sm border p-5 font-sans text-sm [font-stretch:normal] shadow-xl outline-none"
          >
            <div className="flex items-baseline justify-between">
              <Popover.Title className="text-sm font-semibold tracking-normal">
                Customize
              </Popover.Title>
              <button
                type="button"
                onClick={resetPrefs}
                className="quiet-link cursor-pointer text-xs"
              >
                Reset
              </button>
            </div>

            <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-6 gap-y-3">
              <Segmented
                label="Theme"
                value={theme === 'dark' ? 'dark' : 'light'}
                options={THEMES}
                onChange={setTheme}
              />

              <span id={accentId}>Accent</span>
              <RadioGroup
                aria-labelledby={accentId}
                value={preset?.name ?? ''}
                onValueChange={(name) => {
                  const accent = ACCENTS.find((a) => a.name === name);
                  if (accent) setPref('hue', accent.hue);
                }}
                className="flex justify-between py-1"
              >
                {ACCENTS.map((accent) => (
                  <Radio.Root
                    key={accent.name}
                    value={accent.name}
                    aria-label={accent.name}
                    data-accent-scope
                    style={{ '--accent-hue': accent.hue }}
                    className="bg-accent data-checked:outline-accent size-5 cursor-pointer rounded-full outline-offset-2 data-checked:outline-1"
                  />
                ))}
              </RadioGroup>

              <Range
                label="Hue"
                value={prefs.hue}
                max={MAX_HUE}
                unit="°"
                onChange={set('hue')}
                hueTrack
              />

              <Segmented
                label="Font"
                value={prefs.font}
                options={FONT_OPTIONS}
                onChange={set('font')}
                fontPreview
              />

              <Range
                label="Radius"
                value={prefs.radius}
                max={MAX_RADIUS}
                unit="px"
                onChange={set('radius')}
              />

              <Segmented
                label="Texture"
                value={prefs.texture}
                options={TEXTURE_OPTIONS}
                onChange={set('texture')}
              />
            </div>

            <ul className="border-rule mt-5 border-t pt-4">
              {SWITCHES.map(({ key, label }) => (
                <PrefSwitch
                  key={key}
                  label={label}
                  checked={prefs[key]}
                  onChange={set(key)}
                  note={
                    key === 'motion' && reducedMotion
                      ? 'Reduced motion is on in your system'
                      : undefined
                  }
                />
              ))}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
