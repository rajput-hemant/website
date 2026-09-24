export function isHoneypotTriggered(value: string): boolean {
  return value.trim().length > 0;
}

export function isElapsedWithinWindow(
  mountedAtMs: number,
  nowMs: number,
  minMs: number,
  maxMs: number,
): boolean {
  const elapsed = nowMs - mountedAtMs;
  return elapsed >= minMs && elapsed <= maxMs;
}
