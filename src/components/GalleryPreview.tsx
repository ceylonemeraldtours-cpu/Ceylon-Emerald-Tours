"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SafeImage from "./SafeImage";
import { GALLERY, SOCIALS } from "@/lib/constants";
import { InstagramIcon } from "./SocialIcons";

// Fills a 4 x 3 grid on md+ screens. Tiles are 2 columns wide on mobile where noted.
const TILE_CLASSES = [
  "col-span-2 row-span-2",
  "",
  "row-span-2 md:row-span-2",
  "",
  "col-span-2",
  "col-span-2",
];

// Distinct fallback tints so tiles look intentional before photos are added.
const FALLBACKS = [
  "linear-gradient(135deg,#064e3b,#022c22)",
  "linear-gradient(135deg,#0f766e,#064e3b)",
  "linear-gradient(135deg,#065f46,#0f172a)",
  "linear-gradient(135deg,#0f172a,#064e3b)",
  "linear-gradient(135deg,#134e4a,#022c22)",
  "linear-gradient(135deg,#064e3b,#78350f)",
];

export default function GalleryPreview() {
  return (
    <section id="gallery" className="section-y bg-ceylon-night">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Places your days could look like
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              A few stops from the routes our guests ask for most.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 self-start sm:flex-row sm:self-auto">
            <Link href="/gallery" className="btn-gold">
              View full gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" className="btn-glass">
              <InstagramIcon className="h-4 w-4" />
              See more on Instagram
            </a>
          </div>
        </motion.div>

        <div className="mt-12 grid auto-rows-[9.5rem] grid-cols-2 grid-flow-dense gap-3 sm:auto-rows-[13rem] md:grid-cols-4">
          {GALLERY.map((tile, i) => (
            <motion.figure
              key={tile.title}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className={`glow-hover group relative overflow-hidden rounded-2xl border border-white/10 ${TILE_CLASSES[i]}`}
            >
              <SafeImage
                src={tile.src}
                alt={tile.title}
                sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                fallback={FALLBACKS[i]}
                className="transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ceylon-night/85 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium sm:text-base">
                {tile.title}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
