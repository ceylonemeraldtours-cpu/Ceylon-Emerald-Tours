import { randomInt } from "crypto";

export type ReferenceKind = "booking" | "transfer" | "custom-tour" | "review";

// No 0/O or 1/I so references are easy to read out over the phone.
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function suffix(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) out += REF_CHARS[randomInt(REF_CHARS.length)];
  return out;
}

/**
 * - transfer    -> CET-TR-XXXX
 * - custom-tour -> CET-CT-XXXX
 * - booking     -> CET-BK-XXXX (tour package bookings)
 * - review      -> CET-RV-XXXX (guest reviews)
 *
 * References are not stored anywhere, so uniqueness is statistical, not guaranteed.
 */
export function generateReference(kind: ReferenceKind = "booking"): string {
  switch (kind) {
    case "transfer":
      return `CET-TR-${suffix()}`;
    case "custom-tour":
      return `CET-CT-${suffix()}`;
    case "review":
      return `CET-RV-${suffix()}`;
    default:
      return `CET-BK-${suffix()}`;
  }
}
