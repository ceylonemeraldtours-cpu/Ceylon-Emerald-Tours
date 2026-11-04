"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import {
  OPEN_PREFERENCES_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from "@/lib/cookieConsent";

const CATEGORIES = [
  {
    key: "necessary",
    title: "Essential",
    text: "Keep the site working, for example remembering your cookie choice. Always on.",
  },
  {
    key: "analytics",
    title: "Analytics",
    text: "Help us understand which pages are useful so we can improve the site.",
  },
  {
    key: "marketing",
    title: "Marketing",
    text: "Let us measure our adverts and show you relevant offers on other sites.",
  },
] as const;

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "border-transparent bg-gradient-to-r from-ceylon-glow to-ceylon-gold" : "border-white/25 bg-white/10"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/**
 * Bottom-anchored cookie banner. Hidden once a choice is saved in localStorage, and re-openable
 * from the footer ("Cookie settings"). Renders nothing on the server, so it never causes a
 * hydration mismatch.
 */
export default function CookieConsent() {
  const uid = useId();
  const titleId = `${uid}-title`;
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>({ analytics: false, marketing: false });

  // First visit: wait a moment so the banner never competes with the first paint.
  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      setChoice({ analytics: existing.analytics, marketing: existing.marketing });
      return;
    }
    const t = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  // Footer "Cookie settings" re-opens the banner with the saved choice and the options shown.
  useEffect(() => {
    const reopen = () => {
      const existing = readConsent();
      if (existing) setChoice({ analytics: existing.analytics, marketing: existing.marketing });
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen);
  }, []);

  const commit = (next: ConsentChoice) => {
    saveConsent(next);
    setChoice(next);
    setVisible(false);
    setShowPrefs(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
        >
          <div className="glass-dark mx-auto max-w-4xl rounded-2xl p-5 shadow-2xl shadow-black/40 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="flex gap-4">
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ceylon-deep to-ceylon-night text-ceylon-glow ring-1 ring-ceylon-glow/40 sm:flex">
                  <Cookie className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id={titleId} className="font-display text-base font-semibold sm:text-lg">
                    We value your privacy
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    We use essential cookies to make this site work. With your permission we would also use
                    analytics and marketing cookies to improve it. You can change your mind at any time from
                    &ldquo;Cookie settings&rdquo; in the footer.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowPrefs((v) => !v)}
                  aria-expanded={showPrefs}
                  aria-controls={`${uid}-prefs`}
                  className="btn-glass !px-6 !py-3"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={() => commit({ analytics: true, marketing: true })}
                  className="btn-gold !px-6 !py-3"
                >
                  Accept All
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showPrefs && (
                <motion.div
                  id={`${uid}-prefs`}
                  key="prefs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
                    {CATEGORIES.map((cat) => (
                      <li key={cat.key} className="flex items-center justify-between gap-4 py-3.5">
                        <div>
                          <p className="text-sm font-semibold">{cat.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-white/60">{cat.text}</p>
                        </div>
                        {cat.key === "necessary" ? (
                          <Toggle checked disabled label="Essential cookies, always on" />
                        ) : (
                          <Toggle
                            checked={choice[cat.key]}
                            onChange={(next) => setChoice((c) => ({ ...c, [cat.key]: next }))}
                            label={`${cat.title} cookies`}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => commit({ analytics: false, marketing: false })}
                      className="btn-glass !px-6 !py-3"
                    >
                      Essential only
                    </button>
                    <button type="button" onClick={() => commit(choice)} className="btn-gold !px-6 !py-3">
                      Save preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
