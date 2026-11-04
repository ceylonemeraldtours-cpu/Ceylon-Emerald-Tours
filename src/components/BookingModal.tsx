"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { MAX_BOOKING_ADULTS, calculateTotal, type BookingField } from "@/lib/booking";
import { SITE, whatsappLink } from "@/lib/constants";
import { formatUSD } from "@/data/toursData";
import { Field, ReferenceCard, inputClass, todayLocal } from "./forms/ui";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  packageId: string;
  packageTitle: string;
  /** Short line under the title, e.g. "4 Days, from $300 per adult". */
  summary?: string;
  /** Listed price per adult in USD. The total shown here is a preview; the server recalculates it. */
  pricePerAdult: number;
  /** Day tours ask for a pickup location. */
  requiresPickup?: boolean;
}

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<BookingField, string>>;

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  travelDate: "",
  adults: "2",
  pickupLocation: "",
  notes: "",
  website: "", // honeypot, must stay empty
};

export default function BookingModal({
  open,
  onClose,
  packageId,
  packageTitle,
  summary,
  pricePerAdult,
  requiresPickup = false,
}: BookingModalProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // keeps the effect below from re-running when the parent re-renders

  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ reference: string; guestEmailSent: boolean; devMode: boolean } | null>(null);

  useEffect(() => setMounted(true), []);

  // Lock page scroll, trap focus, close on Escape, and restore focus on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 80);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea, select'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  // After a successful booking, start fresh next time the modal opens.
  useEffect(() => {
    if (!open && status === "success") {
      const t = window.setTimeout(() => {
        setValues(EMPTY);
        setResult(null);
        setStatus("idle");
        setMessage("");
      }, 300);
      return () => window.clearTimeout(t);
    }
  }, [open, status]);

  const update =
    (key: keyof typeof EMPTY) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key as BookingField]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, adults: Number(values.adults), packageId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setResult({
          reference: data.reference,
          guestEmailSent: Boolean(data.guestEmailSent),
          devMode: Boolean(data.devMode),
        });
        setStatus("success");
        return;
      }
      setErrors(data?.errors ?? {});
      setMessage(data?.message ?? "Something went wrong. Please try again or message us on WhatsApp.");
      setStatus("error");
    } catch {
      setMessage("We could not reach the server. Check your connection or message us on WhatsApp.");
      setStatus("error");
    }
  }

  if (!mounted) return null;

  const submitting = status === "submitting";
  const adultsCount = Number(values.adults);
  const total = Number.isInteger(adultsCount) && adultsCount >= 1 ? calculateTotal({ price: pricePerAdult }, adultsCount) : null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="booking-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ceylon-night/75 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-h-[94svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white text-ceylon-ink shadow-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-4 border-ceylon-glow bg-ceylon-night px-6 py-5 text-white">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold">
                  {status === "success" ? "Request received" : "Book this tour"}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/80">{packageTitle}</p>
                {summary && <p className="text-xs text-ceylon-glow">{summary}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking form"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "success" && result ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-ceylon-deep" />
                <p className="mt-4 text-sm text-slate-600">Your booking reference</p>
                <div className="mt-2">
                  <ReferenceCard reference={result.reference} />
                </div>

                <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-slate-600">
                  {result.devMode
                    ? "Local development: SMTP is not set up, so the emails were printed to the server console."
                    : result.guestEmailSent
                      ? `We have emailed a confirmation to ${values.email}. Our team will contact you soon to confirm availability and payment details.`
                      : "Your request reached our team, but we could not send the confirmation email. Please save this reference. We will contact you soon."}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href={whatsappLink(`Hello ${SITE.name}, my booking reference is ${result.reference}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-slate-300 px-7 py-3.5 text-sm font-semibold text-ceylon-ink transition hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
                {message && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {message}
                  </p>
                )}

                <Field id={`${uid}-name`} label="Full name" error={errors.fullName}>
                  <input
                    ref={firstFieldRef}
                    id={`${uid}-name`}
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={values.fullName}
                    onChange={update("fullName")}
                    aria-invalid={Boolean(errors.fullName)}
                    className={inputClass()}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={`${uid}-email`} label="Email" error={errors.email}>
                    <input
                      id={`${uid}-email`}
                      type="email"
                      required
                      autoComplete="email"
                      value={values.email}
                      onChange={update("email")}
                      aria-invalid={Boolean(errors.email)}
                      className={inputClass()}
                    />
                  </Field>
                  <Field id={`${uid}-phone`} label="Phone / WhatsApp" error={errors.phone}>
                    <input
                      id={`${uid}-phone`}
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+44 7700 900123"
                      value={values.phone}
                      onChange={update("phone")}
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClass()}
                    />
                  </Field>
                </div>

                {requiresPickup && (
                  <Field
                    id={`${uid}-pickup`}
                    label="Pickup location"
                    error={errors.pickupLocation}
                    hint="Your hotel or the address where we should collect you."
                  >
                    <input
                      id={`${uid}-pickup`}
                      type="text"
                      required
                      minLength={2}
                      maxLength={200}
                      autoComplete="off"
                      placeholder="Hotel name or address"
                      value={values.pickupLocation}
                      onChange={update("pickupLocation")}
                      aria-invalid={Boolean(errors.pickupLocation)}
                      aria-describedby={`${uid}-pickup-hint`}
                      className={inputClass()}
                    />
                  </Field>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={`${uid}-date`} label="Preferred travel date" error={errors.travelDate}>
                    <input
                      id={`${uid}-date`}
                      type="date"
                      required
                      min={todayLocal()}
                      value={values.travelDate}
                      onChange={update("travelDate")}
                      aria-invalid={Boolean(errors.travelDate)}
                      className={inputClass()}
                    />
                  </Field>
                  <Field id={`${uid}-adults`} label="Adults" error={errors.adults}>
                    <input
                      id={`${uid}-adults`}
                      type="number"
                      required
                      min={1}
                      max={MAX_BOOKING_ADULTS}
                      inputMode="numeric"
                      value={values.adults}
                      onChange={update("adults")}
                      aria-invalid={Boolean(errors.adults)}
                      className={inputClass()}
                    />
                  </Field>
                </div>

                <Field id={`${uid}-notes`} label="Notes (optional)" error={errors.notes}>
                  <textarea
                    id={`${uid}-notes`}
                    rows={3}
                    maxLength={2000}
                    placeholder="Dietary needs, hotel preferences, children, celebrations..."
                    value={values.notes}
                    onChange={update("notes")}
                    className={`${inputClass()} resize-y`}
                  />
                </Field>

                {total !== null && (
                  <div className="flex items-baseline justify-between rounded-xl bg-ceylon-mist px-4 py-3" aria-live="polite">
                    <span className="text-sm text-slate-600">
                      Total ({adultsCount} &times; {formatUSD(pricePerAdult)})
                    </span>
                    <span className="font-display text-xl font-semibold text-ceylon-deep">{formatUSD(total)}</span>
                  </div>
                )}

                {/* Honeypot: hidden from people, tempting for bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={update("website")}
                    />
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending your request...
                    </>
                  ) : (
                    "Send booking request"
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Nothing is charged now. We confirm availability and the final price with you first.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
