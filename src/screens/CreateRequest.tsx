import { useEffect, useMemo, useState } from "react";
import { useApp } from "../state/store";
import type {
  CabinClass,
  CarClass,
  RoomType,
  TravelRequestDraft,
  TripType,
} from "../types";
import { buildApprovalChain, evaluatePolicy, formatMoney } from "../lib/policy";
import {
  cabinClassLabel,
  carClassLabel,
  roomTypeLabel,
  tripAccent,
  tripTypeLabel,
} from "../lib/trip";
import {
  carOptionToDraft,
  flightOptionToDraft,
  hotelOptionToDraft,
  searchCars,
  searchFlights,
  searchHotels,
  type CarOption,
  type FlightOption,
  type HotelOption,
} from "../lib/search";
import { Button, Card, Field, SectionTitle, inputClass } from "../components/ui";
import { ApprovalChainView } from "../components/ApprovalChainView";
import { TripIcon } from "../components/icons";
import { TripTypeIconBadge } from "../components/TripBadge";
import { Flag } from "../components/Location";
import { Combobox } from "../components/Combobox";
import { TravelerMultiSelect } from "../components/TravelerMultiSelect";
import {
  AIRPORT_OPTIONS,
  CAR_PLACE_OPTIONS,
  CITY_OPTIONS,
} from "../lib/locations";

type Stage = "builder" | "search" | "results";
const TRIP_TYPES: TripType[] = ["FLIGHT", "HOTEL", "CAR"];

interface CartItem {
  id: string;
  draft: TravelRequestDraft;
}

function baseBookingDraft(
  type: TripType,
  traveler: string,
  department: string,
  pax = 1
): TravelRequestDraft {
  return {
    travelerName: traveler,
    requestedByName: traveler,
    department,
    tripType: type,
    destination: "",
    purpose: "",
    estimatedCost: 0,
    justification: "",
    origin: "London (LHR)",
    departDate: "",
    returnDate: "",
    cabinClass: "ECONOMY",
    oneWay: false,
    adults: pax,
    checkInDate: "",
    checkOutDate: "",
    roomType: "STANDARD",
    guests: pax,
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    dropoffDate: "",
    carClass: "ECONOMY",
  };
}

export function CreateRequest() {
  const { state, dispatch, currentOrg, orgUsers } = useApp();
  const role = state.currentRole;
  const isArranger = role === "ARRANGER";

  const travelers = useMemo(() => {
    const t = orgUsers.filter((u) => u.role === "TRAVELER");
    return t.length > 0 ? t : orgUsers;
  }, [orgUsers]);

  const initialTraveler = isArranger
    ? travelers[0]?.name ?? state.currentUserName
    : state.currentUserName;
  const initialDept = isArranger
    ? travelers[0]?.department ?? ""
    : orgUsers.find((u) => u.name === state.currentUserName)?.department ??
      "Field Operations";

  // Trip-level fields (shared by all bookings in the trip).
  // Arrangers can select many travelers and bulk-create one trip per traveler.
  const [travelerNames, setTravelerNames] = useState<string[]>(
    isArranger ? (travelers[0] ? [travelers[0].name] : []) : [state.currentUserName]
  );
  const [tripName, setTripName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);

  const deptOf = (name: string) =>
    orgUsers.find((u) => u.name === name)?.department ?? "";
  const primaryTraveler = travelerNames[0] ?? state.currentUserName;
  const primaryDept = deptOf(primaryTraveler) || initialDept;

  // In-progress booking being added.
  const [stage, setStage] = useState<Stage>("builder");
  const [draft, setDraft] = useState<TravelRequestDraft>(
    baseBookingDraft("FLIGHT", initialTraveler, initialDept)
  );

  // Reset everything when organization changes.
  useEffect(() => {
    const t = orgUsers.filter((u) => u.role === "TRAVELER");
    const list = t.length > 0 ? t : orgUsers;
    const trav = isArranger ? list[0]?.name ?? state.currentUserName : state.currentUserName;
    const dept = isArranger
      ? list[0]?.department ?? ""
      : orgUsers.find((u) => u.name === state.currentUserName)?.department ?? "";
    setTravelerNames(isArranger ? (list[0] ? [list[0].name] : []) : [state.currentUserName]);
    setTripName("");
    setPurpose("");
    setItems([]);
    setStage("builder");
    setDraft(baseBookingDraft("FLIGHT", trav, dept));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg.id]);

  const update = <K extends keyof TravelRequestDraft>(
    key: K,
    value: TravelRequestDraft[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const addTraveler = (name: string) =>
    setTravelerNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
  const removeTraveler = (name: string) =>
    setTravelerNames((prev) => prev.filter((n) => n !== name));
  const selectAllTravelers = () =>
    setTravelerNames(travelers.map((u) => u.name));
  const clearTravelers = () => setTravelerNames([]);

  const startBooking = (type: TripType) => {
    // Prefill guests (hotel) and adults (flight) from the number of selected
    // travelers when an arranger is booking for more than one person.
    const pax = isArranger ? Math.max(travelerNames.length, 1) : 1;
    setDraft(baseBookingDraft(type, primaryTraveler, primaryDept, pax));
    setStage("search");
  };

  const runSearch = () => {
    setDraft((d) => ({
      ...d,
      estimatedCost: 0,
      airline: undefined,
      flightNumber: undefined,
      departTime: undefined,
      arriveTime: undefined,
      durationLabel: undefined,
      stops: undefined,
      hotelName: undefined,
      hotelAddress: undefined,
      hotelUrl: undefined,
      hotelRating: undefined,
      carVendor: undefined,
      carModel: undefined,
    }));
    setStage("results");
  };

  const addSelected = (patch: Partial<TravelRequestDraft>) => {
    const finalDraft = { ...draft, ...patch };
    const id = `it-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    setItems((prev) => [...prev, { id, draft: finalDraft }]);
    setStage("builder");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const editItem = (id: string) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    setDraft(it.draft);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setStage("search");
  };

  const setItemJustification = (id: string, value: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, draft: { ...it.draft, justification: value } } : it
      )
    );

  // Per-item policy + trip totals.
  const evaluated = useMemo(
    () =>
      items.map((it) => ({
        item: it,
        eval: evaluatePolicy(currentOrg, it.draft),
      })),
    [items, currentOrg]
  );
  const total = items.reduce((s, it) => s + it.draft.estimatedCost, 0);
  const outOfPolicy = evaluated.filter((e) => !e.eval.inPolicy);

  const tripLabel = useMemo(() => {
    if (tripName.trim()) return tripName.trim();
    const first = items[0]?.draft;
    if (!first) return "";
    const start = first.departDate ?? first.checkInDate ?? first.pickupDate;
    const label = start
      ? new Date(start).toLocaleString("en-GB", { month: "short", year: "numeric" })
      : "";
    return `${first.destination}${label ? ` — ${label}` : ""}`;
  }, [tripName, items]);

  const canSubmitTrip =
    items.length > 0 &&
    travelerNames.length > 0 &&
    outOfPolicy.every((e) => (e.item.draft.justification ?? "").trim() !== "");

  // Representative approval chain preview (highest-cost booking).
  const previewDraft = useMemo(() => {
    if (items.length === 0) return null;
    const top = [...items].sort(
      (a, b) => b.draft.estimatedCost - a.draft.estimatedCost
    )[0];
    return { ...top.draft, travelerName: primaryTraveler, department: primaryDept };
  }, [items, primaryTraveler, primaryDept]);
  const previewChain = useMemo(
    () => (previewDraft ? buildApprovalChain(currentOrg, previewDraft) : []),
    [previewDraft, currentOrg]
  );

  const submit = () => {
    if (!canSubmitTrip) return;
    const name = tripLabel;
    // Bulk: create one independent trip per selected traveler.
    travelerNames.forEach((tn, ti) => {
      const tripId = `trip-${Date.now().toString(36)}-${ti}-${Math.random()
        .toString(36)
        .slice(2, 5)}`;
      const dept = deptOf(tn) || primaryDept;
      items.forEach((it) => {
        dispatch({
          type: "SUBMIT_REQUEST",
          draft: {
            ...it.draft,
            travelerName: tn,
            requestedByName: state.currentUserName,
            department: dept,
            purpose,
            tripId,
            tripName: name,
          },
        });
      });
    });
    // Reset for a fresh trip.
    setItems([]);
    setTripName("");
    setPurpose("");
    setDraft(baseBookingDraft("FLIGHT", primaryTraveler, primaryDept));
    setStage("builder");
  };

  const accent = tripAccent[draft.tripType];
  const canSearch = searchReady(draft);

  return (
    <div>
      <SectionTitle
        title="New trip request"
        subtitle={
          isArranger
            ? `Build a trip with any combination of flights, hotels and cars, then submit it for one or many travelers in bulk — for ${currentOrg.name}.`
            : `Add any combination of flights, hotels and car rentals to one trip, then submit for approval — for ${currentOrg.name}.`
        }
      />

      {stage === "builder" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left: trip cart */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                {isArranger ? (
                  <Field
                    label={`Travelers (${travelerNames.length} selected)`}
                    hint="Search and add one or more travelers — the same trip is created in bulk, one per traveler."
                  >
                    <TravelerMultiSelect
                      people={travelers}
                      selected={travelerNames}
                      onAdd={addTraveler}
                      onRemove={removeTraveler}
                      onSelectAll={selectAllTravelers}
                      onClear={clearTravelers}
                    />
                  </Field>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Traveler">
                      <input
                        className={`${inputClass} bg-slate-100 text-slate-500`}
                        value={primaryTraveler}
                        disabled
                        title="You are booking for yourself"
                      />
                    </Field>
                    <Field label="Department">
                      <input
                        className={`${inputClass} bg-slate-100 text-slate-500`}
                        value={primaryDept}
                        disabled
                      />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Trip name" hint="Optional — auto-generated from the first booking.">
                    <input
                      className={inputClass}
                      value={tripName}
                      placeholder={tripLabel || "e.g. Madrid client visit"}
                      onChange={(e) => setTripName(e.target.value)}
                    />
                  </Field>
                  <Field label="Purpose of travel">
                    <input
                      className={inputClass}
                      value={purpose}
                      placeholder="e.g. Q3 client onboarding"
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Bookings in this trip
                </h3>
                <span className="text-xs text-slate-400">
                  {items.length} booking(s)
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No bookings yet. Add a flight, hotel or car rental below — mix
                  and match as many as you need.
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluated.map(({ item, eval: ev }) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <TripTypeIconBadge type={item.draft.tripType} />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              <Flag location={item.draft.destination} />{" "}
                              {itemHeadline(item.draft)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {itemDates(item.draft)}
                            </div>
                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                ev.inPolicy
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ev.inPolicy ? "Within policy" : "Out of policy"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-slate-900">
                            {formatMoney(item.draft.estimatedCost, currentOrg.currency)}
                          </div>
                          <div className="mt-1 flex gap-3 text-xs">
                            <button
                              className="font-medium text-brand-600 hover:underline"
                              onClick={() => editItem(item.id)}
                            >
                              Edit
                            </button>
                            <button
                              className="font-medium text-rose-600 hover:underline"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      {!ev.inPolicy && (
                        <div className="mt-3">
                          <Field label="Justification (required — out of policy)">
                            <textarea
                              className={inputClass}
                              rows={2}
                              value={item.draft.justification ?? ""}
                              onChange={(e) =>
                                setItemJustification(item.id, e.target.value)
                              }
                            />
                          </Field>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add booking buttons */}
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Add to this trip
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {TRIP_TYPES.map((type) => {
                    const a = tripAccent[type];
                    return (
                      <button
                        key={type}
                        onClick={() => startBooking(type)}
                        className={`flex flex-col items-center gap-2 rounded-xl border ${a.border} bg-white p-4 text-slate-600 transition hover:bg-slate-50`}
                      >
                        <TripIcon type={type} className="h-6 w-6" />
                        <span className="text-sm font-semibold">
                          + {tripTypeLabel[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: trip summary + submit */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
                Trip summary
              </h3>
              <p className="mb-3 text-xs text-slate-400">
                {tripLabel || "New trip"} ·{" "}
                {travelerNames.length <= 1
                  ? primaryTraveler
                  : `${travelerNames.length} travelers`}
              </p>
              <div className="space-y-1 text-sm">
                {(["FLIGHT", "HOTEL", "CAR"] as const).map((t) => {
                  const count = items.filter((i) => i.draft.tripType === t).length;
                  if (count === 0) return null;
                  return (
                    <div key={t} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <TripIcon type={t} className="h-4 w-4" />
                        {tripTypeLabel[t]}
                      </span>
                      <span className="font-medium text-slate-700">× {count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatMoney(total, currentOrg.currency)}
                </span>
              </div>
              {outOfPolicy.length > 0 && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  {outOfPolicy.length} booking(s) out of policy — justification
                  required.
                </p>
              )}
              {isArranger && travelerNames.length === 0 && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  Select at least one traveler.
                </p>
              )}
              <Button
                className="mt-4 w-full justify-center"
                onClick={submit}
                disabled={!canSubmitTrip}
              >
                {travelerNames.length > 1
                  ? `Submit ${travelerNames.length} trips (${
                      items.length * travelerNames.length
                    } bookings)`
                  : `Submit trip (${items.length})`}
              </Button>
              <p className="mt-2 text-center text-xs text-slate-400">
                {travelerNames.length > 1
                  ? "One trip is created per traveler; each booking routes through its own approval chain."
                  : "Each booking routes through its own approval chain."}
              </p>
            </Card>

            {previewChain.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Approval chain preview
                </h3>
                <p className="mb-3 text-xs text-slate-400">
                  Example for the highest-value booking · {previewChain.length}{" "}
                  step(s).
                </p>
                <ApprovalChainView chain={previewChain} activeIndex={0} />
              </Card>
            )}
          </div>
        </div>
      )}

      {stage === "search" && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm font-semibold ${accent.text}`}>
              <TripIcon type={draft.tripType} className="h-4 w-4" />
              Search {tripTypeLabel[draft.tripType].toLowerCase()} options
            </div>
            <button
              className="text-sm font-medium text-brand-600 hover:underline"
              onClick={() => setStage("builder")}
            >
              ← Back to trip
            </button>
          </div>

          <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}>
            {draft.tripType === "FLIGHT" && (
              <FlightSearchFields draft={draft} update={update} restricted={currentOrg.policy.restrictedDestinations} />
            )}
            {draft.tripType === "HOTEL" && (
              <HotelSearchFields draft={draft} update={update} restricted={currentOrg.policy.restrictedDestinations} />
            )}
            {draft.tripType === "CAR" && (
              <CarSearchFields draft={draft} update={update} restricted={currentOrg.policy.restrictedDestinations} />
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={runSearch} disabled={!canSearch}>
              Search {tripTypeLabel[draft.tripType].toLowerCase()}s
            </Button>
          </div>
        </Card>
      )}

      {stage === "results" && (
        <ResultsStage
          draft={draft}
          currency={currentOrg.currency}
          policyLimit={currentOrg.policy.maxTripCost}
          onBack={() => setStage("search")}
          onSelectFlight={(o) => addSelected(flightOptionToDraft(o))}
          onSelectHotel={(o) => addSelected(hotelOptionToDraft(o))}
          onSelectCar={(o) => addSelected(carOptionToDraft(o))}
          evaluate={(price) =>
            evaluatePolicy(currentOrg, {
              estimatedCost: price,
              destination: draft.destination,
            }).inPolicy
          }
        />
      )}
    </div>
  );
}

function searchReady(d: TravelRequestDraft): boolean {
  if (!d.destination.trim()) return false;
  if (d.tripType === "FLIGHT")
    return !!d.origin?.trim() && !!d.departDate && (d.oneWay ? true : !!d.returnDate);
  if (d.tripType === "HOTEL") return !!d.checkInDate && !!d.checkOutDate;
  return !!d.pickupLocation?.trim() && !!d.pickupDate && !!d.dropoffDate;
}

function itemHeadline(d: TravelRequestDraft): string {
  if (d.tripType === "FLIGHT")
    return `${d.airline ?? "Flight"} ${d.flightNumber ?? ""} · ${d.origin} → ${d.destination}`;
  if (d.tripType === "HOTEL")
    return `${d.hotelName ?? "Hotel"} · ${d.destination}`;
  return `${d.carVendor ?? "Car"} ${d.carModel ?? ""} · ${d.destination}`;
}

function itemDates(d: TravelRequestDraft): string {
  if (d.tripType === "FLIGHT")
    return d.oneWay
      ? `${d.departDate}`
      : `${d.departDate} → ${d.returnDate}`;
  if (d.tripType === "HOTEL") return `${d.checkInDate} → ${d.checkOutDate}`;
  return `${d.pickupDate} → ${d.dropoffDate}`;
}

type SearchFieldsProps = {
  draft: TravelRequestDraft;
  update: <K extends keyof TravelRequestDraft>(
    key: K,
    value: TravelRequestDraft[K]
  ) => void;
  restricted: string[];
};

function FlightSearchFields({ draft, update, restricted }: SearchFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="From (origin)">
        <Combobox
          options={AIRPORT_OPTIONS}
          value={draft.origin ?? ""}
          onChange={(v) => update("origin", v)}
          placeholder="Search airport, e.g. London (LHR)"
        />
      </Field>
      <Field label="To (destination)" hint={`Restricted: ${restricted.join(", ") || "none"}`}>
        <Combobox
          options={CITY_OPTIONS}
          value={draft.destination}
          onChange={(v) => update("destination", v)}
          placeholder="Search city, e.g. Madrid, Spain"
          withFlags
        />
      </Field>
      <Field label="Cabin class">
        <select
          className={inputClass}
          value={draft.cabinClass}
          onChange={(e) => update("cabinClass", e.target.value as CabinClass)}
        >
          {Object.entries(cabinClassLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Trip mode">
        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="radio" name="tripmode" checked={!draft.oneWay} onChange={() => update("oneWay", false)} />
            Round trip
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="radio" name="tripmode" checked={!!draft.oneWay} onChange={() => update("oneWay", true)} />
            One-way
          </label>
        </div>
      </Field>
      <Field label="Adults" hint="Number of travelers on this flight.">
        <input
          type="number"
          min={1}
          className={inputClass}
          value={draft.adults ?? 1}
          onChange={(e) => update("adults", Number(e.target.value) || 1)}
        />
      </Field>
      <Field label="Depart date">
        <input type="date" className={inputClass} value={draft.departDate ?? ""} onChange={(e) => update("departDate", e.target.value)} />
      </Field>
      {!draft.oneWay && (
        <Field label="Return date">
          <input type="date" className={inputClass} value={draft.returnDate ?? ""} onChange={(e) => update("returnDate", e.target.value)} />
        </Field>
      )}
    </div>
  );
}

function HotelSearchFields({ draft, update, restricted }: SearchFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="City / destination" hint={`Restricted: ${restricted.join(", ") || "none"}`}>
        <Combobox
          options={CITY_OPTIONS}
          value={draft.destination}
          onChange={(v) => update("destination", v)}
          placeholder="Search city, e.g. Geneva, Switzerland"
          withFlags
        />
      </Field>
      <Field label="Room type">
        <select className={inputClass} value={draft.roomType} onChange={(e) => update("roomType", e.target.value as RoomType)}>
          {Object.entries(roomTypeLabel).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Check-in">
        <input type="date" className={inputClass} value={draft.checkInDate ?? ""} onChange={(e) => update("checkInDate", e.target.value)} />
      </Field>
      <Field label="Check-out">
        <input type="date" className={inputClass} value={draft.checkOutDate ?? ""} onChange={(e) => update("checkOutDate", e.target.value)} />
      </Field>
      <Field label="Guests">
        <input type="number" min={1} className={inputClass} value={draft.guests ?? 1} onChange={(e) => update("guests", Number(e.target.value) || 1)} />
      </Field>
    </div>
  );
}

function CarSearchFields({ draft, update, restricted }: SearchFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="City / destination" hint={`Restricted: ${restricted.join(", ") || "none"}`}>
        <Combobox
          options={CITY_OPTIONS}
          value={draft.destination}
          onChange={(v) => update("destination", v)}
          placeholder="Search city, e.g. Barcelona, Spain"
          withFlags
        />
      </Field>
      <Field label="Car class">
        <select className={inputClass} value={draft.carClass} onChange={(e) => update("carClass", e.target.value as CarClass)}>
          {Object.entries(carClassLabel).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Pick-up location">
        <Combobox
          options={CAR_PLACE_OPTIONS}
          value={draft.pickupLocation ?? ""}
          onChange={(v) => update("pickupLocation", v)}
          placeholder="Search, e.g. Madrid Airport (MAD)"
        />
      </Field>
      <Field label="Drop-off location">
        <Combobox
          options={CAR_PLACE_OPTIONS}
          value={draft.dropoffLocation ?? ""}
          onChange={(v) => update("dropoffLocation", v)}
          placeholder="Search, e.g. Madrid City Centre"
        />
      </Field>
      <Field label="Pick-up date">
        <input type="date" className={inputClass} value={draft.pickupDate ?? ""} onChange={(e) => update("pickupDate", e.target.value)} />
      </Field>
      <Field label="Drop-off date">
        <input type="date" className={inputClass} value={draft.dropoffDate ?? ""} onChange={(e) => update("dropoffDate", e.target.value)} />
      </Field>
    </div>
  );
}

function ResultsStage({
  draft,
  currency,
  policyLimit,
  onBack,
  onSelectFlight,
  onSelectHotel,
  onSelectCar,
  evaluate,
}: {
  draft: TravelRequestDraft;
  currency: string;
  policyLimit: number;
  onBack: () => void;
  onSelectFlight: (o: FlightOption) => void;
  onSelectHotel: (o: HotelOption) => void;
  onSelectCar: (o: CarOption) => void;
  evaluate: (price: number) => boolean;
}) {
  const flights = draft.tripType === "FLIGHT" ? searchFlights(draft) : [];
  const hotels = draft.tripType === "HOTEL" ? searchHotels(draft) : [];
  const cars = draft.tripType === "CAR" ? searchCars(draft) : [];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Options for{" "}
          <span className="font-semibold">
            <Flag location={draft.destination} /> {draft.destination}
          </span>{" "}
          · policy limit {formatMoney(policyLimit, currency)}
        </div>
        <button className="text-sm font-medium text-brand-600 hover:underline" onClick={onBack}>
          ← Edit search
        </button>
      </div>

      <div className="space-y-3">
        {flights.map((o) => (
          <OptionRow
            key={o.id}
            title={`${o.airline} · ${o.flightNumber}`}
            subtitle={`${o.departTime} → ${o.arriveTime} · ${o.durationLabel} · ${
              o.stops === 0 ? "Direct" : `${o.stops} stop(s)`
            }`}
            price={o.price}
            currency={currency}
            inPolicy={evaluate(o.price)}
            onSelect={() => onSelectFlight(o)}
          />
        ))}
        {hotels.map((o) => (
          <OptionRow
            key={o.id}
            title={`${o.hotelName} ${"★".repeat(o.rating)}`}
            subtitle={`${o.address} · ${o.nights} night(s) · ${formatMoney(
              o.pricePerNight,
              currency
            )}/night`}
            price={o.price}
            currency={currency}
            inPolicy={evaluate(o.price)}
            onSelect={() => onSelectHotel(o)}
          />
        ))}
        {cars.map((o) => (
          <OptionRow
            key={o.id}
            title={`${o.vendor} · ${o.model}`}
            subtitle={`${o.days} day(s) · ${formatMoney(o.pricePerDay, currency)}/day`}
            price={o.price}
            currency={currency}
            inPolicy={evaluate(o.price)}
            onSelect={() => onSelectCar(o)}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Selecting an option adds it to your trip — you can then add more or submit.
      </p>
    </Card>
  );
}

function OptionRow({
  title,
  subtitle,
  price,
  currency,
  inPolicy,
  onSelect,
}: {
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  inPolicy: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 hover:border-brand-300">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            inPolicy
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {inPolicy ? "Within policy" : "Out of policy"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold text-slate-900">
          {formatMoney(price, currency)}
        </div>
        <Button onClick={onSelect}>Add to trip</Button>
      </div>
    </div>
  );
}
