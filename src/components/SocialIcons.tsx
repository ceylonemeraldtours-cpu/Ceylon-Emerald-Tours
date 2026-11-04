type IconProps = { className?: string };

// lucide-react has no TripAdvisor glyph and has dropped brand icons in newer
// releases, so all three are inline SVGs. Swap in official brand assets if you have them.

export function TripAdvisorIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7.5" cy="13" r="3.5" />
      <circle cx="16.5" cy="13" r="3.5" />
      <circle cx="7.5" cy="13" r="1" fill="currentColor" />
      <circle cx="16.5" cy="13" r="1" fill="currentColor" />
      <path d="M2 10c2-3 6-5 10-5s8 2 10 5" />
      <path d="M12 13v2.5" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 8h2.5V5H14c-2.2 0-3.5 1.5-3.5 3.6V11H8v3h2.5v6h3v-6H16l.5-3h-3V9c0-.6.3-1 1-1z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
