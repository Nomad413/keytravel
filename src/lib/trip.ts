import type {
  CabinClass,
  CarClass,
  RoomType,
  TravelRequestDraft,
  TripType,
} from "../types";

export const tripTypeLabel: Record<TripType, string> = {
  FLIGHT: "Flight",
  HOTEL: "Hotel",
  CAR: "Car rental",
};

export const cabinClassLabel: Record<CabinClass, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium economy",
  BUSINESS: "Business",
  FIRST: "First",
};

export const roomTypeLabel: Record<RoomType, string> = {
  STANDARD: "Standard",
  DELUXE: "Deluxe",
  SUITE: "Suite",
};

export const carClassLabel: Record<CarClass, string> = {
  ECONOMY: "Economy",
  COMPACT: "Compact",
  SUV: "SUV",
  PREMIUM: "Premium",
};

// Accent colour per trip type, used to give each type its own visual identity.
export const tripAccent: Record<
  TripType,
  { text: string; bg: string; border: string; ring: string; solid: string }
> = {
  FLIGHT: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-300",
    ring: "ring-sky-100",
    solid: "bg-sky-600",
  },
  HOTEL: {
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-300",
    ring: "ring-violet-100",
    solid: "bg-violet-600",
  },
  CAR: {
    text: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-300",
    ring: "ring-teal-100",
    solid: "bg-teal-600",
  },
};

function nightsBetween(a?: string, b?: string): number | null {
  if (!a || !b) return null;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export interface TripSummary {
  headline: string;
  dateLabel: string;
  rows: { label: string; value: string }[];
}

// Produce a type-aware summary used by the inbox, status, and audit screens.
export function getTripSummary(t: TravelRequestDraft): TripSummary {
  switch (t.tripType) {
    case "FLIGHT": {
      return {
        headline: `${t.origin || "—"} → ${t.destination || "—"}`,
        dateLabel: t.oneWay
          ? `${t.departDate || "—"} (one-way)`
          : `${t.departDate || "—"} → ${t.returnDate || "—"}`,
        rows: [
          { label: "Cabin", value: t.cabinClass ? cabinClassLabel[t.cabinClass] : "—" },
          { label: "Adults", value: String(t.adults ?? 1) },
          { label: "Trip", value: t.oneWay ? "One-way" : "Round trip" },
        ],
      };
    }
    case "HOTEL": {
      const nights = nightsBetween(t.checkInDate, t.checkOutDate);
      return {
        headline: `Stay in ${t.destination || "—"}`,
        dateLabel: `${t.checkInDate || "—"} → ${t.checkOutDate || "—"}`,
        rows: [
          { label: "Room", value: t.roomType ? roomTypeLabel[t.roomType] : "—" },
          { label: "Guests", value: String(t.guests ?? 1) },
          { label: "Nights", value: nights != null ? String(nights) : "—" },
        ],
      };
    }
    case "CAR": {
      const days = nightsBetween(t.pickupDate, t.dropoffDate);
      return {
        headline: `Car in ${t.destination || "—"}`,
        dateLabel: `${t.pickupDate || "—"} → ${t.dropoffDate || "—"}`,
        rows: [
          { label: "Class", value: t.carClass ? carClassLabel[t.carClass] : "—" },
          { label: "Pick-up", value: t.pickupLocation || "—" },
          { label: "Drop-off", value: t.dropoffLocation || "—" },
          { label: "Days", value: days != null ? String(days) : "—" },
        ],
      };
    }
  }
}

// Per-type required-field validation for enabling submission.
export function isTripValid(t: TravelRequestDraft): boolean {
  if (!t.destination.trim() || t.estimatedCost <= 0) return false;
  switch (t.tripType) {
    case "FLIGHT":
      return (
        !!t.origin?.trim() &&
        !!t.departDate &&
        (t.oneWay ? true : !!t.returnDate)
      );
    case "HOTEL":
      return !!t.checkInDate && !!t.checkOutDate;
    case "CAR":
      return (
        !!t.pickupLocation?.trim() && !!t.pickupDate && !!t.dropoffDate
      );
  }
}
