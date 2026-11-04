"use client";

import { motion } from "framer-motion";
import { Mountain, PenLine, PlaneLanding, Sunrise, type LucideIcon } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import Image from "next/image";

const ICONS: Record<(typeof SERVICES)[number]["icon"], LucideIcon> = {
  plane: PlaneLanding,
  sunrise: Sunrise,
  mountain: Mountain,
  pen: PenLine,
};

const SPANS = ["lg:col-span-5", "lg:col-span-7", "lg:col-span-7", "lg:col-span-5"];

const SERVICE_IMAGES = [
  "/images/card-airport.webp", // Airport Transfers
  "/images/card-day.webp",    // Day Tours
  "/images/card-long.webp",   // Long Tours
  "/images/card-custom.webp", // Custom Tour
];

export default function ServicesGrid() {
  return (
    <section
      id="services"
      className="section-y bg-gradient-to-b from-ceylon-night to-ceylon-deep/60"
    >
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Choose how you want to explore
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
            From the moment you land to your last viewpoint, pick the service that fits your trip.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[service.icon];
            const bgImage = SERVICE_IMAGES[i % SERVICE_IMAGES.length];

            return (
              <motion.a
                key={service.key}
                href={service.href}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
                whileHover={{ y: -6 }}
                className={`glass glow-hover group relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-3xl p-7 sm:p-9 border border-white/10 transition-all duration-300 hover:border-ceylon-glow/50 ${SPANS[i]}`}
              >
                {/* Background Image & Full Coverage Overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={bgImage}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Solid dark overlay covering the entire card evenly without gaps */}
                  <div className="absolute inset-0 bg-ceylon-night/85 transition-opacity duration-300 group-hover:bg-ceylon-night/75" />
                </div>

                {/* Decorative Icon Background */}
                <Icon
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-ceylon-glow/10 transition duration-500 group-hover:scale-110 group-hover:text-ceylon-glow/25 z-10"
                />

                {/* Top Icon Badge */}
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-ceylon-glow/15 text-ceylon-glow ring-1 ring-ceylon-glow/30 backdrop-blur-md transition-colors duration-300 group-hover:bg-ceylon-glow/25 group-hover:ring-ceylon-glow/60">
                  <Icon className="h-6 w-6" />
                </span>

                {/* Content */}
                <div className="relative z-10 mt-10">
                  <h3 className="font-display text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-ceylon-glow">
                    {service.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                    {service.description}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}