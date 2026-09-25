import type { PublicAuthor } from './types';

export const OWNER_DISPLAY_NAME = 'Hemant';

export function displayName(
  author: Pick<PublicAuthor, 'name' | 'isOwner'>,
): string {
  if (author.isOwner) return OWNER_DISPLAY_NAME;
  return author.name?.trim() || 'Anonymous';
}

export function isReservedName(name: string | null): boolean {
  return name?.trim().toLowerCase() === OWNER_DISPLAY_NAME.toLowerCase();
}

export function excerpt(body: string, max = 140): string {
  const firstLine = (body.trim().split('\n', 1)[0] ?? '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`~]/g, '')
    .trim();
  if (firstLine.length <= max) return firstLine;
  return `${firstLine.slice(0, max - 1).trimEnd()}…`;
}
