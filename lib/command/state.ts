/**
 * Whether the ⌘K menu is open, published by the menu and read by its trigger
 * buttons, which live elsewhere in the tree. Plain module state with
 * subscriptions, for `useSyncExternalStore`.
 */
let open = false;
const listeners = new Set<() => void>();

export function getCommandMenuOpen(): boolean {
  return open;
}

export function setCommandMenuOpen(next: boolean): void {
  if (open === next) return;
  open = next;
  for (const listener of listeners) listener();
}

export function subscribeCommandMenuOpen(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
