"use client";

import { useState } from "react";
import Image from "next/image";

export const DEFAULT_FALLBACK = "linear-gradient(145deg,#0f766e 0%,#064e3b 55%,#022c22 100%)";

interface SafeImageProps {
  src: string;
  /** Use "" for purely decorative images. */
  alt: string;
  /** Tells the browser how wide the image renders, so it downloads the right size. */
  sizes: string;
  /** Gradient shown while the photo loads, and kept if the file does not exist yet. */
  fallback?: string;
  /** Preload this image. Use only for the single largest image above the fold. */
  priority?: boolean;
  quality?: number;
  /** Classes for the absolutely-filled wrapper (hover zoom, transitions, etc.). */
  className?: string;
  /** Classes for the <img> itself. Defaults to cover. */
  imgClassName?: string;
}

/**
 * next/image that fills its parent (the parent must be `relative` with a size). It:
 *  - serves responsive AVIF/WebP and lazy-loads by default,
 *  - shows a gradient underneath, so tiles look intentional before photos are added,
 *  - falls back to that gradient if the photo is missing, instead of a broken-image icon.
 */
export default function SafeImage({
  src,
  alt,
  sizes,
  fallback = DEFAULT_FALLBACK,
  priority = false,
  quality = 75,
  className = "",
  imgClassName = "object-cover",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ background: fallback }}
      {...(alt ? {} : { "aria-hidden": true })}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={imgClassName}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
