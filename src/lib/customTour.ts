import {
  daysBetween,
  earliestAllowedDate,
  isEmail,
  isIsoDate,
  isPhone,
  multiLine,
  oneLine,
  type ValidationResult,
} from "@/lib/validation";

// Server-side helpers for the custom tour planner API. Client components only import from here
// what exists at runtime on both sides (INTERESTS, the limits) and types.

export const INTERESTS = ["Beaches", "Culture", "Wildlife", "Hill Country", "Ayurveda", "Adventure"] as const;
export type Interest = (typeof INTERESTS)[number];

export const CUSTOM_TOUR_LIMITS = {
  maxAdults: 20,
  maxChildren: 20,
  maxNights: 90,
} as const;

export interface CustomTourInput {
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  interests: Interest[];
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  notes: string;
}

export type CustomTourField = keyof CustomTourInput;

export function validateCustomTour(raw: unknown): ValidationResult<CustomTourInput, CustomTourField> {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<CustomTourField, string>> = {};

  const arrivalDate = oneLine(body.arrivalDate, 10);
  const departureDate = oneLine(body.departureDate, 10);
  const adults = Number(body.adults);
  const children = Number(body.children ?? 0);
  const fullName = oneLine(body.fullName, 100);
  const email = oneLine(body.email, 254);
  const phone = oneLine(body.phone, 30);
  const nationality = oneLine(body.nationality, 60);
  const notes = multiLine(body.notes, 2000);

  const rawInterests = Array.isArray(body.interests) ? body.interests : [];
  const interests = INTERESTS.filter((i) => rawInterests.includes(i));

  if (!isIsoDate(arrivalDate)) errors.arrivalDate = "Please choose your arrival date.";
  else if (arrivalDate < earliestAllowedDate()) errors.arrivalDate = "Arrival date cannot be in the past.";

  if (!isIsoDate(departureDate)) errors.departureDate = "Please choose your departure date.";
  else if (!errors.arrivalDate) {
    const nights = daysBetween(arrivalDate, departureDate);
    if (nights < 1) errors.departureDate = "Departure must be after your arrival date.";
    else if (nights > CUSTOM_TOUR_LIMITS.maxNights) {
      errors.departureDate = `For stays longer than ${CUSTOM_TOUR_LIMITS.maxNights} nights, please message us on WhatsApp.`;
    }
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > CUSTOM_TOUR_LIMITS.maxAdults) {
    errors.adults = `Adults must be between 1 and ${CUSTOM_TOUR_LIMITS.maxAdults}.`;
  }
  if (!Number.isInteger(children) || children < 0 || children > CUSTOM_TOUR_LIMITS.maxChildren) {
    errors.children = `Children must be between 0 and ${CUSTOM_TOUR_LIMITS.maxChildren}.`;
  }

  if (interests.length === 0) errors.interests = "Choose at least one interest so we know where to start.";

  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!isPhone(phone)) errors.phone = "Please enter a valid phone number, including your country code.";
  if (nationality.length < 2) errors.nationality = "Please tell us your nationality.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: { arrivalDate, departureDate, adults, children, interests, fullName, email, phone, nationality, notes },
  };
}
