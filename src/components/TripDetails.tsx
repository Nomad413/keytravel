import type { ReactNode } from "react";
import type { TravelRequest } from "../types";
import { cabinClassLabel, carClassLabel, roomTypeLabel } from "../lib/trip";
import { Flag, MapPreview } from "./Location";

const isBooked = (r: TravelRequest) =>
  r.status === "BOOKED" || r.status === "COMPLETED";

function ticketDataUrl(r: TravelRequest): string {
  const lines = [
    "KEY TRAVEL - E-TICKET / ITINERARY",
    "==================================",
    `Booking ID:   ${r.bookingReference ?? "-"}`,
    `Reference:    ${r.reference}`,
    `Passenger:    ${r.travelerName}`,
    `Airline:      ${r.airline ?? "-"} ${r.flightNumber ?? ""}`,
    `Route:        ${r.origin ?? "-"} -> ${r.destination}`,
    `Depart:       ${r.departDate ?? "-"} ${r.departTime ?? ""}`,
    `Arrive:       ${r.arriveTime ?? ""}`,
    `Return:       ${r.oneWay ? "One-way" : r.returnDate ?? "-"}`,
    `Cabin:        ${r.cabinClass ? cabinClassLabel[r.cabinClass] : "-"}`,
    "",
    "Please arrive at the airport at least 2 hours before departure.",
  ];
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    lines.join("\n")
  )}`;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}

const linkClass =
  "inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 hover:underline";

function mapTarget(req: TravelRequest): { query: string; label: string } {
  if (req.tripType === "HOTEL") {
    return {
      query: req.hotelAddress ?? `${req.hotelName ?? ""} ${req.destination}`.trim(),
      label: "Hotel location",
    };
  }
  if (req.tripType === "CAR") {
    return {
      query: req.pickupLocation
        ? `${req.pickupLocation}, ${req.destination}`
        : req.destination,
      label: "Pick-up location",
    };
  }
  return { query: req.destination, label: "Destination map" };
}

export function TripDetails({ req }: { req: TravelRequest }) {
  const booked = isBooked(req);
  const map = mapTarget(req);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Booking details
      </div>
      <dl className="text-sm">
        {req.tripType === "FLIGHT" && (
          <>
            <DetailRow
              label="Flight"
              value={`${req.airline ?? "—"} ${req.flightNumber ?? ""}`}
            />
            <DetailRow
              label="Route"
              value={
                <span className="inline-flex items-center gap-1">
                  {req.origin ?? "—"} → <Flag location={req.destination} />{" "}
                  {req.destination}
                </span>
              }
            />
            <DetailRow
              label="Departs"
              value={`${req.departDate ?? "—"} ${req.departTime ?? ""}`}
            />
            <DetailRow
              label="Arrives"
              value={`${req.arriveTime ?? "—"}${
                req.durationLabel ? ` · ${req.durationLabel}` : ""
              }`}
            />
            <DetailRow
              label="Stops"
              value={req.stops === 0 ? "Direct" : `${req.stops ?? "—"} stop(s)`}
            />
            <DetailRow
              label="Cabin"
              value={req.cabinClass ? cabinClassLabel[req.cabinClass] : "—"}
            />
          </>
        )}

        {req.tripType === "HOTEL" && (
          <>
            <DetailRow label="Hotel" value={req.hotelName ?? "—"} />
            <DetailRow
              label="Rating"
              value={req.hotelRating ? "★".repeat(req.hotelRating) : "—"}
            />
            <DetailRow
              label="Address"
              value={
                <span className="inline-flex items-center gap-1">
                  <Flag location={req.destination} /> {req.hotelAddress ?? "—"}
                </span>
              }
            />
            <DetailRow
              label="Stay"
              value={`${req.checkInDate ?? "—"} → ${req.checkOutDate ?? "—"}`}
            />
            <DetailRow
              label="Room"
              value={`${req.roomType ? roomTypeLabel[req.roomType] : "—"} · ${
                req.guests ?? 1
              } guest(s)`}
            />
            {req.hotelUrl && (
              <div className="pt-2">
                <a
                  className={linkClass}
                  href={req.hotelUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View hotel & map →
                </a>
              </div>
            )}
          </>
        )}

        {req.tripType === "CAR" && (
          <>
            <DetailRow
              label="Vehicle"
              value={`${req.carVendor ?? "—"} · ${req.carModel ?? ""}`}
            />
            <DetailRow
              label="Class"
              value={req.carClass ? carClassLabel[req.carClass] : "—"}
            />
            <DetailRow
              label="Pick-up"
              value={
                <span className="inline-flex items-center gap-1">
                  <Flag location={req.destination} /> {req.pickupLocation ?? "—"}
                </span>
              }
            />
            <DetailRow label="Drop-off" value={req.dropoffLocation ?? "—"} />
            <DetailRow
              label="Dates"
              value={`${req.pickupDate ?? "—"} → ${req.dropoffDate ?? "—"}`}
            />
          </>
        )}
      </dl>

      <MapPreview query={map.query} label={map.label} />

      {booked && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
          <div className="text-sm">
            <span className="text-slate-400">Booking ID: </span>
            <span className="font-semibold text-slate-800">
              {req.bookingReference}
            </span>
          </div>
          <div className="flex gap-3 text-sm">
            {req.tripType === "FLIGHT" && (
              <a
                className={linkClass}
                href={ticketDataUrl(req)}
                download={`ticket-${req.bookingReference ?? req.reference}.txt`}
              >
                Download ticket ↓
              </a>
            )}
            {req.tripType === "HOTEL" && req.hotelUrl && (
              <a
                className={linkClass}
                href={req.hotelUrl}
                target="_blank"
                rel="noreferrer"
              >
                Hotel voucher →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
