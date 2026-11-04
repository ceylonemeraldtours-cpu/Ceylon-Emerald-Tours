import { getTourBySlug, isDayTour, type Tour } from "@/data/toursData";
import {
  earliestAllowedDate,
  isEmail,
  isIsoDate,
  isPhone,
  multiLine,
  oneLine,
  type ValidationResult,
} from "@/lib/validation";

// Server-side helpers for the tour booking API. Client components only import types from here.

export interface BookingInput {
  packageId: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string; // YYYY-MM-DD
  adults: number;
  /** Required for day tours, empty for multi-day tours. */
  pickupLocation: string;
  /** Optional. */
  notes: string;
}

export const MAX_BOOKING_ADULTS = 50;

/**
 * Total is always calculated on the server from the listed per-adult price. A total sent by the
 * browser is ignored, so nobody can book a tour at a price they made up.
 */
export function calculateTotal(target: Pick<BookingTarget, "price">, adults: number): number {
  return target.price * adults;
}

export type BookingField = keyof BookingInput;

export interface BookingTarget {
  id: string;
  type: Tour["type"];
  title: string;
  duration: string;
  price: number;
  originalPrice: number;
  path: string;
  /** Day tours ask the guest for a pickup location. */
  requiresPickup: boolean;
}

/** Looks the package up on the server so the client can never set its own title or price. */
export function resolveBookingTarget(id: string): BookingTarget | null {
  const tour = getTourBySlug(id);
  if (!tour) return null;
  return {
    id: tour.id,
    type: tour.type,
    title: tour.title,
    duration: tour.duration,
    price: tour.price,
    originalPrice: tour.originalPrice,
    path: `/packages/${tour.id}`,
    requiresPickup: isDayTour(tour),
  };
}

export function validateBooking(
  raw: unknown,
  target: Pick<BookingTarget, "id" | "requiresPickup">
): ValidationResult<BookingInput, BookingField> {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<BookingField, string>> = {};

  const fullName = oneLine(body.fullName, 100);
  const email = oneLine(body.email, 254);
  const phone = oneLine(body.phone, 30);
  const travelDate = oneLine(body.travelDate, 10);
  const adults = Number(body.adults);
  const pickupLocation = target.requiresPickup ? oneLine(body.pickupLocation, 200) : "";
  const notes = multiLine(body.notes, 2000);

  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPhone(phone)) errors.phone = "Please enter a valid phone number, including your country code.";

  if (!isIsoDate(travelDate)) errors.travelDate = "Please choose your preferred travel date.";
  else if (travelDate < earliestAllowedDate()) errors.travelDate = "Travel date cannot be in the past.";

  if (!Number.isInteger(adults) || adults < 1 || adults > MAX_BOOKING_ADULTS) {
    errors.adults = `Number of adults must be between 1 and ${MAX_BOOKING_ADULTS}.`;
  }

  if (target.requiresPickup && pickupLocation.length < 2) {
    errors.pickupLocation = "Please tell us where we should pick you up.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: { packageId: target.id, fullName, email, phone, travelDate, adults, pickupLocation, notes },
  };
}
