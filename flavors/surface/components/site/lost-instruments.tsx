"use client";

import dynamic from "next/dynamic";

/**
 * The 404's knob and instruments, split out of the not-found page. That page
 * sits in the layout's tree, so importing them directly would put their code
 * (the knob included) in every route's initial JS; these load only where the
 * 404 renders them.
 */
export const LostPatch = dynamic(() =>
  import("./lost-patch").then((module) => module.LostPatch)
);

export const LostMeter = dynamic(() =>
  import("@/flavors/surface/components/instruments/meter").then(
    (module) => module.NeedleMeter
  )
);

export const LostSelector = dynamic(() =>
  import("@/flavors/surface/components/knob/channel-selector").then(
    (module) => module.ChannelSelector
  )
);
