import nodemailer, { type Transporter } from "nodemailer";
import { SITE, whatsappLink } from "@/lib/constants";
import type { BookingInput, BookingTarget } from "@/lib/booking";
import type { CustomTourInput } from "@/lib/customTour";
import type { ReviewInput } from "@/lib/review";
import type { TransferInput } from "@/lib/transfer";
import { daysBetween, prettyDate, prettyTime } from "@/lib/validation";

// Everything email lives in this file:
//   1. Transport      Nodemailer setup from EMAIL_SERVER_* / EMAIL_FROM, plus the dual-send helper
//   2. Layout         Emerald green and gold HTML building blocks
//   3. Templates      Booking, airport transfer and custom tour emails (guest + owner), review notice (owner)
//   4. Senders        sendBookingEmails / sendTransferEmails / sendCustomTourEmails / sendReviewEmail
//
// Server-only: import it from API routes, never from client components.

/* ========================= 1. Transport ========================= */

export interface Mail {
  subject: string;
  html: string;
  text: string;
}

export interface MailPair {
  owner: Mail;
  guest: Mail;
}

export interface SendResult {
  /** "console" means SMTP is not configured and the emails were only logged (local dev). */
  mode: "smtp" | "console";
  guestEmailSent: boolean;
}

function mailConfig() {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const port = Number(process.env.EMAIL_SERVER_PORT) || 587;
  if (!host || !user || !pass) return null;
  // EMAIL_FROM is optional. With Gmail it must be the authenticated address or one of its aliases.
  const from = process.env.EMAIL_FROM?.trim() || `"${SITE.name}" <${user}>`;
  return { host, port, user, pass, from };
}

let cached: { transporter: Transporter; from: string } | null = null;

function getTransport() {
  if (cached) return cached;
  const cfg = mailConfig();
  if (!cfg) return null;
  cached = {
    from: cfg.from,
    transporter: nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: cfg.user, pass: cfg.pass },
    }),
  };
  return cached;
}

/**
 * Sends the guest confirmation and the owner notification together.
 * - Owner email failing throws (the lead would otherwise be lost).
 * - Guest email failing does not throw; the result reports guestEmailSent: false.
 * - Without EMAIL_SERVER_* env vars, emails are logged to the console in development
 *   and an error is thrown in production.
 */
export async function deliver(mails: MailPair, guestAddress: string): Promise<SendResult> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured (set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD and EMAIL_FROM).");
    }
    console.log(
      [
        "",
        "[email:dev] EMAIL_SERVER_* env vars not set. Logging instead of sending.",
        `--- Owner email -> ${SITE.email}`,
        `Subject: ${mails.owner.subject}`,
        mails.owner.text,
        `--- Guest email -> ${guestAddress}`,
        `Subject: ${mails.guest.subject}`,
        mails.guest.text,
        "",
      ].join("\n")
    );
    return { mode: "console", guestEmailSent: true };
  }

  const from = transport.from;
  const [owner, guest] = await Promise.allSettled([
    transport.transporter.sendMail({
      from,
      to: SITE.email,
      replyTo: guestAddress,
      subject: mails.owner.subject,
      text: mails.owner.text,
      html: mails.owner.html,
    }),
    transport.transporter.sendMail({
      from,
      to: guestAddress,
      replyTo: SITE.email,
      subject: mails.guest.subject,
      text: mails.guest.text,
      html: mails.guest.html,
    }),
  ]);

  if (guest.status === "rejected") console.error("[email] Guest confirmation failed:", guest.reason);
  if (owner.status === "rejected") {
    console.error("[email] Owner notification failed:", owner.reason);
    throw new Error("Owner notification email failed.");
  }
  return { mode: "smtp", guestEmailSent: guest.status === "fulfilled" };
}

/**
 * Sends a single notification to the owner (no guest copy). Used for reviews, where the
 * visitor does not leave an email address.
 * - Failing to send throws, so the visitor is told to try again.
 * - Without EMAIL_SERVER_* env vars, the email is logged in development and an error is
 *   thrown in production (same behaviour as deliver()).
 */
export async function deliverToOwner(mail: Mail): Promise<SendResult> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured (set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD and EMAIL_FROM).");
    }
    console.log(
      [
        "",
        "[email:dev] EMAIL_SERVER_* env vars not set. Logging instead of sending.",
        `--- Owner email -> ${SITE.email}`,
        `Subject: ${mail.subject}`,
        mail.text,
        "",
      ].join("\n")
    );
    return { mode: "console", guestEmailSent: true };
  }

  await transport.transporter.sendMail({
    from: transport.from,
    to: SITE.email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
  // There is no guest email for reviews, so report true to keep the API response shape.
  return { mode: "smtp", guestEmailSent: true };
}

/* ========================= 2. Layout ========================= */

// Emerald green and gold, built with inline styles and tables so it holds up in Gmail, Outlook
// and Apple Mail.
const C = {
  night: "#022c22",
  deep: "#064e3b",
  gold: "#d97706",
  glow: "#fbbf24",
  ink: "#0f172a",
  mist: "#f1f5f9",
  mint: "#a7f3d0",
  body: "#334155",
  muted: "#64748b",
  rule: "#e2e8f0",
};

const esc = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const multiline = (v: string): string => esc(v).replace(/\r?\n/g, "<br>");

const money = (n: number): string => `$${n.toLocaleString("en-US")}`;

/** Digits-only WhatsApp number for a guest, tolerating "+", spaces and a leading "00". */
function whatsappDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

function guestWhatsappLink(phone: string, message: string): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(message)}`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.muted};font-size:14px;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.ink};font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}

function table(rows: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.filter(Boolean).join("")}</table>`;
}

function heading(text: string, topGap = 24): string {
  return `<h2 style="margin:${topGap}px 0 4px;font-size:16px;color:${C.deep};">${esc(text)}</h2>`;
}

function paragraph(html: string, bottom = 20): string {
  return `<p style="margin:0 0 ${bottom}px;font-size:15px;line-height:1.7;color:${C.body};">${html}</p>`;
}

function button(href: string, label: string, kind: "gold" | "green"): string {
  const bg = kind === "gold" ? C.glow : C.deep;
  const color = kind === "gold" ? C.night : "#ffffff";
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;background:${bg};color:${color};font-size:14px;font-weight:700;text-decoration:none;">${label}</a>`;
}

/** Interest or tag chips. */
function chips(items: readonly string[]): string {
  return items
    .map(
      (i) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;border:1px solid ${C.gold};background:#fffbeb;color:${C.deep};font-size:13px;font-weight:600;">${esc(i)}</span>`
    )
    .join("");
}

/** Big gold reference number on a deep-green panel. */
function referenceBanner(reference: string, caption: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:${C.night};border-radius:12px;border-top:3px solid ${C.glow};padding:20px;text-align:center;">
    <div style="font-size:12px;color:${C.mint};">${esc(caption)}</div>
    <div style="margin-top:6px;font-size:28px;font-weight:700;letter-spacing:3px;color:${C.glow};">${esc(reference)}</div>
  </td></tr></table>`;
}

/** Compact reference line for the owner's inbox. */
function referenceStrip(reference: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td style="background:${C.night};border-radius:12px;border-left:4px solid ${C.glow};padding:16px 20px;">
    <span style="font-size:12px;color:${C.mint};">Reference</span>
    <span style="margin-left:10px;font-size:20px;font-weight:700;letter-spacing:2px;color:${C.glow};">${esc(reference)}</span>
  </td></tr></table>`;
}

/** Contact block used in guest emails: WhatsApp first, because it is the fastest way to reach us. */
function contactBlock(reference: string): string {
  const wa = whatsappLink(`Hello ${SITE.name}, my reference is ${reference}.`);
  return `${heading("Need to talk to us?", 28)}
  ${paragraph(
    `Quote your reference when you get in touch. We reply fastest on WhatsApp at <a href="${esc(wa)}" style="color:${C.deep};font-weight:700;">${SITE.phoneDisplay}</a>.`,
    14
  )}
  ${button(wa, "Chat on WhatsApp", "gold")}${button(
    `mailto:${SITE.email}?subject=${encodeURIComponent(`Reference ${reference}`)}`,
    "Email us",
    "green"
  )}`;
}

function layout(preheader: string, title: string, inner: string): string {
  const wa = whatsappLink();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.mist};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:${C.night};padding:28px 32px;border-bottom:4px solid ${C.glow};">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;"><span style="color:${C.glow};">&#9670;</span>&nbsp; Ceylon <span style="color:${C.glow};">Emerald</span> Tours</div>
      <div style="margin-top:4px;font-size:13px;color:${C.mint};">Private tours and transfers across Sri Lanka</div>
    </td></tr>
    <tr><td style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.deep};">${esc(title)}</h1>
      ${inner}
    </td></tr>
    <tr><td style="background:${C.night};padding:22px 32px;color:${C.mint};font-size:12px;line-height:1.8;">
      ${esc(SITE.name)}<br>${esc(SITE.address)}<br>
      WhatsApp: <a href="${esc(wa)}" style="color:${C.glow};text-decoration:none;font-weight:600;">${SITE.phoneDisplay}</a> &nbsp;|&nbsp;
      <a href="tel:${SITE.phoneTel}" style="color:${C.glow};text-decoration:none;">Call</a> &nbsp;|&nbsp;
      <a href="mailto:${SITE.email}" style="color:${C.glow};text-decoration:none;">${SITE.email}</a>
    </td></tr>
  </table>
</td></tr>
</table></body></html>`;
}

/* ========================= 3. Templates ========================= */

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;
const NOT_CHARGED = "Nothing has been charged.";

const mailto = (address: string) => `<a href="mailto:${esc(address)}" style="color:${C.deep};">${esc(address)}</a>`;
const telLink = (phone: string) =>
  `<a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="color:${C.deep};">${esc(phone)}</a>`;

function guestRows(g: { fullName: string; email: string; phone: string; nationality?: string }): string {
  return table([
    row("Name", esc(g.fullName)),
    row("Email", mailto(g.email)),
    row("Phone / WhatsApp", telLink(g.phone)),
    g.nationality ? row("Nationality", esc(g.nationality)) : "",
  ]);
}

/* ------------------------------------------------------------------ */
/* Tour package booking                                                */
/* ------------------------------------------------------------------ */

export interface BookingEmailData {
  reference: string; // CET-BK-XXXX
  target: BookingTarget;
  guest: BookingInput;
  /** Calculated on the server: listed price per adult x adults. */
  totalPrice: number;
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
    row("Price", `${money(target.price)} per adult`),
    row("Preferred date", esc(prettyDate(guest.travelDate))),
    row("Adults", String(guest.adults)),
    row(
      "Total price",
      `<span style="color:${C.gold};font-size:16px;">${money(data.totalPrice)}</span> <span style="font-weight:400;color:${C.muted};font-size:12px;">(${guest.adults} &times; ${money(target.price)})</span>`
    ),
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
         guest.notes ? row("Your notes", multiline(guest.notes)) : "",
       ])}
       ${contactBlock(reference)}`
    ),
    text: [
      `Thank you, ${guest.fullName}. We have received your booking request.`,
      `Reference: ${reference}`,
      `Package: ${target.title} (${target.duration})`,
      `Preferred date: ${prettyDate(guest.travelDate)}`,
      `Adults: ${guest.adults}`,
      `Total price: ${money(data.totalPrice)} (${guest.adults} x ${money(target.price)})`,
      guest.pickupLocation ? `Pickup location: ${guest.pickupLocation}` : null,
      guest.notes ? `Your notes: ${guest.notes}` : null,
      "",
      `Our team will contact you soon to confirm availability, price and payment details. ${NOT_CHARGED}`,
      `Questions? WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}.`,
      `${SITE.name}, ${SITE.address}`,
    ]
      .filter((l): l is string => l !== null)
      .join("\n"),
  };

  const wa = guestWhatsappLink(
    guest.phone,
    `Hello ${guest.fullName}, this is ${SITE.name} about your booking request ${reference} for ${target.title}.`
  );
  const ownerMail: Mail = {
    subject: `New booking request ${reference}: ${target.title}`,
    html: layout(
      `${guest.fullName} wants ${target.title} on ${guest.travelDate} (${money(data.totalPrice)}).`,
      "New booking request",
      `${referenceStrip(reference)}
       ${heading("Guest", 0)}
       ${guestRows(guest)}
       ${heading("Request")}
       ${table([
         ...bookingRows(data),
         row("Notes", guest.notes ? multiline(guest.notes) : "None"),
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
      `Adults: ${guest.adults}`,
      `Total price: ${money(data.totalPrice)} (${guest.adults} x ${money(target.price)})`,
      guest.pickupLocation ? `Pickup location: ${guest.pickupLocation}` : null,
      `Notes: ${guest.notes || "None"}`,
      `WhatsApp: ${wa}`,
    ]
      .filter((l): l is string => l !== null)
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
      p.notes ? `Your notes: ${p.notes}` : null,
      "",
      `Our team will send a suggested itinerary and price. ${NOT_CHARGED}`,
      `Questions? WhatsApp ${SITE.phoneDisplay}, or email ${SITE.email}.`,
      `${SITE.name}, ${SITE.address}`,
    ]
      .filter((l): l is string => l !== null)
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
      `Nationality: ${p.nationality}`,
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

/* ------------------------------------------------------------------ */
/* Guest review (owner only)                                           */
/* ------------------------------------------------------------------ */

export interface ReviewEmailData {
  reference: string; // CET-RV-XXXX
  review: ReviewInput;
  submittedAt: Date;
}

const stars = (n: number): string => "\u2605".repeat(n) + "\u2606".repeat(5 - n);

export function buildReviewEmail(data: ReviewEmailData): Mail {
  const { reference, review: r, submittedAt } = data;
  const fiveStar = r.rating === 5;

  // Ready to paste into src/data/reviewsData.ts. JSON.stringify gives safe TypeScript string literals.
  const snippet = [
    "  {",
    `    id: ${JSON.stringify(reference.toLowerCase())},`,
    `    name: ${JSON.stringify(r.name)},`,
    `    country: ${JSON.stringify(r.country)},`,
    `    rating: ${r.rating},`,
    `    text: ${JSON.stringify(r.text)},`,
    `    date: ${JSON.stringify(submittedAt.toISOString().slice(0, 10))},`,
    "  },",
  ].join("\n");

  const status = fiveStar
    ? "Not published yet. To show it on the website, paste the snippet below into the REVIEWS list in src/data/reviewsData.ts."
    : `This is a ${r.rating}-star review, so it is private feedback. The website only shows 5-star reviews.`;

  return {
    subject: `New ${r.rating}-star review ${reference} from ${r.name}`,
    html: layout(
      `${r.name} (${r.country}) left a ${r.rating}-star review.`,
      "New guest review",
      `${referenceStrip(reference)}
       ${table([
         row("Name", esc(r.name)),
         row("Country", esc(r.country)),
         row("Rating", `<span style="color:${C.gold};font-size:18px;letter-spacing:2px;">${stars(r.rating)}</span> <span style="font-weight:400;color:${C.muted};font-size:12px;">(${r.rating} of 5)</span>`),
         row("Review", multiline(r.text)),
         row("Received", esc(submittedAt.toUTCString())),
       ])}
       <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:${C.body};">${esc(status)}</p>
       ${
         fiveStar
           ? `<pre style="margin:14px 0 0;padding:14px;border-radius:10px;background:${C.mist};color:${C.ink};font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${esc(snippet)}</pre>`
           : ""
       }`
    ),
    text: [
      `New ${r.rating}-star review ${reference}`,
      `Name: ${r.name}`,
      `Country: ${r.country}`,
      `Rating: ${r.rating} of 5`,
      `Review: ${r.text}`,
      "",
      status,
      fiveStar ? `\n${snippet}` : null,
    ]
      .filter((l): l is string => l !== null)
      .join("\n"),
  };
}

/* ========================= 4. Senders ========================= */

export const sendBookingEmails = (data: BookingEmailData): Promise<SendResult> =>
  deliver(buildBookingEmails(data), data.guest.email);

export const sendTransferEmails = (data: TransferEmailData): Promise<SendResult> =>
  deliver(buildTransferEmails(data), data.transfer.email);

export const sendCustomTourEmails = (data: CustomTourEmailData): Promise<SendResult> =>
  deliver(buildCustomTourEmails(data), data.plan.email);

export const sendReviewEmail = (data: ReviewEmailData): Promise<SendResult> =>
  deliverToOwner(buildReviewEmail(data));
