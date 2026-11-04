"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { CATEGORY_LABEL, type GalleryItem } from "@/data/galleryData";

interface LightboxProps {
  items: GalleryItem[];
  /** Index into `items`, or null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

const SWIPE_PX = 50;

export default function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;
  const total = items.length;
  const current = index !== null ? items[index] : null;

  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Keep the latest callbacks and index in refs so the key handler is attached once per open.
  const onCloseRef = useRef(onClose);
  const onIndexChangeRef = useRef(onIndexChange);
  const indexRef = useRef(index);
  const totalRef = useRef(total);
  onCloseRef.current = onClose;
  onIndexChangeRef.current = onIndexChange;
  indexRef.current = index;
  totalRef.current = total;

  useEffect(() => setMounted(true), []);

  // Lock page scroll, trap focus, handle Escape and arrow keys, and restore focus on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 50);

    const step = (delta: number) => {
      const i = indexRef.current;
      const n = totalRef.current;
      if (i === null || n < 2) return;
      onIndexChangeRef.current((i + delta + n) % n);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      } else if (e.key === "ArrowRight") {
        step(1);
      } else if (e.key === "ArrowLeft") {
        step(-1);
      } else if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const go = (delta: number) => {
    if (index === null || total < 2) return;
    onIndexChange((index + delta + total) % total);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    const end = e.changedTouches[0]?.clientX;
    if (start === null || end === undefined) return;
    const dx = end - start;
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  const navBtn =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ceylon-night/60 text-white backdrop-blur-md transition hover:border-ceylon-glow hover:text-ceylon-glow";

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          key="lightbox"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[110] flex flex-col bg-ceylon-night/95 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm text-white/70" aria-live="polite">
              {(index ?? 0) + 1} / {total}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close photo viewer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image */}
          <div
            className="relative flex-1 px-2 sm:px-16"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full"
              >
                <SafeImage
                  src={current.src}
                  alt={current.alt}
                  sizes="100vw"
                  quality={90}
                  priority
                  imgClassName="object-contain"
                  fallback="linear-gradient(145deg,#0f766e 0%,#064e3b 55%,#022c22 100%)"
                  className="rounded-2xl"
                />
              </motion.div>
            </AnimatePresence>

            {total > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${navBtn} left-3 sm:left-4`}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${navBtn} right-3 sm:right-4`}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Caption */}
          <div className="px-5 pb-6 pt-4 text-center sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ceylon-glow">
              {CATEGORY_LABEL[current.category]}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{current.title}</h2>
            <p className="mt-1 text-sm text-white/65">{current.caption}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
