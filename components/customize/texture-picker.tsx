"use client";

import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { type Texture } from "@/lib/prefs";

const options: { value: Texture; label: string }[] = [
  { value: "none", label: "None" },
  { value: "noise", label: "Noise" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "ruled", label: "Ruled" },
  { value: "graph", label: "Graph" },
  { value: "hatch", label: "Hatch" },
  { value: "topo", label: "Topo" },
];

function show(texture: Texture) {
  document.documentElement.dataset.texture = texture;
}

/**
 * The texture choice as live tiles, four to a row, each drawing its own pattern
 * (`.texture-swatch` in globals.css). Hovering a tile previews it on the page
 * behind the panel; leaving puts the saved texture back unless the tile was
 * clicked. The preview writes only `data-texture` on <html>, never the saved
 * preference.
 */
export function TexturePicker({
  value,
  onValueChange,
  labelId,
}: {
  value: Texture;
  onValueChange: (texture: Texture) => void;
  labelId: string;
}) {
  const saved = React.useRef(value);

  React.useEffect(() => {
    saved.current = value;
  }, [value]);

  // Closing the panel mid-hover must not leave a preview behind.
  React.useEffect(() => () => show(saved.current), []);

  return (
    <RadioGroup
      aria-labelledby={labelId}
      value={value}
      onValueChange={(next: Texture) => {
        saved.current = next;
        onValueChange(next);
      }}
      onPointerLeave={() => show(saved.current)}
      className="grid grid-cols-4 gap-2"
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") show(option.value);
          }}
          className="group/swatch grid justify-items-stretch gap-1.5 rounded-md text-center focus-visible:outline-offset-2"
        >
          <span
            aria-hidden
            data-swatch={option.value}
            className="texture-swatch h-9 rounded-md border border-border shadow-[inset_0_1px_2px_oklch(0.3_0.03_60/0.06)] transition-[border-color,box-shadow] duration-(--duration-exit) group-hover/swatch:border-foreground/25 group-data-checked/swatch:border-accent group-data-checked/swatch:shadow-[0_0_0_1px_var(--color-accent)]"
          />
          <span className="text-2xs leading-none text-muted transition-colors group-hover/swatch:text-foreground group-data-checked/swatch:text-foreground">
            {option.label}
          </span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
