import type { TripType } from "../types";
import { tripAccent, tripTypeLabel } from "../lib/trip";
import { TripIcon } from "./icons";

export function TripTypeBadge({ type }: { type: TripType }) {
  const a = tripAccent[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${a.bg} ${a.text}`}
    >
      <TripIcon type={type} className="h-3.5 w-3.5" />
      {tripTypeLabel[type]}
    </span>
  );
}

export function TripTypeIconBadge({ type }: { type: TripType }) {
  const a = tripAccent[type];
  return (
    <span
      className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg text-white ${a.solid}`}
    >
      <TripIcon type={type} className="h-5 w-5" />
    </span>
  );
}
