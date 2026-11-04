import { SITE } from "@/lib/constants";
import type { BookingInput, BookingTarget } from "@/lib/booking";
import type { TransferInput } from "@/lib/transfer";
import type { CustomTourInput } from "@/lib/customTour";
import { daysBetween, prettyDate, prettyTime } from "@/lib/validation";
import {
  C,
  button,
  chips,
  contactBlock,
  esc,
  guestWhatsappLink,
  heading,
  layout,
  money,
  multiline,
  paragraph,
  referenceBanner,
  referenceStrip,
  row,
  table,
} from "./layout";
import type { Mail, MailPair } from "./transport";

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;
const NOT_CHARGED = "Nothing has been charged.";

const mailto = (address: string) => `<a href="mailto:${esc(address)}" style="color:${C.deep};">${esc(address)}</a>`;
const telLink = (phone: string) =>
  `<a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="color:${C.deep};">${esc(phone)}</a>`;

function guestRows(g: { fullName: string; email: string; phone: string }): string {
  return table([
    row("Name", esc(g.fullName)),
    row("Email", mailto(g.email)),
    row("Phone / WhatsApp", telLink(g.phone)),
  ]);
}

/* ------------------------------------------------------------------ */
/* Tour package booking                                                */
/* ------------------------------------------------------------------ */

export interface BookingEmailData {
  reference: string;
  target: BookingTarget;
  guest: BookingInput;
  submittedAt: Date;
}

function tourUrl(target: BookingTarget): string | null {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return base ? `${base}${target.path}` : null;
}

function bookingRows(data: BookingEmailData): string[] {
  const { target, guest } = data;
  const link = tourUrl(target);
  return [
    row("Package", link ? `<a href="${esc(link)}" style="color:${C.deep};">${esc(target.title)}</a>` : esc(target.title)),
    row("Duration", esc(target.duration)),
    row("Listed price", `From ${money(target.price)} per adult`),
    row("Preferred date", esc(prettyDate(guest.travelDate))),
    row("Guests", String(guest.guests)),
    guest.pickupLocation ? row("Pickup location", esc(guest.pickupLocation)) : "",
  ];
}

export function buildBookingEmails(data: BookingEmailData): MailPair {
  const { guest, reference, target, submittedAt } = data;

  const guestMail: Mail = {
    subject: `Your booking request ${reference} | ${SITE.name}`,
    html: layout(
      `We received your request for ${target.title}. Reference ${reference}.`,
      `Thank you, ${firstName(guest.fullName)}. We have your request.`,
      `${paragraph(
        `We have received your booking request and our team will contact you soon to confirm availability, the final price and payment details. ${NOT_CHARGED}`
      )}
       ${referenceBanner(reference, "Your booking reference")}
       ${heading("Your request", 4)}
       ${table([
         ...bookingRows(data),
         guest.specialRequests ? row("Special requests", multiline(guest.specialRequests)) : "",
       ])}
       ${contactBlock(reference)}`
    ),
    text: [
      `Thank you, ${guest.fullName}. We have received your booking request.`,
      `Reference: ${reference}`,
      `Package: ${target.title} (${target.duration})`,
      `Preferred date: ${prettyDate(guest.travelDate)}`,
      `Guests: ${guest.guests}`,
      guest.pickupLocation ? `Pickup location: ${guest.pickupLocation}` : "",
      guest.specialRequests ? `Special requests: ${guest.specialRequests}` : "",
      "",
      `Our team will contact you soon to confirm availability, price and payment details. ${NOT_CHARGED}`,
      `Questions? WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}.`,
      `${SITE.name}, ${SITE.address}`,
    ]
      .filter((l) => l !== "")
      .join("\n"),
  };

  const wa = guestWhatsappLink(
    guest.phone,
    `Hello ${guest.fullName}, this is ${SITE.name} about your booking request ${reference} for ${target.title}.`
  );
  const ownerMail: Mail = {
    subject: `New booking request ${reference}: ${target.title}`,
    html: layout(
      `${guest.fullName} wants ${target.title} on ${guest.travelDate}.`,
      "New booking request",
      `${referenceStrip(reference)}
       ${heading("Guest", 0)}
       ${guestRows(guest)}
       ${heading("Request")}
       ${table([
         ...bookingRows(data),
         row("Special requests", guest.specialRequests ? multiline(guest.specialRequests) : "None"),
         row("Received", esc(submittedAt.toUTCString())),
       ])}
       <div style="margin-top:26px;">
         ${button(wa, "Reply on WhatsApp", "gold")}${button(`mailto:${guest.email}?subject=${encodeURIComponent(`Your booking request ${reference}`)}`, "Reply by email", "green")}
       </div>
       <p style="margin:14px 0 0;font-size:12px;color:${C.muted};">The guest has been sent a confirmation email with this reference.</p>`
    ),
    text: [
      `New booking request ${reference}`,
      `Package: ${target.title} (${target.duration})`,
      `Name: ${guest.fullName}`,
      `Email: ${guest.email}`,
      `Phone: ${guest.phone}`,
      `Preferred date: ${prettyDate(guest.travelDate)}`,
      `Guests: ${guest.guests}`,
      guest.pickupLocation ? `Pickup location: ${guest.pickupLocation}` : "",
      `Special requests: ${guest.specialRequests || "None"}`,
      `WhatsApp: ${wa}`,
    ]
      .filter((l) => l !== "")
      .join("\n"),
  };

  return { owner: ownerMail, guest: guestMail };
}

/* ------------------------------------------------------------------ */
/* Airport transfer                                                    */
/* ------------------------------------------------------------------ */

export interface TransferEmailData {
  reference: string; // CET-TR-XXXX
  transfer: TransferInput;
  submittedAt: Date;
}

function transferRows(t: TransferInput): string[] {
  return [
    row("Pick-up", esc(t.pickupLocation)),
    row("Drop-off", esc(t.dropoffLocation)),
    row("Date", esc(prettyDate(t.date))),
    row("Time", esc(prettyTime(t.time))),
    row("Flight number", t.flightNumber ? esc(t.flightNumber) : "Not provided"),
    row("Passengers", String(t.passengers)),
  ];
}

export function buildTransferEmails(data: TransferEmailData): MailPair {
  const { reference, transfer: t, submittedAt } = data;
  const route = `${t.pickupLocation} to ${t.dropoffLocation}`;

  const guestMail: Mail = {
    subject: `Your airport transfer request ${reference} | ${SITE.name}`,
    html: layout(
      `We received your transfer request for ${prettyDate(t.date)}. Reference ${reference}.`,
      `Thank you, ${firstName(t.fullName)}. We have your transfer request.`,
      `${paragraph(
        `We have received your airport transfer request. Our team will confirm the vehicle, the price and your driver's details by email or WhatsApp shortly. ${NOT_CHARGED}`
      )}
       ${referenceBanner(reference, "Your transfer reference")}
       ${heading("Your transfer", 4)}
       ${table(transferRows(t))}
       ${contactBlock(reference)}`
    ),
    text: [
      `Thank you, ${t.fullName}. We have received your airport transfer request.`,
      `Reference: ${reference}`,
      `Pick-up: ${t.pickupLocation}`,
      `Drop-off: ${t.dropoffLocation}`,
      `Date: ${prettyDate(t.date)}`,
      `Time: ${prettyTime(t.time)}`,
      `Flight number: ${t.flightNumber || "Not provided"}`,
      `Passengers: ${t.passengers}`,
      "",
      `Our team will confirm the vehicle, price and driver details shortly. ${NOT_CHARGED}`,
      `Questions? WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}.`,
      `${SITE.name}, ${SITE.address}`,
    ].join("\n"),
  };

  const wa = guestWhatsappLink(
    t.phone,
    `Hello ${t.fullName}, this is ${SITE.name} about your airport transfer request ${reference} (${route}, ${t.date} at ${t.time}).`
  );
  const ownerMail: Mail = {
    subject: `New airport transfer ${reference}: ${prettyDate(t.date)}, ${t.time}`,
    html: layout(
      `${t.fullName}: ${route} on ${t.date} at ${t.time}.`,
      "New airport transfer request",
      `${referenceStrip(reference)}
       ${heading("Guest", 0)}
       ${guestRows(t)}
       ${heading("Transfer")}
       ${table([...transferRows(t), row("Received", esc(submittedAt.toUTCString()))])}
       <div style="margin-top:26px;">
         ${button(wa, "Reply on WhatsApp", "gold")}${button(`mailto:${t.email}?subject=${encodeURIComponent(`Your airport transfer ${reference}`)}`, "Reply by email", "green")}
       </div>
       <p style="margin:14px 0 0;font-size:12px;color:${C.muted};">The guest has been sent a confirmation email with this reference.</p>`
    ),
    text: [
      `New airport transfer request ${reference}`,
      `Name: ${t.fullName}`,
      `Email: ${t.email}`,
      `Phone: ${t.phone}`,
      `Pick-up: ${t.pickupLocation}`,
      `Drop-off: ${t.dropoffLocation}`,
      `Date: ${prettyDate(t.date)}`,
      `Time: ${prettyTime(t.time)}`,
      `Flight number: ${t.flightNumber || "Not provided"}`,
      `Passengers: ${t.passengers}`,
      `WhatsApp: ${wa}`,
    ].join("\n"),
  };

  return { owner: ownerMail, guest: guestMail };
}

/* ------------------------------------------------------------------ */
/* Custom tour planner                                                 */
/* ------------------------------------------------------------------ */

export interface CustomTourEmailData {
  reference: string; // CET-CT-XXXX
  plan: CustomTourInput;
  submittedAt: Date;
}

function travellersLabel(p: CustomTourInput): string {
  const adults = `${p.adults} ${p.adults === 1 ? "adult" : "adults"}`;
  if (p.children === 0) return adults;
  return `${adults}, ${p.children} ${p.children === 1 ? "child" : "children"}`;
}

function planRows(p: CustomTourInput): string[] {
  const nights = daysBetween(p.arrivalDate, p.departureDate);
  return [
    row("Arrival", esc(prettyDate(p.arrivalDate))),
    row("Departure", esc(prettyDate(p.departureDate))),
    row("Length of stay", `${nights} ${nights === 1 ? "night" : "nights"}`),
    row("Travellers", esc(travellersLabel(p))),
    row("Interests", chips(p.interests)),
  ];
}

export function buildCustomTourEmails(data: CustomTourEmailData): MailPair {
  const { reference, plan: p, submittedAt } = data;
  const nights = daysBetween(p.arrivalDate, p.departureDate);

  const guestMail: Mail = {
    subject: `Your custom tour request ${reference} | ${SITE.name}`,
    html: layout(
      `We received your custom tour request. Reference ${reference}.`,
      `Thank you, ${firstName(p.fullName)}. We have your trip details.`,
      `${paragraph(
        `We have received your custom tour request. Our team will design a route around your dates and interests and send you a suggested itinerary and price. ${NOT_CHARGED}`
      )}
       ${referenceBanner(reference, "Your custom tour reference")}
       ${heading("Your trip", 4)}
       ${table([
         ...planRows(p),
         p.notes ? row("Your notes", multiline(p.notes)) : "",
       ])}
       ${contactBlock(reference)}`
    ),
    text: [
      `Thank you, ${p.fullName}. We have received your custom tour request.`,
      `Reference: ${reference}`,
      `Arrival: ${prettyDate(p.arrivalDate)}`,
      `Departure: ${prettyDate(p.departureDate)} (${nights} ${nights === 1 ? "night" : "nights"})`,
      `Travellers: ${travellersLabel(p)}`,
      `Interests: ${p.interests.join(", ")}`,
      p.notes ? `Your notes: ${p.notes}` : "",
      "",
      `Our team will send a suggested itinerary and price. ${NOT_CHARGED}`,
      `Questions? WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}.`,
      `${SITE.name}, ${SITE.address}`,
    ]
      .filter((l) => l !== "")
      .join("\n"),
  };

  const wa = guestWhatsappLink(
    p.phone,
    `Hello ${p.fullName}, this is ${SITE.name} about your custom tour request ${reference}.`
  );
  const ownerMail: Mail = {
    subject: `New custom tour request ${reference}: ${p.interests.join(", ")}`,
    html: layout(
      `${p.fullName}: ${nights} nights from ${p.arrivalDate}, ${travellersLabel(p)}.`,
      "New custom tour request",
      `${referenceStrip(reference)}
       ${heading("Guest", 0)}
       ${guestRows(p)}
       ${heading("Trip")}
       ${table([
         ...planRows(p),
         row("Notes", p.notes ? multiline(p.notes) : "None"),
         row("Received", esc(submittedAt.toUTCString())),
       ])}
       <div style="margin-top:26px;">
         ${button(wa, "Reply on WhatsApp", "gold")}${button(`mailto:${p.email}?subject=${encodeURIComponent(`Your custom tour ${reference}`)}`, "Reply by email", "green")}
       </div>
       <p style="margin:14px 0 0;font-size:12px;color:${C.muted};">The guest has been sent a confirmation email with this reference.</p>`
    ),
    text: [
      `New custom tour request ${reference}`,
      `Name: ${p.fullName}`,
      `Email: ${p.email}`,
      `Phone: ${p.phone}`,
      `Arrival: ${prettyDate(p.arrivalDate)}`,
      `Departure: ${prettyDate(p.departureDate)} (${nights} ${nights === 1 ? "night" : "nights"})`,
      `Travellers: ${travellersLabel(p)}`,
      `Interests: ${p.interests.join(", ")}`,
      `Notes: ${p.notes || "None"}`,
      `WhatsApp: ${wa}`,
    ].join("\n"),
  };

  return { owner: ownerMail, guest: guestMail };
}
