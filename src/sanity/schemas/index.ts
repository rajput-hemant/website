import { education } from './education';
import { experience } from './experience';
import { now } from './now';
import { profile } from './profile';
import { project } from './project';
import { skillGroup } from './skill-group';
import { update } from './update';

export const schemaTypes = [
  profile,
  experience,
  project,
  now,
  update,
  skillGroup,
  education,
];

export const singletonTypes = new Set(['profile', 'now']);
