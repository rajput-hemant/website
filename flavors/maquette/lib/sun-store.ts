"use client";

import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { DEFAULT_MINUTES } from "./sun";

/**
 * The time of day on the shadow study, shared by the slider, the plan
 * shadows in every vitrine and the scene. Session state, never saved: each
 * visit starts at the study's resting hour.
 */
export const sunStore = createStore<{ minutes: number }>(() => ({
  minutes: DEFAULT_MINUTES,
}));

export const setSunMinutes = (minutes: number) =>
  sunStore.setState({ minutes });

export const useSunMinutes = () => useStore(sunStore, (s) => s.minutes);
