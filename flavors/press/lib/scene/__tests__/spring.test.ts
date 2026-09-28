import { springStep } from "@/flavors/press/lib/scene/spring";
import { expect, test } from "vitest";

/** Runs the spring at 60fps until it settles; returns the path and frame count. */
function run(value: number, velocity: number, target: number) {
  const path: number[] = [];
  let state: [number, number] | null = [value, velocity];
  let frames = 0;
  while (state && frames < 600) {
    state = springStep(state[0], state[1], target, 1 / 60);
    if (state) path.push(state[0]);
    frames++;
  }
  return { path, frames };
}

test("settles on the target within a second, overshooting a little", () => {
  const { path, frames } = run(0.9, 0, 0.28);
  expect(frames).toBeLessThan(60);
  expect(Math.min(...path)).toBeLessThan(0.28);
  expect(Math.min(...path)).toBeGreaterThan(0.2);
});

test("carries the release velocity", () => {
  const still = run(0.6, 0, 0.28).path;
  const flung = run(0.6, 3, 0.28).path;
  expect(Math.max(...flung)).toBeGreaterThan(Math.max(...still));
});

test("is stable across a long frame", () => {
  const next = springStep(0.9, 0, 0.28, 1 / 20);
  expect(next).not.toBeNull();
  expect(Math.abs((next ?? [0])[0] - 0.28)).toBeLessThan(0.62);
});

test("reports settled at rest", () => {
  expect(springStep(0.28, 0, 0.28, 1 / 60)).toBeNull();
});
