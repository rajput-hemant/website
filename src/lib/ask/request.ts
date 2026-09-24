export interface HeaderReader {
  get(name: string): string | null;
}

export function getClientIp(headers: HeaderReader): string {
  const forwardedFor = headers.get('x-forwarded-for');
  const firstEntry = forwardedFor?.split(',')[0]?.trim();
  return firstEntry || headers.get('x-real-ip') || '0.0.0.0';
}
