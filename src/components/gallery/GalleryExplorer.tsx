"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Heart, Maximize2 } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import Lightbox from "./Lightbox";
import { GALLERY_FILTERS, type GalleryCategory, type GalleryItem } from "@/data/galleryData";

type FilterKey = "all" | GalleryCategory;

// Distinct tints so tiles look intentional before photos are added.
const FALLBACKS = [
  "linear-gradient(135deg,#064e3b,#022c22)",
  "linear-gradient(135deg,#0f766e,#064e3b)",
  "linear-gradient(135deg,#065f46,#0f172a)",
  "linear-gradient(135deg,#134e4a,#022c22)",
  "linear-gradient(135deg,#064e3b,#78350f)",
];

export default function GalleryExplorer({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const item of items) map[item.category] = (map[item.category] ?? 0) + 1;
    return map;
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  const select = (key: FilterKey) => {
    setOpenIndex(null);
    setFilter(key);
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* Filter tabs */}
      <div className="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
        <div role="group" aria-label="Filter photos by category" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {GALLERY_FILTERS.map((f) => {
            const active = filter === f.key;
            const count = counts[f.key] ?? 0;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => select(f.key)}
                aria-pressed={active}
                disabled={count === 0}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "border-transparent bg-gradient-to-r from-ceylon-glow to-ceylon-gold text-ceylon-night shadow-lg shadow-ceylon-gold/25"
                    : "border-white/20 bg-white/10 text-white/85 backdrop-blur-md hover:border-ceylon-glow/60 hover:text-ceylon-glow"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-ceylon-night/15" : "bg-white/10 text-white/60"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "photo" : "photos"}
      </p>

      {/* Grid */}
      <motion.ul layout className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item, i) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View larger photo: ${item.title}`}
                className="glow-hover group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 text-left"
              >
                <SafeImage
                  src={item.src}
                  alt={item.alt}
                  sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 50vw"
                  fallback={FALLBACKS[i % FALLBACKS.length]}
                  className="transition duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ceylon-night/85 via-transparent to-transparent" />

                {item.category === "past-customer" && (
                  <span className="glass-dark absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold sm:text-xs">
                    <Heart className="h-3 w-3 fill-ceylon-glow text-ceylon-glow" aria-hidden="true" />
                    Our guests
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ceylon-night/60 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </span>

                <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="block text-sm font-semibold leading-snug sm:text-base">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-white/70 sm:text-sm">{item.caption}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <Lightbox items={visible} index={openIndex} onClose={() => setOpenIndex(null)} onIndexChange={setOpenIndex} />
    </MotionConfig>
  );
}
