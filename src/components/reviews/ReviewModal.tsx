"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { Field, ReferenceCard, inputClass } from "@/components/forms/ui";
import { REVIEW_LIMITS, type ReviewField } from "@/lib/review";
import { COUNTRY_SUGGESTIONS } from "./countries";
import StarRatingInput from "./StarRatingInput";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<ReviewField, string>>;

const EMPTY = {
  name: "",
  country: "",
  rating: 0,
  text: "",
  website: "", // honeypot, must stay empty
};

export default function ReviewModal({ open, onClose }: ReviewModalProps) {
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
  const [result, setResult] = useState<{ reference: string; devMode: boolean; rating: number } | null>(null);

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

  // After a successful submit, start fresh next time the modal opens.
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
    (key: "name" | "country" | "text" | "website") =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (key !== "website" && errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    if (values.rating < 1) {
      setErrors({ rating: "Please choose a star rating." });
      return;
    }

    setStatus("submitting");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setResult({ reference: data.reference, devMode: Boolean(data.devMode), rating: values.rating });
        setStatus("success");
        return;
      }
      setErrors(data?.errors ?? {});
      setMessage(data?.message ?? "Something went wrong. Please try again in a moment.");
      setStatus("error");
    } catch {
      setMessage("We could not reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (!mounted) return null;

  const submitting = status === "submitting";
  const remaining = REVIEW_LIMITS.textMax - values.text.length;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="review-overlay"
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
                  {status === "success" ? "Thank you" : "Write a review"}
                </h2>
                <p className="mt-1 text-sm text-emerald-100/80">
                  {status === "success" ? "Your review has reached our team." : "Tell future guests about your trip."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close review form"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "success" && result ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-ceylon-deep" aria-hidden="true" />
                <p className="mt-4 text-sm text-slate-600">Your review reference</p>
                <div className="mt-2">
                  <ReferenceCard reference={result.reference} />
                </div>
                <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-slate-600">
                  {result.devMode
                    ? "Local development: SMTP is not set up, so the review was printed to the server console."
                    : result.rating === 5
                      ? "Thank you for the kind words. Our team checks every review before it appears on the website."
                      : "Thank you for your honest feedback. Our team reads every review personally and will use it to improve."}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 rounded-full border border-slate-300 px-7 py-3.5 text-sm font-semibold text-ceylon-ink transition hover:bg-slate-50"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
                {message && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {message}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={`${uid}-name`} label="Your name" error={errors.name}>
                    <input
                      ref={firstFieldRef}
                      id={`${uid}-name`}
                      type="text"
                      required
                      minLength={2}
                      maxLength={REVIEW_LIMITS.nameMax}
                      autoComplete="name"
                      value={values.name}
                      onChange={update("name")}
                      aria-invalid={Boolean(errors.name)}
                      className={inputClass()}
                    />
                  </Field>
                  <Field id={`${uid}-country`} label="Country" error={errors.country}>
                    <input
                      id={`${uid}-country`}
                      type="text"
                      required
                      minLength={2}
                      maxLength={REVIEW_LIMITS.countryMax}
                      autoComplete="country-name"
                      list={`${uid}-countries`}
                      value={values.country}
                      onChange={update("country")}
                      aria-invalid={Boolean(errors.country)}
                      className={inputClass()}
                    />
                    <datalist id={`${uid}-countries`}>
                      {COUNTRY_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                </div>

                <StarRatingInput
                  name={`${uid}-rating`}
                  value={values.rating}
                  onChange={(rating) => {
                    setValues((v) => ({ ...v, rating }));
                    if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
                  }}
                  error={errors.rating}
                />

                <Field
                  id={`${uid}-text`}
                  label="Your review"
                  error={errors.text}
                  hint={`${Math.max(remaining, 0)} characters left. Tell us about your driver, route or favourite moment.`}
                >
                  <textarea
                    id={`${uid}-text`}
                    rows={5}
                    required
                    minLength={REVIEW_LIMITS.textMin}
                    maxLength={REVIEW_LIMITS.textMax}
                    value={values.text}
                    onChange={update("text")}
                    aria-invalid={Boolean(errors.text)}
                    aria-describedby={`${uid}-text-hint`}
                    className={`${inputClass()} resize-y`}
                  />
                </Field>

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
                      Sending your review...
                    </>
                  ) : (
                    "Submit review"
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Reviews are checked by our team before they are published. We never show your email, because we do not ask for it.
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
