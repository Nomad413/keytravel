import { useMemo, useRef, useState } from "react";
import { inputClass } from "./ui";
import { flagFor } from "../lib/geo";

// A text input with type-ahead auto-suggestions. Accepts free text too, so
// users can pick from the (large) option list or type their own value.
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  maxResults = 8,
  withFlags = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  maxResults?: number;
  withFlags?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    const matches = q
      ? options.filter((o) => o.toLowerCase().includes(q))
      : options;
    return matches.slice(0, maxResults);
  }, [value, options, maxResults]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[highlight]) {
        e.preventDefault();
        select(filtered[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          className={`${inputClass} pr-8`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          autoComplete="off"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">
                No matches — you can type a custom value.
              </li>
            ) : (
              filtered.map((option, i) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => select(option)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                      i === highlight
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {withFlags && <span>{flagFor(option) || "📍"}</span>}
                    <span className="truncate">{option}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
