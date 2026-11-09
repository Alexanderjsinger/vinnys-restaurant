"use client";

import { useEffect } from "react";

export function TrackView({ name }: { name: "menu_view" | "event_view" }) {
  useEffect(() => {
    const body = JSON.stringify({ event: name });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, [name]);
  return null;
}
