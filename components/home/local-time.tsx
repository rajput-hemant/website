"use client";

import { useSyncExternalStore } from "react";

const TIME_ZONE = "Asia/Kolkata";
const ZONE_LABEL = "IST";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

function subscribe(onChange: () => void) {
  let interval: ReturnType<typeof setInterval> | undefined;
  const untilNextMinute = 60_000 - (Date.now() % 60_000);
  const timeout = setTimeout(() => {
    onChange();
    interval = setInterval(onChange, 60_000);
  }, untilNextMinute);
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

const getSnapshot = () => formatter.format(Date.now());

// The server has no visitor clock, so it renders nothing and the time appears after hydration.
const getServerSnapshot = () => null;

/** The owner's wall-clock time, e.g. "4:32 PM IST". Renders nothing on the server. */
export function LocalTime({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (time === null) return null;

  return (
    <span className={className}>
      <span className="sr-only">Local time </span>
      {time} {ZONE_LABEL}
    </span>
  );
}
