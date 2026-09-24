export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(isoDate).toLocaleDateString('en', {
    ...options,
    timeZone: 'UTC',
  });
}
