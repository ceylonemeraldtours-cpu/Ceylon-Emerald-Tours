"use client";

import { openCookiePreferences } from "@/lib/cookieConsent";

/** Footer link that re-opens the cookie banner so visitors can change or withdraw consent. */
export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      Cookie settings
    </button>
  );
}
