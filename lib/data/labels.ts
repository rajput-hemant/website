/** Display labels for enum-like content fields, shared by pages and markdown mirrors. */
import type { LabStatus } from "@/content/lab";

import type { EmploymentType, ProjectStatus, UpdateCategory } from "./types";

export const employmentLabels: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  maintained: "Maintained",
  wip: "In progress",
  archived: "Archived",
};

export const labStatusLabels: Record<LabStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
};

export const updateCategoryLabels: Record<UpdateCategory, string> = {
  project: "Project",
  work: "Work",
  site: "Site",
  learning: "Learning",
  life: "Life",
};
