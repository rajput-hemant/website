import "server-only";

/**
 * Reads a request body as text, giving up as soon as it exceeds `maxBytes`.
 * `Content-Length` is checked first, but the stream is still counted because
 * the header can be absent (chunked) or wrong.
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<{ ok: true; text: string } | { ok: false }> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false };
  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return { ok: false };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}

export function parseJson(
  text: string
): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

/** Stands in for the client address when no trusted proxy reports it. */
export const UNKNOWN_CLIENT = "direct";

export type ClientAddress = {
  ip: string;
  /** False when `ip` is the shared `UNKNOWN_CLIENT` bucket. */
  trusted: boolean;
};

/**
 * `ASK_TRUST_PROXY` is the number of reverse proxies in front of Next that
 * append to `X-Forwarded-For` (usually 1). Unset or 0 means requests arrive
 * directly, so the header is whatever the client chose to send.
 */
export function readTrustedProxyHops(
  value: string | undefined = process.env.ASK_TRUST_PROXY
): number {
  const hops = Number(value ?? "");
  return Number.isSafeInteger(hops) && hops > 0 ? hops : 0;
}

/**
 * The client address as seen by the outermost trusted proxy. Each proxy
 * appends the address it received from, so with `hops` trusted proxies the
 * client is `hops` entries from the right; anything further left is
 * client-supplied and ignored.
 */
export function getClientAddress(
  headers: Headers,
  hops: number = readTrustedProxyHops()
): ClientAddress {
  if (hops < 1) return { ip: UNKNOWN_CLIENT, trusted: false };
  const chain = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const ip = chain[chain.length - hops];
  return ip ? { ip, trusted: true } : { ip: UNKNOWN_CLIENT, trusted: false };
}

/** Only a JSON body is accepted, so a cross-site form or `no-cors` fetch cannot post one. */
export function hasJsonContentType(headers: Headers): boolean {
  const mediaType = headers.get("content-type")?.split(";")[0]?.trim();
  return mediaType?.toLowerCase() === "application/json";
}

/**
 * True when the browser says the request came from another site. Older
 * clients omit `Sec-Fetch-Site`, and the JSON requirement covers them.
 */
export function isCrossSiteRequest(headers: Headers): boolean {
  const site = headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}
