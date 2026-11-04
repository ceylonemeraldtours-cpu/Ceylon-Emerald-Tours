"use client";

import { motion } from "framer-motion";
import {
  Car,
  Compass,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { REASONS, SITE } from "@/lib/constants";

const ICONS: Record<(typeof REASONS)[number]["icon"], LucideIcon> = {
  pin: MapPin,
  users: Users,
  compass: Compass,
  car: Car,
  message: MessageCircle,
  shield: ShieldCheck,
};

export default function WhyChooseUs() {
  return (
    <section id="about" className="section-y bg-ceylon-mist text-ceylon-ink">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ceylon-deep sm:text-4xl lg:text-5xl">
            Why travellers choose Emerald Tours
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ceylon-ink/70 sm:text-lg">
            We are a small team in the hills above Bandarawela. You deal with the people who plan
            and drive your trip, from first message to last goodbye.
          </p>
          <p className="mt-6 flex items-start gap-2 text-sm text-ceylon-ink/60">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ceylon-gold" />
            {SITE.address}
          </p>
        </motion.div>

        <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-7">
          {REASONS.map((reason, i) => {
            const Icon = ICONS[reason.icon];
            return (
              <motion.li
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                className="border-t border-ceylon-deep/15 pt-6"
              >
                <Icon className="h-6 w-6 text-ceylon-gold" />
                <h3 className="mt-4 font-display text-xl font-semibold text-ceylon-deep">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ceylon-ink/70 sm:text-base">
                  {reason.text}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
