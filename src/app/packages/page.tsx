import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, PlaneLanding } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import CustomTourPlanner from "@/components/CustomTourPlanner";
import { dayTours, multiDayTours } from "@/data/toursData";
import { whatsappLink } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sri Lanka Tour Packages: Multi-Day & Day Tours",
  description:
    "Multi-day and day tours across Sri Lanka: cultural triangle, hill country, safaris, Galle, Colombo and Ella. Private tours with your own driver-guide, planned from Bandarawela.",
  path: "/packages",
  ogKey: "packages",
  keywords: ["Sri Lanka tour packages", "7 day Sri Lanka tour", "14 day Sri Lanka tour", "Galle day tour", "Colombo day tour"],
});

// Static page: built once and served from the CDN.
export const dynamic = "force-static";

const JUMP_LINKS = [
  { href: "#long-tours", label: "Multi-day tours" },
  { href: "#day-tours", label: "Day tours" },
  { href: "#transfers", label: "Airport transfers" },
  { href: "#custom-tour", label: "Custom tour" },
];

export default function PackagesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Banner with Background Image */}
        <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pb-20 sm:pt-44">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="/images/hero.webp"
              alt="Sri Lanka Tour Packages Banner"
              fill
              className="object-cover"
              priority
            />
            {/* Dark gradient overlay to keep text readable */}
            <div className="absolute inset-0 bg-ceylon-night/85 backdrop-blur-[2px]" />
          </div>

          <div
            aria-hidden="true"
            className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-ceylon-glow/20 blur-3xl"
          />
          <div className="container-x relative z-10">
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white">
              Tour packages across Sri Lanka
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Private tours with your own driver-guide, from a single day in Ella to two weeks around
              the island.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {JUMP_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="btn-glass !px-5 !py-2.5">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Multi-day */}
        <section id="long-tours" className="section-y bg-gradient-to-b from-ceylon-night to-ceylon-deep/50">
          <div className="container-x">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Our Multi-Day Tour Packages
            </h2>
            <p className="mt-3 max-w-2xl text-white/70">
              From a four-day cultural sampler to the full island circuit.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {multiDayTours.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Day tours */}
        <section id="day-tours" className="section-y bg-ceylon-night">
          <div className="container-x">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Our Day Tour Packages
            </h2>
            <p className="mt-3 max-w-2xl text-white/70">
              One day, one destination, back at your hotel by evening.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {dayTours.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Airport transfers */}
        <section id="transfers" className="section-y bg-ceylon-mist text-ceylon-ink">
          <div className="container-x">
            <div className="flex flex-col gap-8 rounded-3xl border border-ceylon-deep/15 bg-white p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ceylon-deep to-ceylon-night text-ceylon-glow">
                  <PlaneLanding className="h-6 w-6" />
                </span>
                <h2 className="mt-6 font-display text-2xl font-semibold text-ceylon-deep sm:text-3xl">Airport transfers</h2>
                <p className="mt-3 leading-relaxed text-ceylon-ink/75">
                  Private rides between Bandaranaike International Airport and Colombo, Negombo, Kandy, Ella,
                  Bandarawela and the south coast.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link href="/transfers" className="btn-gold">
                  Book a transfer
                </Link>
                <a
                  href={whatsappLink("Hello, I'd like a quote for an airport transfer.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ceylon-deep/25 px-7 py-3.5 text-sm font-semibold text-ceylon-deep transition hover:border-ceylon-gold hover:text-ceylon-gold"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Custom tour planner */}
        <section id="custom-tour" className="section-y relative isolate overflow-hidden bg-gradient-to-b from-ceylon-night to-ceylon-deep">
          <div aria-hidden="true" className="absolute -left-24 top-20 -z-10 h-80 w-80 rounded-full bg-ceylon-glow/15 blur-3xl" />
          <div className="container-x">
            <div className="mx-auto mb-10 max-w-3xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Plan a custom tour</h2>
              <p className="mt-3 text-white/70">
                None of the packages quite right? Tell us your dates, who is travelling and what you love, and our
                team in Bandarawela will plan a route around you.
              </p>
            </div>
            <CustomTourPlanner />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}