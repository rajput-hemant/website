export interface HeaderReader {
  get(name: string): string | null;
}

// Vercel overwrites x-real-ip and x-forwarded-for with the connecting client's
// address, so neither can be spoofed there; elsewhere this is best-effort.
export function getClientIp(headers: HeaderReader): string {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return headers.get('x-real-ip')?.trim() || forwardedFor || 'unknown';
}

export function isSameOrigin(headers: HeaderReader): boolean {
  const origin = headers.get('origin');
  const host = headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isJsonRequest(headers: HeaderReader): boolean {
  return (
    headers.get('content-type')?.split(';')[0]?.trim() === 'application/json'
  );
}
