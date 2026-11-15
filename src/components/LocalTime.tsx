"use client";

import { useEffect, useState } from "react";

/* The current time where Tanvir is, so a visitor in another timezone can tell
 * at a glance whether it is a reasonable hour to expect a reply. Shows a
 * placeholder until mounted, which keeps server and client markup identical. */
export function LocalTime({ city, timeZone = "Asia/Dhaka" }: { city: string; timeZone?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground-faint">
      <span
        className="animate-pulse-slow mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
        aria-hidden="true"
      />
      {city} <span className="tabular-nums text-foreground-muted">{time ?? "--:--"}</span> GMT+6
    </p>
  );
}
