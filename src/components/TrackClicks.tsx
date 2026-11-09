"use client";

import { useEffect } from "react";

const ALLOWED = new Set([
  "menu_view",
  "directions_click",
  "phone_click",
  "event_view",
  "party_inquiry_submit",
]);

function send(name: string) {
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
}

export function TrackClicks() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("[data-track]");
      const name = link?.getAttribute("data-track") ?? "";
      if (!ALLOWED.has(name)) return;
      send(name);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
