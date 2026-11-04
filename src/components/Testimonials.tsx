"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, PenLine, Star } from "lucide-react";
import ReviewModal from "@/components/reviews/ReviewModal";
import { FIVE_STAR_REVIEWS } from "@/data/reviewsData";
import { SOCIALS } from "@/lib/constants";

const INITIAL_VISIBLE = 6;

function Stars({ count = 5, className = "h-5 w-5" }: { count?: number; className?: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, s) => (
        <Star key={s} aria-hidden="true" className={`${className} fill-ceylon-glow text-ceylon-glow`} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  // Only 5-star reviews ever reach this component (see FIVE_STAR_REVIEWS), and all of them are shown.
  const reviews = FIVE_STAR_REVIEWS;
  const total = reviews.length;

  const [index, setIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [writing, setWriting] = useState(false);

  const current = reviews[index] ?? reviews[0];
  const go = (next: number) => setIndex((next + total) % total);
  const visible = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  return (
    <MotionConfig reducedMotion="user">
      <section id="testimonials" className="section-y bg-gradient-to-b from-ceylon-night to-ceylon-deep">
        <div className="container-x">
          {/* Featured review */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-4"
            >
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Kind words from our guests
              </h2>
              {total > 0 && (
                <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
                 <Stars className="h-4 w-4" />
                 <span>{total} five-star {total === 1 ? "review" : "reviews"}</span>
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                A selection of the 5-star reviews guests have shared with us. You can read more on{" "}
                <a
                  href={SOCIALS.tripadvisor}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ceylon-glow underline-offset-4 hover:underline"
                >
                  TripAdvisor
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                .
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {total > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(index - 1)}
                      aria-label="Previous review"
                      className="glass glow-hover flex h-11 w-11 items-center justify-center rounded-full"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(index + 1)}
                      aria-label="Next review"
                      className="glass glow-hover flex h-11 w-11 items-center justify-center rounded-full"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="ml-1 text-sm text-white/60" aria-live="polite">
                      {index + 1} of {total}
                    </span>
                  </>
                )}
              </div>

              <button type="button" onClick={() => setWriting(true)} className="btn-gold mt-8">
                <PenLine className="h-4 w-4" />
                Write a Review
              </button>
            </motion.div>

            <div className="glass relative min-h-[18rem] rounded-3xl p-7 sm:p-10 lg:col-span-8">
              {current ? (
                <AnimatePresence mode="wait">
                  <motion.figure
                    key={current.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Stars />
                    <blockquote className="mt-6 font-display text-xl leading-snug sm:text-2xl lg:text-3xl">
                      {current.text}
                    </blockquote>
                    <figcaption className="mt-8 text-sm text-white/70">
                      <span className="font-semibold text-white">{current.name}</span>, {current.country}
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
              ) : (
                <div className="flex h-full min-h-[14rem] flex-col items-start justify-center">
                  <p className="font-display text-2xl">Be the first to share your trip.</p>
                  <p className="mt-2 text-white/70">Travelled with us? We would love to hear how it went.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ReviewModal open={writing} onClose={() => setWriting(false)} />
    </MotionConfig>
  );
}
