/**
 * Whether the next ⌘K open came from a pointer on the trigger. Only then
 * does the dialog animate in; from the keyboard it appears at once.
 */
let fromPointer = false;

export function markPointerOpen() {
  fromPointer = true;
}

export function takePointerOpen(): boolean {
  const was = fromPointer;
  fromPointer = false;
  return was;
}
