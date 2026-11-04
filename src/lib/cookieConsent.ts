// Cookie consent storage. Client-side only: every function is safe to call during server
// rendering (it simply returns null / does nothing) and never throws if localStorage is blocked.

export const CONSENT_KEY = "cet-cookie-consent";
export const CONSENT_VERSION = 1;

/** Fired on window after the visitor saves a choice. Analytics code can listen for it. */
export const CONSENT_EVENT = "cet:cookie-consent";
/** Dispatch this (or call openCookiePreferences) to re-open the banner, e.g. from the footer. */
export const OPEN_PREFERENCES_EVENT = "cet:open-cookie-preferences";

export interface CookieConsent {
  version: number;
  /** Always true: needed for the site to work. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string; // ISO timestamp
}

export type ConsentChoice = Pick<CookieConsent, "analytics" | "marketing">;

/** The saved choice, or null if the visitor has not decided yet (or the stored value is invalid). */
export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent> | null;
    if (
      !parsed ||
      parsed.version !== CONSENT_VERSION ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}

/** Saves the choice and notifies listeners. If storage is blocked the choice lasts for this page view only. */
export function saveConsent(choice: ConsentChoice): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    savedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      /* private mode or blocked storage: the banner will simply ask again next visit */
    }
    window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_EVENT, { detail: consent }));
  }
  return consent;
}

export function openCookiePreferences(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
