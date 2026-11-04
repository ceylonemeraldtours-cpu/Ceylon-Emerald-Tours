import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TransferForm from "@/components/TransferForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sri Lanka Airport Transfers (Colombo CMB)",
  description:
    "Book a private airport transfer in Sri Lanka. Tell us your flight, pick-up and drop-off, and we confirm your vehicle, price and driver by email and WhatsApp.",
  path: "/transfers",
  ogKey: "transfers",
  keywords: ["Colombo airport transfer", "Bandaranaike airport taxi", "private airport pickup Sri Lanka", "CMB to Ella transfer"],
});

// Static page: built once and served from the CDN.
export const dynamic = "force-static";

const STEPS = [
  {
    title: "Send your details",
    text: "Give us your pick-up and drop-off, the date and time, and your flight number if you have it.",
  },
  {
    title: "We confirm by email and WhatsApp",
    text: "You get a reference number straight away. Our team then confirms the vehicle, the price and your driver.",
  },
  {
    title: "Meet your driver",
    text: "Your driver collects you at the agreed place and time. Quote your reference if you need to reach us.",
  },
];

export default function TransfersPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-ceylon-deep via-ceylon-night to-ceylon-night pb-20 pt-32 sm:pb-28 sm:pt-40">
          <div aria-hidden="true" className="absolute -right-24 top-16 -z-10 h-96 w-96 rounded-full bg-ceylon-glow/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="container-x grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16">
            <div className="lg:sticky lg:top-32">
              <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Airport transfers across Sri Lanka
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Private rides between Bandaranaike International Airport and your hotel, planned by a team based
                in Bandarawela.
              </p>

              <ol className="mt-10 max-w-lg space-y-6">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ceylon-glow to-ceylon-gold font-display text-sm font-semibold text-ceylon-night">
                      {i + 1}
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold">{step.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="glass relative rounded-3xl p-6 shadow-2xl shadow-black/30 sm:p-8">
              <h2 className="font-display text-2xl font-semibold">Request a transfer</h2>
              <p className="mb-6 mt-1 text-sm text-white/65">All fields except the flight number are required.</p>
              <TransferForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
