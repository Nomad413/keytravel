import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import type { StepDecision, TravelRequest } from "../types";
import { formatMoney } from "../lib/policy";
import { getTripSummary } from "../lib/trip";
import {
  approvalRollup,
  approvalRollupMeta,
  groupTrips,
  tripComposition,
  tripDateRange,
  type ApprovalRollup,
  type Trip,
} from "../lib/trips";
import {
  Button,
  Card,
  FlagRow,
  SectionTitle,
  StatusBadge,
  inputClass,
} from "../components/ui";
import { ApprovalChainView } from "../components/ApprovalChainView";
import { TripTypeBadge, TripTypeIconBadge } from "../components/TripBadge";
import { TripDetails } from "../components/TripDetails";
import { Flag } from "../components/Location";

type Tab = "pending" | "approved" | "rejected" | "all";
type Decision = Exclude<StepDecision, "PENDING">;

const tabMatch: Record<Tab, (r: ApprovalRollup) => boolean> = {
  pending: (r) => r === "PENDING",
  approved: (r) => r === "APPROVED" || r === "PARTIAL",
  rejected: (r) => r === "REJECTED",
  all: () => true,
};

export function ApproverInbox() {
  const { state, dispatch, orgRequests, currentOrg } = useApp();
  const [tab, setTab] = useState<Tab>("pending");
  const [openTrips, setOpenTrips] = useState<Set<string>>(new Set());
  const [openReqs, setOpenReqs] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, string>>({});

  const trips = useMemo(() => groupTrips(orgRequests), [orgRequests]);

  const counts = {
    pending: trips.filter((t) => tabMatch.pending(approvalRollup(t))).length,
    approved: trips.filter((t) => tabMatch.approved(approvalRollup(t))).length,
    rejected: trips.filter((t) => tabMatch.rejected(approvalRollup(t))).length,
    all: trips.length,
  };

  const list = trips.filter((t) => tabMatch[tab](approvalRollup(t)));

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const getComment = (key: string) => comments[key] ?? "";
  const setComment = (key: string, value: string) =>
    setComments((c) => ({ ...c, [key]: value }));

  const decideReq = (req: TravelRequest, decision: Decision) => {
    dispatch({
      type: "DECIDE",
      requestId: req.id,
      decision,
      comment: getComment(req.id),
      actor: state.currentUserName,
    });
    setComment(req.id, "");
  };

  const decideTrip = (trip: Trip, decision: Decision) => {
    const pendingIds = trip.requests
      .filter((r) => r.status === "PENDING")
      .map((r) => r.id);
    if (pendingIds.length === 0) return;
    dispatch({
      type: "DECIDE_TRIP",
      requestIds: pendingIds,
      decision,
      comment: getComment(`trip:${trip.id}`),
      actor: state.currentUserName,
    });
    setComment(`trip:${trip.id}`, "");
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div>
      <SectionTitle
        title="Approvals"
        subtitle={`Approve or reject whole trips at once, or decide each flight, hotel and car separately — for ${currentOrg.name}. Acting as ${state.currentUserName}.`}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-xs font-semibold ${
                  active ? "bg-white/25 text-white" : "bg-white text-slate-500"
                }`}
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          No {tab === "all" ? "" : tab} trips for this organization.
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((trip) => {
            const isOpen = openTrips.has(trip.id);
            const rollup = approvalRollup(trip);
            const meta = approvalRollupMeta[rollup];
            const pending = trip.requests.filter((r) => r.status === "PENDING");
            const multi = trip.requests.length > 1;
            const showTripAction = pending.length > 0;

            return (
              <Card key={trip.id} className="overflow-hidden">
                {/* Trip header */}
                <button
                  onClick={() => setOpenTrips((s) => toggle(s, trip.id))}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Chevron open={isOpen} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {trip.name}
                        </span>
                        <TripBadge label={meta.label} className={meta.className} />
                      </div>
                      <div className="mt-1 truncate text-sm text-slate-600">
                        {trip.travelers.join(", ")} · {tripComposition(trip)} ·{" "}
                        {tripDateRange(trip)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatMoney(trip.totalCost, trip.currency)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {pending.length > 0
                        ? `${pending.length} awaiting your review`
                        : `${trip.requests.length} booking(s)`}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100">
                    {/* Whole-trip action */}
                    {showTripAction && (
                      <div className="border-b border-slate-100 bg-brand-50/60 px-5 py-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                          {multi
                            ? `Decide the whole trip (${pending.length} pending booking(s))`
                            : "Decide this trip"}
                        </div>
                        <textarea
                          className={inputClass}
                          rows={2}
                          placeholder={
                            multi
                              ? "Optional comment applied to every booking in this trip"
                              : "Optional comment"
                          }
                          value={getComment(`trip:${trip.id}`)}
                          onChange={(e) =>
                            setComment(`trip:${trip.id}`, e.target.value)
                          }
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            variant="success"
                            onClick={() => decideTrip(trip, "APPROVED")}
                          >
                            {multi ? "Approve whole trip" : "Approve"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => decideTrip(trip, "REJECTED")}
                          >
                            {multi ? "Reject whole trip" : "Reject"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Member requests */}
                    <div className="space-y-3 px-5 py-4">
                      {trip.requests.map((req) => (
                        <MemberRequest
                          key={req.id}
                          req={req}
                          allowAction={multi}
                          open={openReqs.has(req.id)}
                          onToggle={() => setOpenReqs((s) => toggle(s, req.id))}
                          comment={getComment(req.id)}
                          onComment={(v) => setComment(req.id, v)}
                          onDecide={(d) => decideReq(req, d)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemberRequest({
  req,
  allowAction,
  open,
  onToggle,
  comment,
  onComment,
  onDecide,
}: {
  req: TravelRequest;
  allowAction: boolean;
  open: boolean;
  onToggle: () => void;
  comment: string;
  onComment: (v: string) => void;
  onDecide: (d: Decision) => void;
}) {
  const summary = getTripSummary(req);
  const activeIndex = req.chain.findIndex((s) => s.decision === "PENDING");
  const step = req.chain[activeIndex];
  const canAct = req.status === "PENDING";

  return (
    <div className="rounded-lg border border-slate-200">
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Chevron open={open} />
          <TripTypeIconBadge type={req.tripType} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {req.reference}
              </span>
              <StatusBadge status={req.status} />
              <TripTypeBadge type={req.tripType} />
            </div>
            <div className="mt-0.5 truncate text-xs text-slate-500">
              <Flag location={req.destination} /> {summary.headline}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatMoney(req.estimatedCost, req.currency)}
          </div>
          <div className="text-xs text-slate-500">
            {canAct && step ? `Awaiting: ${step.name}` : summary.dateLabel}
          </div>
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-3">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Request
              </div>
              <dl className="space-y-1 text-sm">
                <Row label="Purpose" value={req.purpose || "—"} />
                <Row label="Dates" value={summary.dateLabel} />
                <Row label="Department" value={req.department} />
                <Row label="Requested by" value={req.requestedByName} />
              </dl>
              {req.justification && (
                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span className="font-semibold">Justification: </span>
                  {req.justification}
                </div>
              )}
              <div className="mt-3 space-y-2">
                {req.policy.flags.map((f, i) => (
                  <FlagRow key={i} severity={f.severity} message={f.message} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <TripDetails req={req} />
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Approval chain
                </div>
                <ApprovalChainView chain={req.chain} activeIndex={activeIndex} />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-3">
            {canAct && !allowAction ? (
              <p className="text-xs text-slate-500">
                This is the trip's only booking — approve or reject it with
                “Decide this trip” above.
              </p>
            ) : canAct ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  Review as {step?.name} ({step?.approverName})
                </div>
                <textarea
                  className={inputClass}
                  rows={2}
                  placeholder="Add a comment (optional for approve/reject, useful for info requests)"
                  value={comment}
                  onChange={(e) => onComment(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="success" onClick={() => onDecide("APPROVED")}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => onDecide("REJECTED")}>
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onDecide("INFO_REQUESTED")}
                  >
                    Request info
                  </Button>
                </div>
              </div>
            ) : (
              <DecisionSummary req={req} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DecisionSummary({ req }: { req: TravelRequest }) {
  const decided = req.chain.filter((s) => s.decidedAt);
  if (decided.length === 0) {
    return <p className="text-xs text-slate-500">No decisions recorded yet.</p>;
  }
  return (
    <div className="space-y-1 text-xs text-slate-600">
      {decided.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-2">
          <span
            className={`font-semibold ${
              s.decision === "REJECTED" ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {s.decision === "REJECTED" ? "Rejected" : "Approved"}
          </span>
          <span>
            at {s.name} by {s.decidedBy}
            {s.decidedAt && ` · ${new Date(s.decidedAt).toLocaleDateString()}`}
          </span>
          {s.comment && <span className="italic text-slate-500">“{s.comment}”</span>}
        </div>
      ))}
    </div>
  );
}

function TripBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}
