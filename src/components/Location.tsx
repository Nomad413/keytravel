import { useState } from "react";
import { countryOf, flagEmoji, mapEmbedUrl, mapLinkUrl } from "../lib/geo";

// A location string prefixed with its country flag (falls back to a pin).
export function LocationLabel({
  location,
  className = "",
  showCountry = false,
}: {
  location?: string;
  className?: string;
  showCountry?: boolean;
}) {
  if (!location) return null;
  const country = countryOf(location);
  const flag = country ? flagEmoji(country.code) : "📍";
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span aria-hidden>{flag}</span>
      <span>{location}</span>
      {showCountry && country && (
        <span className="text-slate-400">· {country.name}</span>
      )}
    </span>
  );
}

// Just the flag emoji for a location (empty string when unknown).
export function Flag({ location }: { location?: string }) {
  const country = countryOf(location);
  if (!country) return null;
  return (
    <span aria-hidden title={country.name}>
      {flagEmoji(country.code)}
    </span>
  );
}

// A collapsible, embedded map preview for any location/address. Uses Google
// Maps embed (no API key) and only mounts the iframe once expanded.
export function MapPreview({
  query,
  label,
  defaultOpen = false,
}: {
  query?: string;
  label?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!query) return null;

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {label ?? "Map"}
          <span className="text-slate-400">{open ? "▲" : "▼"}</span>
        </button>
        <a
          href={mapLinkUrl(query)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          Open in Maps →
        </a>
      </div>
      {open && (
        <iframe
          title={`Map of ${query}`}
          src={mapEmbedUrl(query)}
          className="h-44 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}
