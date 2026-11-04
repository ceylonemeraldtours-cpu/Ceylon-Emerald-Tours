import { multiLine, oneLine, type ValidationResult } from "@/lib/validation";

// Server-side helpers for the review API. Client components only import the constants and types.

export interface ReviewInput {
  name: string;
  country: string;
  rating: number; // whole number 1 to 5
  text: string;
}

export type ReviewField = keyof ReviewInput;

export const REVIEW_LIMITS = {
  nameMax: 60,
  countryMax: 60,
  textMin: 20,
  textMax: 1000,
} as const;

export function validateReview(raw: unknown): ValidationResult<ReviewInput, ReviewField> {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<ReviewField, string>> = {};

  const name = oneLine(body.name, REVIEW_LIMITS.nameMax);
  const country = oneLine(body.country, REVIEW_LIMITS.countryMax);
  const text = multiLine(body.text, REVIEW_LIMITS.textMax);
  const rating = Number(body.rating);

  if (name.length < 2) errors.name = "Please enter your name.";
  if (country.length < 2) errors.country = "Please tell us which country you are from.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Please choose a star rating.";
  if (text.length < REVIEW_LIMITS.textMin) {
    errors.text = `Please write at least ${REVIEW_LIMITS.textMin} characters about your trip.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, country, rating, text } };
}
