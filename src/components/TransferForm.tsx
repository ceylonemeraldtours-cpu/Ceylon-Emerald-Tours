"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";
import { MAX_TRANSFER_PASSENGERS, type TransferField } from "@/lib/transfer";
import { CounterField, Field, FormAlert, FormSuccess, inputClass, todayLocal, type SubmitOutcome } from "./forms/ui";

type Status = "idle" | "submitting" | "error" | "success";
type FieldErrors = Partial<Record<TransferField, string>>;

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  pickupLocation: "",
  dropoffLocation: "",
  date: "",
  time: "",
  flightNumber: "",
  website: "", // honeypot, must stay empty
};

/** Luxury glassmorphism airport transfer form. Posts to /api/transfer-inquiry (reference CET-TR-XXXX). */
export default function TransferForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [values, setValues] = useState(EMPTY);
  const [passengers, setPassengers] = useState(2);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);

  const update =
    (key: keyof typeof EMPTY) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key as TransferField]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const invalid = (key: TransferField) => Boolean(errors[key]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch("/api/transfer-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, passengers }),
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
      setErrors(data?.errors ?? {});
      setMessage(data?.message ?? "Something went wrong. Please try again or message us on WhatsApp.");
      setStatus("error");
    } catch {
      setMessage("We could not reach the server. Check your connection or message us on WhatsApp.");
      setStatus("error");
    }
  }

  function reset() {
    setValues(EMPTY);
    setPassengers(2);
    setErrors({});
    setMessage("");
    setOutcome(null);
    setStatus("idle");
  }

  if (status === "success" && outcome) {
    return (
      <FormSuccess
        title="Transfer request received"
        referenceLabel="Your transfer reference"
        outcome={outcome}
        email={values.email}
        followUp="confirm your vehicle, price and driver details"
        whatsappMessage={`Hello ${SITE.name}, my airport transfer reference is ${outcome.reference}.`}
        resetLabel="Book another transfer"
        onReset={reset}
      />
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Airport transfer request">
      {message && <FormAlert>{message}</FormAlert>}

      <Field id={id("name")} label="Full name" error={errors.fullName} tone="glass">
        <input
          id={id("name")}
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          value={values.fullName}
          onChange={update("fullName")}
          aria-invalid={invalid("fullName")}
          className={inputClass("glass")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("email")} label="Email" error={errors.email} tone="glass">
          <input
            id={id("email")}
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={update("email")}
            aria-invalid={invalid("email")}
            className={inputClass("glass")}
          />
        </Field>
        <Field id={id("phone")} label="Mobile / WhatsApp" error={errors.phone} tone="glass">
          <input
            id={id("phone")}
            type="tel"
            required
            autoComplete="tel"
            placeholder="+44 7700 900123"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={invalid("phone")}
            className={inputClass("glass")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={id("pickup")}
          label="Pickup location"
          error={errors.pickupLocation}
          hint="For example: Bandaranaike Airport (CMB)"
          tone="glass"
        >
          <input
            id={id("pickup")}
            type="text"
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            value={values.pickupLocation}
            onChange={update("pickupLocation")}
            aria-invalid={invalid("pickupLocation")}
            aria-describedby={`${id("pickup")}-hint`}
            className={inputClass("glass")}
          />
        </Field>
        <Field
          id={id("dropoff")}
          label="Drop-off location"
          error={errors.dropoffLocation}
          hint="Hotel name or address"
          tone="glass"
        >
          <input
            id={id("dropoff")}
            type="text"
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            value={values.dropoffLocation}
            onChange={update("dropoffLocation")}
            aria-invalid={invalid("dropoffLocation")}
            aria-describedby={`${id("dropoff")}-hint`}
            className={inputClass("glass")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("date")} label="Date" error={errors.date} tone="glass">
          <input
            id={id("date")}
            type="date"
            required
            min={todayLocal()}
            value={values.date}
            onChange={update("date")}
            aria-invalid={invalid("date")}
            className={inputClass("glass")}
          />
        </Field>
        <Field id={id("time")} label="Time" error={errors.time} tone="glass">
          <input
            id={id("time")}
            type="time"
            required
            value={values.time}
            onChange={update("time")}
            aria-invalid={invalid("time")}
            className={inputClass("glass")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={id("flight")}
          label="Flight number"
          error={errors.flightNumber}
          hint="Optional. Lets us track delays for arrivals."
          tone="glass"
        >
          <input
            id={id("flight")}
            type="text"
            maxLength={12}
            autoComplete="off"
            placeholder="UL 504"
            value={values.flightNumber}
            onChange={update("flightNumber")}
            aria-invalid={invalid("flightNumber")}
            aria-describedby={`${id("flight")}-hint`}
            className={`${inputClass("glass")} uppercase placeholder:normal-case`}
          />
        </Field>
        <CounterField
          id={id("passengers")}
          label="Number of passengers"
          value={passengers}
          min={1}
          max={MAX_TRANSFER_PASSENGERS}
          onChange={setPassengers}
          error={errors.passengers}
        />
      </div>

      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update("website")} />
        </label>
      </div>

      <button type="submit" disabled={submitting} className="btn-gold w-full text-base disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending your request...
          </>
        ) : (
          "Request my transfer"
        )}
      </button>

      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-white/60">
        Nothing is charged now. Prefer to chat?
        <a
          href={`https://wa.me/${SITE.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-ceylon-glow underline-offset-2 hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp {SITE.phoneDisplay}
        </a>
      </p>
    </form>
  );
}
