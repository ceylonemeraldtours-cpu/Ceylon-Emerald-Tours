// Small server-side validation helpers shared by every form API.
// Client components only import types from the files that use these.

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Single-line text: strips line breaks and tabs, trims, and caps the length. */
export const oneLine = (v: unknown, max: number): string =>
  String(v ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);

/** Multi-line text: keeps line breaks, trims, and caps the length. */
export const multiLine = (v: unknown, max: number): string => String(v ?? "").trim().slice(0, max);

export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function isPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return /^[+()\d\s\-.]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
}

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-31). */
export function isIsoDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/**
 * Earliest date we accept. One day of slack covers visitors who are ahead of the server's
 * UTC date (Sri Lanka is UTC+5:30), so "today" on their calendar is never rejected.
 */
export function earliestAllowedDate(now = Date.now()): string {
  return new Date(now - DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(`${toIso}T00:00:00Z`).getTime() - new Date(`${fromIso}T00:00:00Z`).getTime()) / DAY_MS
  );
}

/** "Monday, 2 November 2026" */
export function prettyDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "14:30" -> "14:30 (2:30 PM)" */
export function prettyTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${hhmm} (${h12}:${String(m).padStart(2, "0")} ${suffix})`;
}

export type ValidationResult<TData, TField extends string> =
  | { ok: true; data: TData }
  | { ok: false; errors: Partial<Record<TField, string>> };
