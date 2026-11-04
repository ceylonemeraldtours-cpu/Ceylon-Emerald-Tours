"use client";

import { motion, type Variants } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { DESTINATIONS, whatsappLink } from "@/lib/constants";
import SafeImage from "./SafeImage";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// Shown underneath the photo, and kept if the photo file is missing.
const HERO_FALLBACK = [
  "radial-gradient(60% 50% at 78% 22%, rgba(251,191,36,0.28), transparent 70%)",
  "radial-gradient(80% 60% at 20% 90%, rgba(6,78,59,0.9), transparent 70%)",
  "linear-gradient(160deg, #064e3b 0%, #022c22 70%)",
].join(", ");

export default function Hero() {
  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      {/* Background: slow settle-in on load */}
      <motion.div
        aria-hidden="true"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="absolute inset-0 -z-20"
      >
        {/* The largest image on the home page: preloaded for a fast first paint. */}
        <SafeImage src="/images/hero.jpg" alt="" sizes="100vw" quality={70} priority fallback={HERO_FALLBACK} />
      </motion.div>
      {/* Readability overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ceylon-night/85 via-ceylon-night/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ceylon-night via-transparent to-ceylon-night/40"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-x pb-16 pt-36 sm:pb-24"
      >
        <motion.h1
          variants={item}
          className="max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          Discover the Heart of Ceylon with Emerald Tours
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Private tours, airport transfers and custom journeys through Sri Lanka&rsquo;s hill
          country and beyond, planned by a local team in Bandarawela.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href="/packages" className="btn-gold">
            Explore Tour Packages
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
          >
            <MessageCircle className="h-4 w-4" />
            Plan on WhatsApp
          </a>
        </motion.div>

        <motion.div
          variants={item}
          className="glass mt-14 max-w-2xl rounded-2xl p-5 sm:p-6"
        >
          <p className="text-sm text-white/75">
            Most of our days begin in Bandarawela and reach out to:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {DESTINATIONS.map((place) => (
              <li
                key={place}
                className="rounded-full border border-ceylon-glow/40 bg-ceylon-night/40 px-3.5 py-1.5 text-sm text-ceylon-glow"
              >
                {place}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
