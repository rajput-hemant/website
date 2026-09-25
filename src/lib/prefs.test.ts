import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFS, getPrefs, resetPrefs, setPref } from './prefs';

const STORAGE_KEY = 'prefs:v1';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolve', () => {
  it('returns defaults when nothing is stored', () => {
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('resolves stored values that override defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ font: 'serif', motion: false }),
    );
    expect(getPrefs()).toEqual({ ...DEFAULT_PREFS, font: 'serif', motion: false });
  });

  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });
});

describe('validate', () => {
  it('falls back to the default hue and radius when out of range', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hue: 999, radius: -1 }));
    const prefs = getPrefs();
    expect(prefs.hue).toBe(DEFAULT_PREFS.hue);
    expect(prefs.radius).toBe(DEFAULT_PREFS.radius);
  });

  it('accepts in-range numeric values, rounded', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hue: 200.6 }));
    expect(getPrefs().hue).toBe(201);
  });

  it('ignores unknown font and texture values', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ font: 'comic-sans', texture: 'sparkles' }),
    );
    const prefs = getPrefs();
    expect(prefs.font).toBe(DEFAULT_PREFS.font);
    expect(prefs.texture).toBe(DEFAULT_PREFS.texture);
  });

  it('coerces non-boolean flag values to the default', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sound: 'yes', cursor: 1 }),
    );
    const prefs = getPrefs();
    expect(prefs.sound).toBe(DEFAULT_PREFS.sound);
    expect(prefs.cursor).toBe(DEFAULT_PREFS.cursor);
  });
});

describe('persist only explicit', () => {
  it('stores only the keys that differ from the default', () => {
    setPref('font', 'serif');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      font: 'serif',
    });
  });

  it('removes the storage entry once every value matches the default again', () => {
    setPref('font', 'serif');
    setPref('font', 'sans');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('resetPrefs clears storage and restores defaults', () => {
    setPref('sound', true);
    resetPrefs();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(getPrefs()).toEqual(DEFAULT_PREFS);
  });
});
