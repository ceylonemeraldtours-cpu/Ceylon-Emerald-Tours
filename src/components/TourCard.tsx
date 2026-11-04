"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatUSD, getTourSummary, type Tour } from "@/data/toursData";
import SafeImage, { DEFAULT_FALLBACK } from "./SafeImage";

export default function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -8 }}
      className="glass glow-hover group relative flex flex-col overflow-hidden rounded-3xl"
    >
      <Link
        href={`/packages/${tour.id}`}
        aria-label={`${tour.title}, ${tour.duration}, from ${formatUSD(tour.price)} per adult`}
        className="absolute inset-0 z-20 rounded-3xl"
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Decorative: the card link and title already describe the tour. The gradient shows until a photo exists. */}
        <SafeImage
          src={tour.image}
          alt=""
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          fallback={DEFAULT_FALLBACK}
          className="transition duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ceylon-night/80 via-transparent to-ceylon-night/20" />

        <span className="glass-dark absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
          <Clock className="h-3.5 w-3.5 text-ceylon-glow" />
          {tour.duration}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-ceylon-glow to-ceylon-gold px-3 py-1.5 text-xs font-bold text-ceylon-night shadow-lg">
          {tour.discountBadge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold leading-snug">{tour.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">
          {getTourSummary(tour)}
        </p>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="text-xs text-white/60">From, per adult</p>
            <p className="flex items-baseline gap-2">
              <span className="text-gold-gradient font-display text-3xl font-semibold">{formatUSD(tour.price)}</span>
              <span className="text-sm text-white/50 line-through">{formatUSD(tour.originalPrice)}</span>
            </p>
          </div>
          <span className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium transition group-hover:border-ceylon-glow group-hover:text-ceylon-glow">
            View tour
          </span>
        </div>
      </div>
    </motion.article>
  );
}
