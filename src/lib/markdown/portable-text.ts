import { portableTextToMarkdown } from '@portabletext/markdown';
import type {
  EXPERIENCE_QUERY_RESULT,
  PROFILE_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
} from '~/sanity/types';

export type RestrictedPortableTextBlock = NonNullable<
  NonNullable<PROFILE_QUERY_RESULT>['bio']
>[number];

export type RestrictedPortableTextBlocks =
  | NonNullable<NonNullable<PROFILE_QUERY_RESULT>['bio']>
  | NonNullable<EXPERIENCE_QUERY_RESULT[number]['body']>
  | NonNullable<PROJECTS_QUERY_RESULT[number]['description']>;

export function blocksToMarkdown(
  blocks: RestrictedPortableTextBlocks | null | undefined,
): string {
  if (!blocks?.length) {
    return '';
  }
  return portableTextToMarkdown([...blocks]).trimEnd();
}
