"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
}

/** Sticky section tabs that highlight the section currently in view. */
export default function TourTabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const key = tabs.map((t) => t.id).join(",");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    key.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [key]);

  return (
    <div className="sticky top-[4.5rem] z-40 border-b border-ceylon-deep/10 bg-white/85 backdrop-blur-md">
      <nav aria-label="Tour sections" className="container-x">
        <ul className="no-scrollbar flex gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <li key={tab.id} className="shrink-0">
                <a
                  href={`#${tab.id}`}
                  onClick={() => setActive(tab.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-ceylon-night" : "text-ceylon-ink/60 hover:text-ceylon-deep"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tour-tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-ceylon-glow to-ceylon-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
