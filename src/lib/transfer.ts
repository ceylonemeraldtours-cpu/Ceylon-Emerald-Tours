import {
  earliestAllowedDate,
  isEmail,
  isIsoDate,
  isPhone,
  oneLine,
  type ValidationResult,
} from "@/lib/validation";

// Server-side helpers for the airport transfer API. Client components only import types from here.

export interface TransferInput {
  fullName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM, 24-hour
  /** Optional. Stored upper-case, e.g. "UL 504". */
  flightNumber: string;
  passengers: number;
}

export type TransferField = keyof TransferInput;

export const MAX_TRANSFER_PASSENGERS = 20;

export function validateTransfer(raw: unknown): ValidationResult<TransferInput, TransferField> {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<TransferField, string>> = {};

  const fullName = oneLine(body.fullName, 100);
  const email = oneLine(body.email, 254);
  const phone = oneLine(body.phone, 30);
  const pickupLocation = oneLine(body.pickupLocation, 200);
  const dropoffLocation = oneLine(body.dropoffLocation, 200);
  const date = oneLine(body.date, 10);
  const time = oneLine(body.time, 5);
  const flightNumber = oneLine(body.flightNumber, 12).toUpperCase();
  const passengers = Number(body.passengers);

  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPhone(phone)) errors.phone = "Please enter a valid mobile number, including your country code.";

  if (pickupLocation.length < 2) errors.pickupLocation = "Please tell us where we should pick you up.";
  if (dropoffLocation.length < 2) errors.dropoffLocation = "Please tell us where you are going.";
  else if (pickupLocation.toLowerCase() === dropoffLocation.toLowerCase()) {
    errors.dropoffLocation = "Drop-off should be different from pick-up.";
  }

  if (!isIsoDate(date)) errors.date = "Please choose your transfer date.";
  else if (date < earliestAllowedDate()) errors.date = "Transfer date cannot be in the past.";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) errors.time = "Please choose a pick-up time.";

  if (flightNumber && !/^[A-Z0-9][A-Z0-9 -]{1,10}$/.test(flightNumber)) {
    errors.flightNumber = "Flight numbers look like UL 504 or EK650.";
  }

  if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_TRANSFER_PASSENGERS) {
    errors.passengers = `Passengers must be between 1 and ${MAX_TRANSFER_PASSENGERS}. For larger groups, message us on WhatsApp.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: { fullName, email, phone, pickupLocation, dropoffLocation, date, time, flightNumber, passengers },
  };
}
