"use client";
import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function StarInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <input type="hidden" name={name} value={value || ""} />
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setValue(n)}
            onMouseEnter={() => setHover(n)}
            className="rounded-lg p-1 transition hover:scale-110"
          >
            <Star className={`size-9 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-slate-600">{LABELS[shown]}</span>
      </div>
    </div>
  );
}

export function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-sm text-muted">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`size-3.5 ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}
