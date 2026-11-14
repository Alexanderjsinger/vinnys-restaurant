"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

/**
 * Renders an event photo only while it loads. On error (404, HTML-as-image, etc.)
 * hide the broken browser icon — honest empty state, no stock/fake fallback.
 */
export function EventPhoto({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />;
}
