import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomTourPlanner from "@/components/CustomTourPlanner";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Plan a Custom Sri Lanka Tour",
  description:
    "Tell us your dates, who is travelling and what you love, and our team in Bandarawela will design a private custom itinerary around you. Free, no payment needed.",
  path: "/custom-tour",
  keywords: ["custom Sri Lanka tour", "tailor-made Sri Lanka itinerary", "Sri Lanka tour planner", "private Sri Lanka trip"],
});

export const dynamic = "force-static";

export default function CustomTourPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-night pb-16 pt-36 sm:pb-20 sm:pt-44">
          <div aria-hidden="true" className="absolute -left-24 top-20 -z-10 h-80 w-80 rounded-full bg-ceylon-glow/15 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="container-x">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Plan a custom tour
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
                None of the packages quite right? Tell us your dates, who is travelling and what you love, and our
                team in Bandarawela will plan a route around you.
              </p>
            </div>
          </div>
        </section>

        <section className="section-y !pt-4 bg-gradient-to-b from-ceylon-night to-ceylon-deep">
          <div className="container-x">
            <CustomTourPlanner />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
