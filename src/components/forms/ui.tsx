"use client";

import { useState, type ReactNode } from "react";
import { Check, CheckCircle2, Copy, MessageCircle, Minus, Plus } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

/** "light" sits on white (booking modal); "glass" sits on the dark emerald glass cards. */
export type Tone = "light" | "glass";

export function inputClass(tone: Tone = "light"): string {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 aria-[invalid=true]:border-red-400";
  return tone === "glass"
    ? `${base} border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-ceylon-glow focus:ring-ceylon-glow/40 [color-scheme:dark]`
    : `${base} border-slate-300 bg-white text-ceylon-ink placeholder:text-slate-400 focus:border-ceylon-gold focus:ring-ceylon-glow/50`;
}

export function todayLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD for the day after `iso` (local calendar math, no timezone drift). */
export function nextDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10);
}

export function Field({
  id,
  label,
  error,
  hint,
  tone = "light",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  tone?: Tone;
  children: ReactNode;
}) {
  const glass = tone === "glass";
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-sm font-medium ${glass ? "text-white/85" : "text-ceylon-ink"}`}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={`mt-1.5 text-xs ${glass ? "text-white/55" : "text-slate-500"}`}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={`mt-1.5 text-xs ${glass ? "text-red-300" : "text-red-600"}`}>
          {error}
        </p>
      )}
    </div>
  );
}

/** + / - counter. Buttons only, so the value is always a valid whole number in range. */
export function CounterField({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  error,
  tone = "glass",
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  error?: string;
  tone?: Tone;
}) {
  const glass = tone === "glass";
  const btn = `flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-35 ${
    glass ? "bg-white/10 text-white hover:bg-white/20" : "bg-ceylon-deep/10 text-ceylon-deep hover:bg-ceylon-deep/20"
  }`;
  return (
    <Field id={id} label={label} hint={hint} error={error} tone={tone}>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className={`flex items-center justify-between rounded-xl border px-2 py-1.5 ${
          glass ? "border-white/20 bg-white/10" : "border-slate-300 bg-white"
        }`}
      >
        <button
          type="button"
          className={btn}
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <output id={id} aria-live="polite" className={`min-w-[2ch] text-center text-base font-semibold ${glass ? "text-white" : "text-ceylon-ink"}`}>
          {value}
        </output>
        <button
          type="button"
          className={btn}
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </Field>
  );
}

/** The booking reference in gold on deep green, with a copy button. */
export function ReferenceCard({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; the reference is still visible */
    }
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-ceylon-glow/30 bg-ceylon-night px-5 py-3">
      <span className="font-display text-2xl font-semibold tracking-[0.15em] text-ceylon-glow">{reference}</span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy reference"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export interface SubmitOutcome {
  reference: string;
  guestEmailSent: boolean;
  devMode: boolean;
}

/** What the guest sees after a request goes through. Shared by the transfer form and the planner. */
export function FormSuccess({
  title,
  referenceLabel,
  outcome,
  email,
  followUp,
  whatsappMessage,
  resetLabel,
  onReset,
}: {
  title: string;
  referenceLabel: string;
  outcome: SubmitOutcome;
  email: string;
  /** What happens next, e.g. "confirm your driver". */
  followUp: string;
  whatsappMessage: string;
  resetLabel: string;
  onReset: () => void;
}) {
  return (
    <div className="px-2 py-6 text-center sm:px-6 sm:py-10" role="status">
      <CheckCircle2 className="mx-auto h-14 w-14 text-ceylon-glow" aria-hidden="true" />
      <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      <p className="mt-5 text-sm text-white/70">{referenceLabel}</p>
      <div className="mt-2">
        <ReferenceCard reference={outcome.reference} />
      </div>

      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/75">
        {outcome.devMode
          ? "Local development: SMTP is not set up, so the emails were printed to the server console."
          : outcome.guestEmailSent
            ? `We have emailed a confirmation to ${email}. Our team will ${followUp}.`
            : "Your request reached our team, but we could not send the confirmation email. Please save this reference. We will contact you soon."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={whatsappLink(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-gold">
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
        <button type="button" onClick={onReset} className="btn-glass">
          {resetLabel}
        </button>
      </div>
    </div>
  );
}

/** Red banner for form-level errors on glass cards. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
      {children}
    </p>
  );
}
