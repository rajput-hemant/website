"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

export type SliderProps = {
  label: React.ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  className?: string;
};

/** A single-thumb slider (used for the accent hue, 0-360). */
export function Slider({
  label,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  format,
  className,
}: SliderProps) {
  return (
    <BaseSlider.Root<number>
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      min={min}
      max={max}
      step={step}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <BaseSlider.Label className="font-mono text-mono-xs tracking-[0.1em] text-graphite uppercase">
          {label}
        </BaseSlider.Label>
        <BaseSlider.Value className="font-mono text-mono-xs text-graphite tabular-nums">
          {(formatted, values) =>
            format ? format(values[0] ?? min) : (formatted[0] ?? "")
          }
        </BaseSlider.Value>
      </div>
      <BaseSlider.Control className="flex h-6 w-full items-center">
        <BaseSlider.Track className="relative h-1 w-full rounded-full bg-ink-sunken">
          <BaseSlider.Indicator className="absolute h-full rounded-full bg-accent" />
          <BaseSlider.Thumb
            className={cn(
              "block size-5 rounded-full border border-hairline bg-paper shadow-lift",
              "motion:transition-transform motion:duration-(--duration-press)",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
