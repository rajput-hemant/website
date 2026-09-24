import { portableTextToMarkdown } from '@portabletext/markdown';
import type { PROFILE_QUERY_RESULT } from '~/sanity/types';

export type RestrictedPortableTextBlock = NonNullable<
  NonNullable<PROFILE_QUERY_RESULT>['bio']
>[number];

export function blocksToMarkdown(
  blocks: readonly RestrictedPortableTextBlock[] | null | undefined,
): string {
  if (!blocks?.length) {
    return '';
  }
  return portableTextToMarkdown([...blocks]).trimEnd();
}
