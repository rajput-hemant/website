"use client";

import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

export type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible name for the thumb. */
  label: string;
  getAriaValueText?: (formattedValue: string, value: number) => string;
  /** Fill the track up to the thumb in the accent colour. */
  indicator?: boolean;
  className?: string;
  trackStyle?: React.CSSProperties;
  trackClassName?: string;
  thumbClassName?: string;
};

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  getAriaValueText,
  indicator = true,
  className,
  trackStyle,
  trackClassName,
  thumbClassName,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next)}
      min={min}
      max={max}
      step={step}
      className={cn("w-full", className)}
    >
      <SliderPrimitive.Control className="flex h-6 w-full touch-none items-center select-none">
        <SliderPrimitive.Track
          className={cn(
            "relative h-1 w-full rounded-full bg-surface-2 shadow-[inset_0_0_0_1px_var(--color-border)]",
            trackClassName
          )}
          style={trackStyle}
        >
          {indicator && (
            <SliderPrimitive.Indicator className="rounded-full bg-accent" />
          )}
          <SliderPrimitive.Thumb
            aria-label={label}
            getAriaValueText={getAriaValueText}
            className={cn(
              "size-4 rounded-full border-2 border-background bg-foreground shadow-[0_0_0_1px_var(--color-border),0_1px_3px_oklch(0_0_0/0.2)] transition-[scale] duration-(--duration-exit) select-none active:scale-110 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
              thumbClassName
            )}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
