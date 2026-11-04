"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);

    const handleImagesLoaded = () => {
      const images = Array.from(document.images);
      const pendingImages = images.filter((img) => !img.complete);

      if (pendingImages.length === 0) {
        setLoading(false);
      } else {
        let loadedCount = 0;
        pendingImages.forEach((img) => {
          img.addEventListener("load", () => {
            loadedCount++;
            if (loadedCount === pendingImages.length) {
              setLoading(false);
            }
          });
          img.addEventListener("error", () => {
            loadedCount++;
            if (loadedCount === pendingImages.length) {
              setLoading(false);
            }
          });
        });
      }
    };

    const timer = setTimeout(() => {
      handleImagesLoaded();
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {loading && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-9 overflow-hidden bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-night transition-opacity duration-500"
        >
          <div
            aria-hidden="true"
            className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-ceylon-glow/15 blur-3xl animate-pulse"
          />
          <div
            aria-hidden="true"
            className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulse"
          />

          {/* Emerald mark inside a spinning gold ring */}
          <div className="relative flex h-28 w-28 items-center justify-center animate-loader-rise">
            <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-white/10" />
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-ceylon-glow [animation-duration:1.2s]"
            />
            <svg viewBox="0 0 32 32" className="h-14 w-14 animate-loader-breathe" aria-hidden="true">
              <path d="M16 2 28 12 16 30 4 12Z" fill="#064e3b" stroke="#fbbf24" strokeWidth="1.5" />
              <path
                d="M4 12h24M10 12l6 18 6-18M16 2l-6 10M16 2l6 10"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.7"
              />
            </svg>
          </div>

          <div className="text-center animate-loader-rise [animation-delay:150ms]">
            <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ceylon <span className="text-ceylon-glow">Emerald</span> Tours
            </p>
            <p className="mt-1.5 text-sm text-white/60">Preparing your journey&hellip;</p>
          </div>

          {/* Sweeping progress bar */}
          <div aria-hidden="true" className="relative h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <span className="absolute inset-y-0 left-0 w-1/3 animate-loader-sweep rounded-full bg-gradient-to-r from-ceylon-glow to-ceylon-gold" />
          </div>

          <span className="sr-only">Loading Ceylon Emerald Tours</span>
        </div>
      )}
      {children}
    </>
  );
}