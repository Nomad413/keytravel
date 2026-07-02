import type { ApprovalStepInstance } from "../types";
import { DecisionBadge } from "./ui";

export function ApprovalChainView({
  chain,
  activeIndex,
}: {
  chain: ApprovalStepInstance[];
  activeIndex?: number;
}) {
  if (chain.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No approvals required for this request — it can be booked directly.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {chain.map((step, i) => {
        const isActive = activeIndex === i && step.decision === "PENDING";
        return (
          <li
            key={step.id}
            className={`relative rounded-lg border px-4 py-3 ${
              isActive
                ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                    step.decision === "APPROVED"
                      ? "bg-emerald-500 text-white"
                      : step.decision === "REJECTED"
                      ? "bg-rose-500 text-white"
                      : isActive
                      ? "bg-brand-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {step.decision === "APPROVED"
                    ? "✓"
                    : step.decision === "REJECTED"
                    ? "✕"
                    : step.order}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {step.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {step.approverName}
                  </div>
                </div>
              </div>
              <DecisionBadge decision={step.decision} />
            </div>
            <p className="mt-2 pl-10 text-xs text-slate-500">{step.reason}</p>
            {step.comment && (
              <p className="mt-1 pl-10 text-xs italic text-slate-600">
                “{step.comment}” — {step.decidedBy}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
