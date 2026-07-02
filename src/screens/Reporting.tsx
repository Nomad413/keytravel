import { useApp } from "../state/store";
import type { RequestStatus, TripType } from "../types";
import { formatMoney } from "../lib/policy";
import { tripTypeLabel } from "../lib/trip";
import { Card, SectionTitle } from "../components/ui";

export function Reporting() {
  const { orgRequests, currentOrg } = useApp();
  const currency = currentOrg.currency;

  const committed = orgRequests.filter(
    (r) => r.status === "BOOKED" || r.status === "COMPLETED"
  );
  const totalSpend = committed.reduce((s, r) => s + r.estimatedCost, 0);

  const byType = (["FLIGHT", "HOTEL", "CAR"] as TripType[]).map((t) => ({
    label: tripTypeLabel[t],
    amount: committed
      .filter((r) => r.tripType === t)
      .reduce((s, r) => s + r.estimatedCost, 0),
  }));

  const statuses: RequestStatus[] = [
    "PENDING",
    "APPROVED",
    "BOOKED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ];
  const byStatus = statuses
    .map((st) => ({
      label: st.charAt(0) + st.slice(1).toLowerCase(),
      count: orgRequests.filter((r) => r.status === st).length,
    }))
    .filter((x) => x.count > 0);

  const deptSpend = currentOrg.departmentBudgets
    .map((b) => ({
      label: b.department,
      amount: committed
        .filter((r) => r.department === b.department)
        .reduce((s, r) => s + r.estimatedCost, 0),
    }))
    .filter((x) => x.amount > 0);

  return (
    <div>
      <SectionTitle
        title="Reporting"
        subtitle={`Travel spend and status overview for ${currentOrg.name}.`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Booked spend" value={formatMoney(totalSpend, currency)} />
        <Stat label="Total requests" value={String(orgRequests.length)} />
        <Stat
          label="Booked / completed"
          value={String(committed.length)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Spend by trip type
          </h4>
          <BarList
            rows={byType.map((r) => ({ label: r.label, value: r.amount }))}
            max={Math.max(1, ...byType.map((r) => r.amount))}
            format={(v) => formatMoney(v, currency)}
          />
        </Card>

        <Card className="p-6">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Spend by department
          </h4>
          {deptSpend.length > 0 ? (
            <BarList
              rows={deptSpend.map((r) => ({ label: r.label, value: r.amount }))}
              max={Math.max(1, ...deptSpend.map((r) => r.amount))}
              format={(v) => formatMoney(v, currency)}
            />
          ) : (
            <p className="text-sm text-slate-400">No booked spend yet.</p>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Requests by status
          </h4>
          <BarList
            rows={byStatus.map((r) => ({ label: r.label, value: r.count }))}
            max={Math.max(1, ...byStatus.map((r) => r.count))}
            format={(v) => String(v)}
          />
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </Card>
  );
}

function BarList({
  rows,
  max,
  format,
}: {
  rows: { label: string; value: number }[];
  max: number;
  format: (v: number) => string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-700">{r.label}</span>
            <span className="text-slate-600">{format(r.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.round((r.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
