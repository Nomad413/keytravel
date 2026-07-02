import { useMemo, useRef, useState } from "react";
import { inputClass } from "./ui";

export interface Person {
  id: string;
  name: string;
  department: string;
}

// Multi-select traveler picker: type-ahead dropdown with auto-suggestions that
// adds travelers as removable chips. Supports selecting many travelers so an
// arranger can build one trip for a whole group.
export function TravelerMultiSelect({
  people,
  selected,
  onAdd,
  onRemove,
  onSelectAll,
  onClear,
  maxResults = 8,
}: {
  people: Person[];
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  maxResults?: number;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = people.filter((p) => !selected.includes(p.name));
    const matches = q
      ? available.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.department.toLowerCase().includes(q)
        )
      : available;
    return matches.slice(0, maxResults);
  }, [query, people, selected, maxResults]);

  const add = (name: string) => {
    onAdd(name);
    setQuery("");
    setHighlight(0);
    // Keep the dropdown open so more travelers can be added quickly.
    inputRef.current?.focus();
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
        add(filtered[highlight].name);
      }
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      onRemove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const deptOf = (name: string) =>
    people.find((p) => p.name === name)?.department ?? "";

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-2.5 pr-1 text-sm font-medium text-brand-700"
            >
              {name}
              <span className="text-xs text-brand-400">· {deptOf(name)}</span>
              <button
                type="button"
                onClick={() => onRemove(name)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-brand-500 hover:bg-brand-100 hover:text-brand-800"
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            className={`${inputClass} pr-8`}
            value={query}
            placeholder={
              selected.length === 0
                ? "Search travelers by name or department…"
                : "Add another traveler…"
            }
            onChange={(e) => {
              setQuery(e.target.value);
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
                  {selected.length === people.length
                    ? "All travelers added."
                    : "No matching travelers."}
                </li>
              ) : (
                filtered.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => add(p.name)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                        i === highlight
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.department}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>

      <div className="mt-2 flex gap-4 text-xs">
        <button
          type="button"
          className="font-medium text-brand-600 hover:underline"
          onClick={onSelectAll}
        >
          Select all ({people.length})
        </button>
        {selected.length > 0 && (
          <button
            type="button"
            className="font-medium text-slate-500 hover:underline"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
