import { useEffect, useMemo, useState } from "react";
import { useApp } from "../state/store";
import type { TravelRequest } from "../types";
import { formatMoney } from "../lib/policy";
import { getTripSummary } from "../lib/trip";
import {
  groupTrips,
  tripComposition,
  tripDateRange,
  type Trip,
} from "../lib/trips";
import { Card, SectionTitle, StatusBadge } from "../components/ui";
import { TripTypeIconBadge } from "../components/TripBadge";
import { TripIcon } from "../components/icons";
import { Flag } from "../components/Location";
import { RequestDetailCard } from "../components/RequestDetailCard";

export function MyTrips() {
  const { state, orgRequests } = useApp();
  const role = state.currentRole;
  // Travelers and approvers (who are also travelers) manage their own trips;
  // arrangers manage the team's. Admin/finance get a read-only overview.
  const canManage =
    role === "TRAVELER" || role === "ARRANGER" || role === "APPROVER";
  const ownScope = role === "TRAVELER" || role === "APPROVER";

  const scoped = useMemo(
    () =>
      ownScope
        ? orgRequests.filter(
            (r) =>
              r.travelerName === state.currentUserName ||
              r.requestedByName === state.currentUserName
          )
        : orgRequests,
    [orgRequests, ownScope, state.currentUserName]
  );

  const [mode, setMode] = useState<"trips" | "bookings">("trips");

  const title = ownScope
    ? "My trips"
    : role === "ARRANGER"
    ? "Team trips"
    : "Trips";

  return (
    <div>
      <SectionTitle
        title={title}
        subtitle="View complete trips or drill into individual flight, hotel and car rental bookings."
      />

      <div className="mb-5 inline-flex rounded-lg bg-slate-100 p-1">
        {(["trips", "bookings"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${
              mode === m
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {m === "trips" ? "Trips" : "Bookings"}
          </button>
        ))}
      </div>

      {mode === "trips" ? (
        <TripsView requests={scoped} canManage={canManage} />
      ) : (
        <BookingsView requests={scoped} canManage={canManage} />
      )}
    </div>
  );
}

/* -------------------------------- Trips -------------------------------- */

function TripsView({
  requests,
  canManage,
}: {
  requests: TravelRequest[];
  canManage: boolean;
}) {
  const { state } = useApp();
  const trips = useMemo(() => groupTrips(requests), [requests]);

  // Preselect the trip containing the globally-selected request, if any.
  const initial =
    trips.find((t) => t.requests.some((r) => r.id === state.selectedRequestId))
      ?.id ??
    trips[0]?.id ??
    null;
  const [selectedId, setSelectedId] = useState<string | null>(initial);
  const selected = trips.find((t) => t.id === selectedId) ?? trips[0] ?? null;

  if (trips.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500">
        No trips yet. Create one from the New request tab.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="divide-y divide-slate-100">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setSelectedId(trip.id)}
              className={`w-full px-4 py-3 text-left transition ${
                selected?.id === trip.id ? "bg-brand-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {trip.name}
                </div>
                <StatusBadge status={trip.rollupStatus} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <TypeChips trip={trip} />
                <span>· {formatMoney(trip.totalCost, trip.currency)}</span>
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-400">
                {trip.destinations.map((d, i) => (
                  <span key={d}>
                    {i > 0 && ", "}
                    <Flag location={d} /> {d}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selected ? (
          <TripDetail trip={selected} canManage={canManage} />
        ) : (
          <Card className="p-10 text-center text-sm text-slate-500">
            Select a trip to view its bookings.
          </Card>
        )}
      </div>
    </div>
  );
}

function TripDetail({ trip, canManage }: { trip: Trip; canManage: boolean }) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(trip.requests[0] ? [trip.requests[0].id] : [])
  );
  // When switching trips, default-open the first booking.
  useEffect(() => {
    setOpenIds(new Set(trip.requests[0] ? [trip.requests[0].id] : []));
  }, [trip.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{trip.name}</h3>
              <StatusBadge status={trip.rollupStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {trip.destinations.map((d, i) => (
                <span key={d}>
                  {i > 0 && " · "}
                  <Flag location={d} /> {d}
                </span>
              ))}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {tripComposition(trip)} · {tripDateRange(trip)} ·{" "}
              {trip.travelers.join(", ")}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">
              {formatMoney(trip.totalCost, trip.currency)}
            </div>
            <div className="text-xs text-slate-500">
              {trip.requests.length} booking(s)
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {trip.statusCounts.map((s) => (
            <span
              key={s.status}
              className="inline-flex items-center gap-1 text-xs text-slate-500"
            >
              <StatusBadge status={s.status} /> × {s.count}
            </span>
          ))}
        </div>
      </Card>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Bookings in this trip
        </h4>
        <div className="space-y-3">
          {trip.requests.map((req) => {
            const open = openIds.has(req.id);
            return (
              <Card key={req.id} className="overflow-hidden">
                <button
                  onClick={() => toggle(req.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Chevron open={open} />
                    <TripTypeIconBadge type={req.tripType} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {req.reference}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {getTripSummary(req).headline}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatMoney(req.estimatedCost, req.currency)}
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-4">
                    <RequestDetailCard req={req} canManage={canManage} hideHeader />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TypeChips({ trip }: { trip: Trip }) {
  const types = (["FLIGHT", "HOTEL", "CAR"] as const).filter(
    (t) => trip.typeCounts[t] > 0
  );
  return (
    <span className="flex items-center gap-1.5">
      {types.map((t) => (
        <span key={t} className="inline-flex items-center gap-0.5 text-slate-500">
          <TripIcon type={t} className="h-3.5 w-3.5" />
          {trip.typeCounts[t]}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------- Bookings ------------------------------ */

function BookingsView({
  requests,
  canManage,
}: {
  requests: TravelRequest[];
  canManage: boolean;
}) {
  const { state } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(
    state.selectedRequestId
  );
  useEffect(() => {
    if (state.selectedRequestId) setSelectedId(state.selectedRequestId);
  }, [state.selectedRequestId]);

  const selected =
    requests.find((r) => r.id === selectedId) ?? requests[0] ?? null;

  if (requests.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500">
        No bookings yet. Create one from the New request tab.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="divide-y divide-slate-100">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedId(req.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                selected?.id === req.id ? "bg-brand-50" : "hover:bg-slate-50"
              }`}
            >
              <TripTypeIconBadge type={req.tripType} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {req.reference} · <Flag location={req.destination} />{" "}
                  {req.destination}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {req.travelerName}
                  {req.tripName && (
                    <span className="ml-1 text-slate-400">· {req.tripName}</span>
                  )}
                </div>
              </div>
              <StatusBadge status={req.status} />
            </button>
          ))}
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selected ? (
          <RequestDetailCard req={selected} canManage={canManage} />
        ) : (
          <Card className="p-10 text-center text-sm text-slate-500">
            Select a booking to view its status.
          </Card>
        )}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 flex-none text-slate-400 transition-transform ${
        open ? "rotate-90" : ""
      }`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
