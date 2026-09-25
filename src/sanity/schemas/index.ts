import { askAuthor } from './ask-author';
import { askBan } from './ask-ban';
import { education } from './education';
import { experience } from './experience';
import { now } from './now';
import { profile } from './profile';
import { project } from './project';
import { question } from './question';
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
  question,
  askBan,
  askAuthor,
];

export const singletonTypes = new Set(['profile', 'now']);

export const privateTypes = new Set(['askBan', 'askAuthor']);
