"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Desktop homepage: the header is fixed on the fullscreen reel, then returns to
 * the solid bar after the reel scrolls away. On a phone the header stays in
 * normal flow (see globals.css) and scrolls away with the page.
 * Other routes keep the in-flow sticky bar.
 */
export function ReelHeaderBar({ children }: { children: ReactNode }) {
  const path = usePathname();
  const onHome = path === "/";
  const [overReel, setOverReel] = useState(true);

  useEffect(() => {
    if (!onHome) return;
    const sync = () => {
      const hero = document.querySelector(".reel-hero");
      const bar = document.querySelector(".sticky-bar");
      if (!hero) {
        setOverReel(false);
        return;
      }
      const headerH = bar?.getBoundingClientRect().height ?? 72;
      setOverReel(hero.getBoundingClientRect().bottom > headerH + 8);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [onHome]);

  const classes = ["sticky-bar"];
  if (onHome) classes.push("sticky-bar--home");
  if (onHome && overReel) classes.push("sticky-bar--on-reel");

  return <div className={classes.join(" ")}>{children}</div>;
}
