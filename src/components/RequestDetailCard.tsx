import { useApp } from "../state/store";
import type { TravelRequest } from "../types";
import { formatMoney } from "../lib/policy";
import { getTripSummary } from "../lib/trip";
import { Button, Card, FlagRow, StatusBadge } from "./ui";
import { ApprovalChainView } from "./ApprovalChainView";
import { TripTypeBadge, TripTypeIconBadge } from "./TripBadge";
import { TripDetails } from "./TripDetails";

// Full detail view for a single request: summary, policy flags, booking
// details, lifecycle actions (gated by `canManage`), approval chain and audit.
export function RequestDetailCard({
  req,
  canManage,
  hideHeader = false,
}: {
  req: TravelRequest;
  canManage: boolean;
  hideHeader?: boolean;
}) {
  const { state, dispatch } = useApp();
  const actor = state.currentUserName;
  const activeIndex = req.chain.findIndex((s) => s.decision === "PENDING");
  const summary = getTripSummary(req);

  return (
    <div className="space-y-6">
      <Card className={hideHeader ? "p-6 pt-4" : "p-6"}>
        {!hideHeader && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <TripTypeIconBadge type={req.tripType} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {req.reference}
                  </h3>
                  <StatusBadge status={req.status} />
                  <TripTypeBadge type={req.tripType} />
                  {req.tripName && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {req.tripName}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {summary.headline} · {req.travelerName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {formatMoney(req.estimatedCost, req.currency)}
              </div>
              <div className="text-xs text-slate-500">{summary.dateLabel}</div>
            </div>
          </div>
        )}

        <dl
          className={`grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 ${
            hideHeader ? "" : "mt-4"
          }`}
        >
          {summary.rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-2">
              <dt className="text-slate-400">{r.label}</dt>
              <dd className="text-right font-medium text-slate-700">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 space-y-2">
          {req.policy.flags.map((f, i) => (
            <FlagRow key={i} severity={f.severity} message={f.message} />
          ))}
        </div>

        <div className="mt-4">
          <TripDetails req={req} />
        </div>

        {req.status === "APPROVED" && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-3">
            <span className="text-sm font-medium text-emerald-800">
              All approvals complete. Ready to book.
            </span>
            {canManage && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "CANCEL", requestId: req.id, actor })}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={() => dispatch({ type: "BOOK", requestId: req.id, actor })}
                >
                  Book travel
                </Button>
              </div>
            )}
          </div>
        )}
        {req.status === "BOOKED" && (
          <div className="mt-5 rounded-lg bg-brand-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-brand-700">
                Booked · {req.bookingReference}. Confirmation sent to {req.travelerName}.
              </span>
              {canManage && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => dispatch({ type: "CANCEL", requestId: req.id, actor })}
                  >
                    Cancel trip
                  </Button>
                  <Button
                    onClick={() => dispatch({ type: "COMPLETE", requestId: req.id, actor })}
                  >
                    Mark completed
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        {req.status === "COMPLETED" && (
          <div className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
            Trip completed · {req.bookingReference}. Thanks for travelling with Key Travel.
          </div>
        )}
        {req.status === "REJECTED" && (
          <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            This request was rejected during approval.
          </div>
        )}
        {req.status === "CANCELLED" && (
          <div className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
            This request was cancelled.
          </div>
        )}
        {req.status === "PENDING" && (
          <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Awaiting approval — currently with{" "}
            {req.chain[activeIndex]?.name ?? "an approver"}.
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Approval chain
        </h4>
        <ApprovalChainView chain={req.chain} activeIndex={activeIndex} />
      </Card>

      <Card className="p-6">
        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Activity log
        </h4>
        <ol className="relative space-y-4 border-l border-slate-200 pl-6">
          {req.audit.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
              <div className="text-sm font-medium text-slate-800">{entry.action}</div>
              <div className="text-xs text-slate-500">
                {entry.actor} · {new Date(entry.timestamp).toLocaleString()}
              </div>
              {entry.detail && (
                <div className="mt-0.5 text-xs italic text-slate-500">{entry.detail}</div>
              )}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
