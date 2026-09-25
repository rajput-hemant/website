import type { ApiError } from '~/lib/ask/types';

const FALLBACK: ApiError = { error: 'Something went wrong. Please try again.' };

export async function askApi<T extends object>(
  url: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T | ApiError> {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? null : JSON.stringify(body),
    });
    const data: T | ApiError = await res.json();
    if (res.ok) return data;
    return 'error' in data ? data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
