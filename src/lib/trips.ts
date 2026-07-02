import type { RequestStatus, TravelRequest, TripType } from "../types";

// A Trip is a first-class entity that groups one or more travel requests
// (any combination/number of flights, hotels and car rentals) that belong
// together. Requests are linked by `tripId`; a request without a `tripId`
// is treated as a single-request trip.

export interface Trip {
  id: string;
  name: string;
  orgId: string;
  currency: string;
  requests: TravelRequest[];
  travelers: string[];
  destinations: string[];
  typeCounts: Record<TripType, number>;
  totalCost: number; // excludes cancelled / rejected
  startDate?: string;
  endDate?: string;
  rollupStatus: RequestStatus;
  statusCounts: { status: RequestStatus; count: number }[];
  createdAt: string;
}

const startOf = (r: TravelRequest) =>
  r.departDate ?? r.checkInDate ?? r.pickupDate;
const endOf = (r: TravelRequest) =>
  r.returnDate ?? r.checkOutDate ?? r.dropoffDate ?? startOf(r);

// Order used to pick the single "headline" status for a trip badge.
const STATUS_PRIORITY: RequestStatus[] = [
  "PENDING",
  "APPROVED",
  "BOOKED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

export function deriveTripName(r: TravelRequest): string {
  const start = startOf(r);
  const label = start
    ? new Date(start).toLocaleString("en-GB", { month: "short", year: "numeric" })
    : "";
  return `${r.destination}${label ? ` — ${label}` : ""}`;
}

function buildTrip(id: string, reqs: TravelRequest[]): Trip {
  const first = reqs[0];
  const typeCounts: Record<TripType, number> = { FLIGHT: 0, HOTEL: 0, CAR: 0 };
  reqs.forEach((r) => (typeCounts[r.tripType] += 1));

  const active = reqs.filter(
    (r) => r.status !== "CANCELLED" && r.status !== "REJECTED"
  );
  const totalCost = active.reduce((s, r) => s + r.estimatedCost, 0);

  const starts = reqs.map(startOf).filter(Boolean).sort() as string[];
  const ends = reqs.map(endOf).filter(Boolean).sort() as string[];

  const statusCounts = STATUS_PRIORITY.map((status) => ({
    status,
    count: reqs.filter((r) => r.status === status).length,
  })).filter((s) => s.count > 0);

  const rollupStatus =
    STATUS_PRIORITY.find((s) => reqs.some((r) => r.status === s)) ?? first.status;

  const createdAt = reqs
    .map((r) => r.createdAt)
    .sort()
    .slice(-1)[0];

  return {
    id,
    name: first.tripName ?? deriveTripName(first),
    orgId: first.orgId,
    currency: first.currency,
    requests: [...reqs].sort((a, b) => a.tripType.localeCompare(b.tripType)),
    travelers: [...new Set(reqs.map((r) => r.travelerName))],
    destinations: [...new Set(reqs.map((r) => r.destination))],
    typeCounts,
    totalCost,
    startDate: starts[0],
    endDate: ends[ends.length - 1],
    rollupStatus,
    statusCounts,
    createdAt,
  };
}

export function groupTrips(requests: TravelRequest[]): Trip[] {
  const map = new Map<string, TravelRequest[]>();
  for (const r of requests) {
    const key = r.tripId ?? r.id;
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return [...map.entries()]
    .map(([id, reqs]) => buildTrip(id, reqs))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function tripDateRange(trip: Trip): string {
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
  if (!trip.startDate) return "Dates TBC";
  if (!trip.endDate || trip.endDate === trip.startDate) return fmt(trip.startDate);
  return `${fmt(trip.startDate)} → ${fmt(trip.endDate)}`;
}

// Whole-trip approval status derived from its member requests.
export type ApprovalRollup = "PENDING" | "APPROVED" | "REJECTED" | "PARTIAL";

export function approvalRollup(trip: Trip): ApprovalRollup {
  const active = trip.requests.filter((r) => r.status !== "CANCELLED");
  if (active.length === 0) return "REJECTED";
  if (active.some((r) => r.status === "PENDING")) return "PENDING";
  const approved = active.filter(
    (r) =>
      r.status === "APPROVED" || r.status === "BOOKED" || r.status === "COMPLETED"
  );
  const rejected = active.filter((r) => r.status === "REJECTED");
  if (rejected.length === 0) return "APPROVED";
  if (approved.length === 0) return "REJECTED";
  return "PARTIAL";
}

export const approvalRollupMeta: Record<
  ApprovalRollup,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending approval", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
  PARTIAL: {
    label: "Partially approved",
    className: "bg-indigo-100 text-indigo-700",
  },
};

export function tripComposition(trip: Trip): string {
  const parts: string[] = [];
  if (trip.typeCounts.FLIGHT) parts.push(`${trip.typeCounts.FLIGHT} flight`);
  if (trip.typeCounts.HOTEL) parts.push(`${trip.typeCounts.HOTEL} hotel`);
  if (trip.typeCounts.CAR) parts.push(`${trip.typeCounts.CAR} car`);
  return parts.join(" · ") || "No bookings";
}
