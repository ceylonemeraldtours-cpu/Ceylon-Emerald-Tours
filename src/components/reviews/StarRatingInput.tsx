"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"] as const;

interface StarRatingInputProps {
  /** Unique name for the radio group (also used for element ids). */
  name: string;
  value: number;
  onChange: (next: number) => void;
  error?: string;
}

/**
 * 1 to 5 star picker built on native radio inputs, so keyboard (arrow keys), screen readers and
 * form semantics work without extra code. Stars fill on hover and on selection.
 */
export default function StarRatingInput({ name, value, onChange, error }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1.5 block text-sm font-medium text-ceylon-ink">Your rating</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            onMouseEnter={() => setHover(n)}
            className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ceylon-gold"
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
              aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${LABELS[n - 1]}`}
            />
            <Star
              aria-hidden="true"
              className={`h-9 w-9 transition ${
                n <= shown ? "fill-ceylon-glow text-ceylon-gold" : "fill-transparent text-slate-300"
              }`}
            />
          </label>
        ))}
        <span className="ml-2 min-w-[5.5rem] text-sm font-medium text-ceylon-deep" aria-live="polite">
          {shown > 0 ? LABELS[shown - 1] : ""}
        </span>
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
