import { useCallback, useSyncExternalStore } from 'react';

export const FONTS = ['sans', 'serif', 'mono'] as const;
export const TEXTURES = ['none', 'noise', 'grid', 'dots'] as const;
export const MAX_HUE = 360;
export const MAX_RADIUS = 16;

export type Font = (typeof FONTS)[number];
export type Texture = (typeof TEXTURES)[number];

export type Prefs = {
  hue: number;
  font: Font;
  radius: number;
  texture: Texture;
  motion: boolean;
  smoothScroll: boolean;
  cursor: boolean;
  sound: boolean;
};

export const DEFAULT_PREFS: Readonly<Prefs> = {
  hue: 190,
  font: 'sans',
  radius: 4,
  texture: 'none',
  motion: true,
  smoothScroll: true,
  cursor: true,
  sound: false,
};

const SPEC = {
  defaults: DEFAULT_PREFS,
  fonts: FONTS,
  textures: TEXTURES,
  maxHue: MAX_HUE,
  maxRadius: MAX_RADIUS,
};

const STORAGE_KEY = 'prefs:v1';

// `resolvePrefs` and `applyPrefs` are serialised into the pre-hydration script,
// so they must stay self-contained: no references outside their own bodies.
function resolvePrefs(raw: string | null, spec: typeof SPEC): Prefs {
  const stored: Record<string, unknown> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') Object.assign(stored, parsed);
  } catch {}

  const d = spec.defaults;
  const range = (value: unknown, max: number, fallback: number) =>
    typeof value === 'number' && value >= 0 && value <= max
      ? Math.round(value)
      : fallback;
  const flag = (value: unknown, fallback: boolean) =>
    typeof value === 'boolean' ? value : fallback;

  return {
    hue: range(stored.hue, spec.maxHue, d.hue),
    font: spec.fonts.find((font) => font === stored.font) ?? d.font,
    radius: range(stored.radius, spec.maxRadius, d.radius),
    texture:
      spec.textures.find((texture) => texture === stored.texture) ?? d.texture,
    motion: flag(stored.motion, d.motion),
    smoothScroll: flag(stored.smoothScroll, d.smoothScroll),
    cursor: flag(stored.cursor, d.cursor),
    sound: flag(stored.sound, d.sound),
  };
}

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  const onOff = (value: boolean) => (value ? 'on' : 'off');
  root.style.setProperty('--accent-hue', String(prefs.hue));
  root.style.setProperty('--radius', `${prefs.radius}px`);
  root.dataset.font = prefs.font;
  root.dataset.texture = prefs.texture;
  root.dataset.motion = onOff(prefs.motion);
  root.dataset.smoothScroll = onOff(prefs.smoothScroll);
  root.dataset.cursor = onOff(prefs.cursor);
  root.dataset.sound = onOff(prefs.sound);
}

export const prefsScript = `try{(${applyPrefs.toString()})((${resolvePrefs.toString()})(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}),${JSON.stringify(SPEC)}))}catch(e){}`;

const listeners = new Set<() => void>();
let cache: { raw: string | null; prefs: Prefs } | undefined;

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getPrefs(): Prefs {
  const raw = readRaw();
  if (cache?.raw !== raw) cache = { raw, prefs: resolvePrefs(raw, SPEC) };
  return cache.prefs;
}

export function syncPrefs() {
  applyPrefs(getPrefs());
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  listeners.add(onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULT_PREFS);
}

const defaults = new Map(Object.entries(DEFAULT_PREFS));

function persist(prefs: Prefs) {
  const choices = Object.entries(prefs).filter(
    ([key, value]) => defaults.get(key) !== value,
  );
  try {
    if (choices.length) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.fromEntries(choices)),
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
  listeners.forEach((listener) => {
    listener();
  });
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  persist({ ...getPrefs(), [key]: value });
}

export function resetPrefs() {
  persist(DEFAULT_PREFS);
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useMotionEnabled() {
  const { motion } = usePrefs();
  const reducedMotion = useReducedMotion();
  return motion && !reducedMotion;
}
