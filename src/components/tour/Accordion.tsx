"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { renderBold } from "../RichText";

export interface AccordionItem {
  title: string;
  /** Plain text; **double asterisks** render as bold. */
  content: string;
  /** Small badge before the title, e.g. "Day 1". */
  marker?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Indexes open on first render. */
  defaultOpen?: number[];
  /** Show the expand/collapse all toggle. */
  toggleAll?: boolean;
}

export default function Accordion({ items, defaultOpen = [0], toggleAll = true }: AccordionProps) {
  const uid = useId();
  const [open, setOpen] = useState<Set<number>>(new Set(defaultOpen));
  const allOpen = open.size === items.length;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      {toggleAll && items.length > 1 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(items.map((_, i) => i)))}
            className="rounded-full border border-ceylon-deep/25 px-4 py-1.5 text-sm font-medium text-ceylon-deep transition hover:border-ceylon-gold hover:text-ceylon-gold"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open.has(i);
          const panelId = `${uid}-panel-${i}`;
          const buttonId = `${uid}-button-${i}`;
          return (
            <li
              key={item.title + i}
              className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${
                isOpen ? "border-ceylon-gold/60 shadow-[0_0_28px_-8px_rgba(217,119,6,0.45)]" : "border-ceylon-deep/15"
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  {item.marker && (
                    <span className="shrink-0 rounded-full bg-gradient-to-br from-ceylon-deep to-ceylon-night px-3 py-1 text-xs font-semibold text-ceylon-glow">
                      {item.marker}
                    </span>
                  )}
                  <span className="flex-1 font-display text-base font-semibold text-ceylon-deep sm:text-lg">
                    {item.title}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ceylon-gold transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ceylon-ink/75 sm:text-base">{renderBold(item.content)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
