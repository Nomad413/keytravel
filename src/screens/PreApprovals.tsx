import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import type { PreApproval, TravelRequest } from "../types";
import { formatMoney } from "../lib/policy";
import { committedAgainst, remainingOf } from "../lib/preapproval";
import { Button, Card, Field, SectionTitle, inputClass } from "../components/ui";

export function PreApprovals() {
  const { state, dispatch, currentOrg, orgRequests, orgPreApprovals } = useApp();

  const deptOptions = useMemo(
    () => currentOrg.departmentBudgets.map((b) => b.department),
    [currentOrg]
  );

  const [department, setDepartment] = useState(deptOptions[0] ?? "");
  const [amount, setAmount] = useState<number>(5000);
  const [note, setNote] = useState("");

  const active = orgPreApprovals.filter((p) => p.active);
  const revoked = orgPreApprovals.filter((p) => !p.active);

  const alreadyCovered = new Set(active.map((p) => p.department));

  const create = () => {
    if (!department.trim() || amount <= 0) return;
    dispatch({
      type: "ADD_PREAPPROVAL",
      orgId: currentOrg.id,
      department: department.trim(),
      amount,
      note,
      approverName: state.currentUserName,
    });
    setNote("");
    setAmount(5000);
  };

  return (
    <div>
      <SectionTitle
        title="Pre-approved budgets"
        subtitle={`Approve a spend envelope up front for a department. In-policy bookings then auto-approve and draw it down — no per-trip approval — for ${currentOrg.name}. Acting as ${state.currentUserName}.`}
      />

      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="mr-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Later
        </span>
        An <b>alternative approval flow</b> raised in discovery. Out-of-policy
        requests always still route through the normal approval chain, even when
        budget remains.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Create */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
              Pre-approve a budget
            </h3>
            <div className="space-y-4">
              <Field label="Department">
                {deptOptions.length > 0 ? (
                  <select
                    className={inputClass}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {deptOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                        {alreadyCovered.has(d) ? " (already has one)" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Programmes"
                  />
                )}
              </Field>
              <Field
                label={`Amount (${currentOrg.currency})`}
                hint="Total envelope. In-policy bookings draw it down until it runs out."
              >
                <input
                  type="number"
                  min={0}
                  step={500}
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Note" hint="Optional — shown to travellers' approvers for context.">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={note}
                  placeholder="e.g. Q3 partner-visit & conference budget"
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              {alreadyCovered.has(department) && (
                <p className="text-xs font-medium text-amber-700">
                  {department} already has an active pre-approved budget — adding
                  another stacks a second envelope.
                </p>
              )}
              <Button
                className="w-full justify-center"
                onClick={create}
                disabled={!department.trim() || amount <= 0}
              >
                Pre-approve {formatMoney(amount, currentOrg.currency)}
              </Button>
            </div>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-3 space-y-4">
          {active.length === 0 ? (
            <Card className="p-10 text-center text-sm text-slate-500">
              No active pre-approved budgets. Create one on the left to let a
              department book freely within policy.
            </Card>
          ) : (
            active.map((pa) => (
              <PreApprovalCard
                key={pa.id}
                pa={pa}
                requests={orgRequests}
                currency={currentOrg.currency}
                onRevoke={() => dispatch({ type: "REVOKE_PREAPPROVAL", id: pa.id })}
              />
            ))
          )}

          {revoked.length > 0 && (
            <div>
              <div className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Revoked
              </div>
              <div className="space-y-2">
                {revoked.map((pa) => (
                  <div
                    key={pa.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
                  >
                    <span>
                      {pa.department} · {formatMoney(pa.amount, currentOrg.currency)}
                    </span>
                    <span className="text-xs">revoked</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreApprovalCard({
  pa,
  requests,
  currency,
  onRevoke,
}: {
  pa: PreApproval;
  requests: TravelRequest[];
  currency: string;
  onRevoke: () => void;
}) {
  const committed = committedAgainst(pa.id, requests);
  const remaining = remainingOf(pa, requests);
  const pct = Math.min(100, Math.round((committed / pa.amount) * 100));
  const coveredCount = requests.filter(
    (r) =>
      r.coveredByPreApprovalId === pa.id &&
      r.status !== "REJECTED" &&
      r.status !== "CANCELLED"
  ).length;
  const exhausted = remaining <= 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {pa.department}
            </span>
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Active
            </span>
            {exhausted && (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Fully committed
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Pre-approved by {pa.approverName}
            {pa.note ? ` · ${pa.note}` : ""}
          </div>
        </div>
        <Button variant="secondary" onClick={onRevoke}>
          Revoke
        </Button>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {formatMoney(committed, currency)} committed ·{" "}
            <span className={exhausted ? "text-amber-700" : "text-emerald-700"}>
              {formatMoney(remaining, currency)} remaining
            </span>
          </span>
          <span className="font-medium text-slate-600">
            {formatMoney(pa.amount, currency)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              exhausted ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-400">
          {coveredCount} booking(s) auto-approved under this budget
        </div>
      </div>
    </Card>
  );
}
