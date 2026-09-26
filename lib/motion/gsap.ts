"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

/* The glide and enter curves every edition names in its --ease-* tokens. */
CustomEase.create("glide", "0.16, 1, 0.3, 1");
CustomEase.create("enter", "0.23, 1, 0.32, 1");

export { CustomEase, gsap, ScrollTrigger, SplitText, useGSAP };

/** Whether motion is on: the preference and the OS setting, resolved on <html>. */
export function motionOn(): boolean {
  return document.documentElement.dataset.motion === "on";
}
