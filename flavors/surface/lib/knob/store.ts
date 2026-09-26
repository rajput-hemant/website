import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export type KnobState = {
  /** The mounted knob that owns the store (its React id). */
  owner: string | null;
  /** Detents on the mounted knob. */
  count: number;
  /** The selected detent. */
  index: number;
  /** A detent something is hovering or focusing: the knob leans to it without selecting. */
  preview: number | null;
  /** The angle under the visitor's hand while dragging, in degrees; otherwise null. */
  drag: number | null;
  pressed: boolean;
  /** Lean towards the pointer, -1..1 on each axis. Only the 3D frame loop reads it. */
  tiltX: number;
  tiltY: number;
};

export const knobStore = createStore<KnobState>(() => ({
  owner: null,
  count: 5,
  index: 0,
  preview: null,
  drag: null,
  pressed: false,
  tiltX: 0,
  tiltY: 0,
}));

export function useKnob<T>(selector: (state: KnobState) => T): T {
  return useStore(knobStore, selector);
}

/** The detent the knob shows: the hovered one, else the selected one. */
export function shownIndex(state: KnobState): number {
  return state.preview ?? state.index;
}
