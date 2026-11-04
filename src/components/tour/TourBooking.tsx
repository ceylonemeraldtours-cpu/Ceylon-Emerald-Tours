"use client";

import { useCallback, useState } from "react";
import { Car, Compass, Languages, MapPin, RefreshCcw, Users, Zap, Activity } from "lucide-react";
import BookingModal from "../BookingModal";
import { formatUSD, isDayTour, type Tour } from "@/data/toursData";

const TRUST = [
  { Icon: RefreshCcw, title: "Flexible Cancellation", text: "Ask us about changing your dates." },
  { Icon: Zap, title: "Instant Confirmation", text: "Your reference is emailed straight away." },
  { Icon: Compass, title: "Expert Local Guide", text: "Driver-guides who live in the hills." },
];

export default function TourBooking({ tour }: { tour: Tour }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const summary = `${tour.duration}, from ${formatUSD(tour.price)} per adult`;
  const info = tour.tourInfo;

  const infoRows = [
    { Icon: Car, label: "Vehicle", value: info.vehicle },
    { Icon: MapPin, label: "Departure", value: info.departure },
    { Icon: Users, label: "Group size", value: info.groupSize },
    { Icon: Languages, label: "Language", value: info.language },
    { Icon: Activity, label: "Fitness level", value: info.fitnessLevel },
  ];

  return (
    <>
      <div className="space-y-5">
        {/* Pricing */}
        <div className="overflow-hidden rounded-3xl border border-ceylon-deep/15 bg-white shadow-xl shadow-ceylon-deep/10">
          <div className="bg-gradient-to-br from-ceylon-deep to-ceylon-night p-6 text-white">
            <span className="inline-block rounded-full bg-gradient-to-r from-ceylon-glow to-ceylon-gold px-3 py-1 text-xs font-bold text-ceylon-night">
              {tour.discountBadge}
            </span>
            <p className="mt-4 text-sm text-emerald-100/80">Starting from, per adult</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold text-ceylon-glow">{formatUSD(tour.price)}</span>
              <span className="text-lg text-white/50 line-through">{formatUSD(tour.originalPrice)}</span>
            </p>
          </div>
          <div className="p-6">
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="btn-gold w-full text-base">
              Book Now
            </button>
            <p className="mt-3 text-center text-xs text-ceylon-ink/60">No payment taken online.</p>
            <ul className="mt-5 space-y-4 border-t border-ceylon-deep/10 pt-5">
              {TRUST.map(({ Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ceylon-deep/10 text-ceylon-deep">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ceylon-ink">{title}</span>
                    <span className="block text-xs text-ceylon-ink/60">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tour info */}
        <div className="rounded-3xl border border-ceylon-deep/15 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ceylon-deep">Tour info</h2>
          <dl className="mt-4 grid gap-4">
            {infoRows.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ceylon-gold" />
                <div>
                  <dt className="text-xs text-ceylon-ink/55">{label}</dt>
                  <dd className="text-sm font-medium text-ceylon-ink">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Mobile booking bar */}
      <div className="glass-dark fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 px-5 py-3 lg:hidden">
        <div>
          <p className="text-xs text-white/60">From, per adult</p>
          <p className="font-display text-xl font-semibold text-ceylon-glow">{formatUSD(tour.price)}</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="btn-gold !py-3">
          Book Now
        </button>
      </div>

      <BookingModal
        open={open}
        onClose={close}
        packageId={tour.id}
        packageTitle={tour.title}
        summary={summary}
        pricePerAdult={tour.price}
        requiresPickup={isDayTour(tour)}
      />
    </>
  );
}
