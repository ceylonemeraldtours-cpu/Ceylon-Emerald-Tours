"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Compass, Flower2, Landmark, Loader2, Mountain, PawPrint, Palmtree, type LucideIcon } from "lucide-react";
import { SITE } from "@/lib/constants";
import {
  CUSTOM_TOUR_LIMITS,
  INTERESTS,
  validateCustomTour,
  type CustomTourField,
  type Interest,
} from "@/lib/customTour";
import { CounterField, Field, FormAlert, FormSuccess, inputClass, nextDay, todayLocal, type SubmitOutcome } from "./forms/ui";

type Status = "idle" | "submitting" | "error" | "success";
type FieldErrors = Partial<Record<CustomTourField, string>>;

const STEPS = [
  { label: "Your trip", fields: ["arrivalDate", "departureDate", "adults", "children"] },
  { label: "Interests", fields: ["interests"] },
  { label: "About you", fields: ["fullName", "email", "phone", "nationality", "notes"] },
] as const satisfies readonly { label: string; fields: readonly CustomTourField[] }[];

const INTEREST_INFO: Record<Interest, { Icon: LucideIcon; text: string }> = {
  Beaches: { Icon: Palmtree, text: "Sun, sand and the south coast" },
  Culture: { Icon: Landmark, text: "Ancient cities and temples" },
  Wildlife: { Icon: PawPrint, text: "Safaris and national parks" },
  "Hill Country": { Icon: Mountain, text: "Tea estates, trains and viewpoints" },
  Ayurveda: { Icon: Flower2, text: "Wellness and traditional healing" },
  Adventure: { Icon: Compass, text: "Hiking, rafting and outdoor days" },
};

interface Values {
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  interests: Interest[];
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  notes: string;
  website: string; // honeypot, must stay empty
}

const EMPTY: Values = {
  arrivalDate: "",
  departureDate: "",
  adults: 2,
  children: 0,
  interests: [],
  fullName: "",
  email: "",
  phone: "",
  nationality: "",
  notes: "",
  website: "",
};

function nightsBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const n = Math.round((new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / 86_400_000);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Multi-step custom tour planner. Posts to /api/custom-inquiry (reference CET-CT-XXXX). */
export default function CustomTourPlanner() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMoved = useRef(false);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  // Move focus to the new step's heading so keyboard and screen reader users land at the top.
  useEffect(() => {
    if (!hasMoved.current) return;
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onText =
    (key: "arrivalDate" | "departureDate" | "fullName" | "email" | "phone" | "nationality" | "notes" | "website") =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, e.target.value);

  const toggleInterest = (interest: Interest) =>
    set(
      "interests",
      values.interests.includes(interest) ? values.interests.filter((i) => i !== interest) : [...values.interests, interest]
    );

  /** All validation errors for the current values, using the same rules as the server. */
  function allErrors(): FieldErrors {
    const result = validateCustomTour(values);
    return result.ok ? {} : result.errors;
  }

  function stepHasErrors(errs: FieldErrors, i: number): boolean {
    return STEPS[i].fields.some((f) => errs[f]);
  }

  function goTo(next: number) {
    hasMoved.current = true;
    setMessage("");
    setStep(next);
  }

  function next() {
    const errs = allErrors();
    if (stepHasErrors(errs, step)) {
      // Only surface this step's problems; later steps should not show errors before they are visited.
      const current: FieldErrors = {};
      for (const f of STEPS[step].fields) if (errs[f]) current[f] = errs[f];
      setErrors(current);
      return;
    }
    setErrors({});
    goTo(step + 1);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    if (step < STEPS.length - 1) {
      next(); // Enter on an earlier step moves on instead of sending
      return;
    }

    const errs = allErrors();
    const firstBad = STEPS.findIndex((_, i) => stepHasErrors(errs, i));
    if (firstBad !== -1) {
      setErrors(errs);
      if (firstBad !== step) goTo(firstBad);
      return;
    }

    setStatus("submitting");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/custom-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setOutcome({
          reference: data.reference,
          guestEmailSent: Boolean(data.guestEmailSent),
          devMode: Boolean(data.devMode),
        });
        setStatus("success");
        return;
      }
      const serverErrors: FieldErrors = data?.errors ?? {};
      setErrors(serverErrors);
      setMessage(data?.message ?? "Something went wrong. Please try again or message us on WhatsApp.");
      setStatus("error");
      const bad = STEPS.findIndex((_, i) => stepHasErrors(serverErrors, i));
      if (bad !== -1 && bad !== step) goTo(bad);
    } catch {
      setMessage("We could not reach the server. Check your connection or message us on WhatsApp.");
      setStatus("error");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setMessage("");
    setOutcome(null);
    setStatus("idle");
    hasMoved.current = false;
    setStep(0);
  }

  const shell = "glass relative mx-auto w-full max-w-3xl rounded-3xl p-6 shadow-2xl shadow-black/30 sm:p-8";

  if (status === "success" && outcome) {
    return (
      <div className={shell}>
        <FormSuccess
          title="Trip request received"
          referenceLabel="Your custom tour reference"
          outcome={outcome}
          email={values.email}
          followUp="send you a suggested itinerary and price"
          whatsappMessage={`Hello ${SITE.name}, my custom tour reference is ${outcome.reference}.`}
          resetLabel="Plan another trip"
          onReset={reset}
        />
      </div>
    );
  }

  const nights = nightsBetween(values.arrivalDate, values.departureDate);
  const today = todayLocal();
  const submitting = status === "submitting";
  const last = step === STEPS.length - 1;

  const travellers = `${values.adults} ${values.adults === 1 ? "adult" : "adults"}${
    values.children > 0 ? `, ${values.children} ${values.children === 1 ? "child" : "children"}` : ""
  }`;

  return (
    <MotionConfig reducedMotion="user">
      <form onSubmit={onSubmit} className={shell} aria-label="Custom tour planner" noValidate>
        {/* Progress */}
        <ol className="mb-8 flex items-center" aria-label="Planner progress">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`} aria-current={current ? "step" : undefined}>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    current
                      ? "bg-gradient-to-br from-ceylon-glow to-ceylon-gold text-ceylon-night"
                      : done
                        ? "bg-ceylon-glow/20 text-ceylon-glow ring-1 ring-ceylon-glow/50"
                        : "bg-white/10 text-white/60"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={`ml-3 hidden text-sm font-medium sm:block ${current ? "text-white" : "text-white/55"}`}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className={`mx-3 h-px flex-1 sm:mx-4 ${done ? "bg-ceylon-glow/60" : "bg-white/15"}`} />
                )}
              </li>
            );
          })}
        </ol>

        {message && (
          <div className="mb-6">
            <FormAlert>{message}</FormAlert>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
                    When are you travelling?
                  </h3>
                  <p className="mt-1 text-sm text-white/65">Choose your arrival and departure dates and who is coming.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id={id("arrival")} label="Arrival date" error={errors.arrivalDate} tone="glass">
                    <input
                      id={id("arrival")}
                      type="date"
                      min={today}
                      value={values.arrivalDate}
                      onChange={onText("arrivalDate")}
                      aria-invalid={Boolean(errors.arrivalDate)}
                      className={inputClass("glass")}
                    />
                  </Field>
                  <Field id={id("departure")} label="Departure date" error={errors.departureDate} tone="glass">
                    <input
                      id={id("departure")}
                      type="date"
                      min={values.arrivalDate ? nextDay(values.arrivalDate) : nextDay(today)}
                      value={values.departureDate}
                      onChange={onText("departureDate")}
                      aria-invalid={Boolean(errors.departureDate)}
                      className={inputClass("glass")}
                    />
                  </Field>
                </div>

                {nights && (
                  <p className="inline-flex rounded-full border border-ceylon-glow/40 bg-ceylon-glow/10 px-4 py-1.5 text-sm font-medium text-ceylon-glow">
                    {nights} {nights === 1 ? "night" : "nights"} in Sri Lanka
                  </p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <CounterField
                    id={id("adults")}
                    label="Adults"
                    hint="Aged 12 and over"
                    value={values.adults}
                    min={1}
                    max={CUSTOM_TOUR_LIMITS.maxAdults}
                    onChange={(n) => set("adults", n)}
                    error={errors.adults}
                  />
                  <CounterField
                    id={id("children")}
                    label="Children"
                    hint="Under 12"
                    value={values.children}
                    min={0}
                    max={CUSTOM_TOUR_LIMITS.maxChildren}
                    onChange={(n) => set("children", n)}
                    error={errors.children}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <fieldset className="min-w-0 space-y-5">
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
                    What do you want from the trip?
                  </h3>
                  <span className="mt-1 block text-sm font-normal text-white/65">Pick everything that appeals. We will build around it.</span>
                </legend>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {INTERESTS.map((interest) => {
                    const { Icon, text } = INTEREST_INFO[interest];
                    const checked = values.interests.includes(interest);
                    return (
                      <label key={interest} className="relative block cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={checked}
                          onChange={() => toggleInterest(interest)}
                          aria-describedby={errors.interests ? id("interests-error") : undefined}
                        />
                        <span className="flex h-full items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 transition duration-200 hover:border-ceylon-glow/50 hover:bg-white/10 peer-checked:border-ceylon-glow peer-checked:bg-ceylon-glow/15 peer-checked:shadow-[0_0_28px_-8px_rgba(251,191,36,0.6)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ceylon-glow">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              checked ? "bg-gradient-to-br from-ceylon-glow to-ceylon-gold text-ceylon-night" : "bg-white/10 text-ceylon-glow"
                            }`}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-base font-semibold">{interest}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-white/65">{text}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                              checked ? "border-ceylon-glow bg-ceylon-glow text-ceylon-night" : "border-white/30 text-transparent"
                            }`}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {errors.interests && (
                  <p id={id("interests-error")} role="alert" className="text-sm text-red-300">
                    {errors.interests}
                  </p>
                )}
              </fieldset>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
                    Where should we send your plan?
                  </h3>
                  <p className="mt-1 text-sm text-white/65">
                    {nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Your trip"}, {travellers}
                    {values.interests.length > 0 && `, ${values.interests.join(", ")}`}.
                  </p>
                </div>

                <Field id={id("name")} label="Full name" error={errors.fullName} tone="glass">
                  <input
                    id={id("name")}
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={values.fullName}
                    onChange={onText("fullName")}
                    aria-invalid={Boolean(errors.fullName)}
                    className={inputClass("glass")}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id={id("email")} label="Email" error={errors.email} tone="glass">
                    <input
                      id={id("email")}
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={onText("email")}
                      aria-invalid={Boolean(errors.email)}
                      className={inputClass("glass")}
                    />
                  </Field>
                  <Field id={id("phone")} label="Mobile / WhatsApp" error={errors.phone} tone="glass">
                    <input
                      id={id("phone")}
                      type="tel"
                      autoComplete="tel"
                      placeholder="+44 7700 900123"
                      value={values.phone}
                      onChange={onText("phone")}
                      aria-invalid={Boolean(errors.phone)}
                      className={inputClass("glass")}
                    />
                  </Field>
                </div>

                <Field id={id("nationality")} label="Nationality" error={errors.nationality} tone="glass">
                  <input
                    id={id("nationality")}
                    type="text"
                    autoComplete="country-name"
                    maxLength={60}
                    placeholder="e.g. British"
                    value={values.nationality}
                    onChange={onText("nationality")}
                    aria-invalid={Boolean(errors.nationality)}
                    className={inputClass("glass")}
                  />
                </Field>

                <Field id={id("notes")} label="Anything else we should know? (optional)" tone="glass">
                  <textarea
                    id={id("notes")}
                    rows={3}
                    maxLength={2000}
                    placeholder="Pace, hotel style, celebrations, dietary needs..."
                    value={values.notes}
                    onChange={onText("notes")}
                    className={`${inputClass("glass")} resize-y`}
                  />
                </Field>

                {/* Honeypot: hidden from people, tempting for bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onText("website")} />
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} disabled={submitting} className="btn-glass disabled:opacity-60">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          {/* Distinct keys matter: without them React reuses one <button> and flips its type to "submit"
              mid-click, which submits the form as the visitor arrives on the last step. */}
          {last ? (
            <button key="submit" type="submit" disabled={submitting} className="btn-gold disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending your request...
                </>
              ) : (
                "Send my trip request"
              )}
            </button>
          ) : (
            <button key="continue" type="button" onClick={next} className="btn-gold">
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {last && <p className="mt-4 text-center text-xs text-white/55">Nothing is charged now. We reply with a suggested itinerary and price.</p>}
      </form>
    </MotionConfig>
  );
}
