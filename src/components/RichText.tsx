import type { ReactNode } from "react";

/** Turns **bold** markers into <strong> elements. Everything else stays plain text. */
export function renderBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ceylon-deep">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Renders plain text with blank-line paragraph breaks and **bold** spans.
export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? "text-lg leading-relaxed text-ceylon-ink" : "mt-4 leading-relaxed text-ceylon-ink/75"}>
          {renderBold(p)}
        </p>
      ))}
    </div>
  );
}
