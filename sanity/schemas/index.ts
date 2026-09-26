import { education } from "./education";
import { experience } from "./experience";
import { link } from "./link";
import { now } from "./now";
import { profile } from "./profile";
import { project } from "./project";
import { question } from "./question";
import { richText } from "./rich-text";
import { siteStats } from "./site-stats";
import { skillGroup } from "./skill-group";
import { update } from "./update";

export const schemaTypes = [
  richText,
  link,
  profile,
  experience,
  project,
  now,
  update,
  skillGroup,
  education,
  question,
  siteStats,
];

/** Documents with a fixed `_id`, edited in place and never created or deleted from Studio. */
export const singletonTypes = new Set(["profile", "now", "siteStats"]);
