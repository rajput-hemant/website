import "server-only";

import * as React from "react";
import { buildRelief } from "@/flavors/survey/lib/relief";

import { getExperience, getProjects } from "@/lib/data";

/** The sheet, laid out once per render from the real roles and projects. */
export const getRelief = React.cache(async () => {
  const [experience, projects] = await Promise.all([
    getExperience(),
    getProjects(),
  ]);
  return buildRelief(experience, projects);
});

/** "Sheet 26": this edition's sheet number is the year it was revised. */
export const sheetNumber = () =>
  `Sheet ${String(new Date().getFullYear() % 100).padStart(2, "0")}`;
