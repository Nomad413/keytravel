import { useState } from "react";
import { useApp } from "../state/store";
import type { InvoiceStatus, TravelRequest } from "../types";
import { formatMoney } from "../lib/policy";
import { getTripSummary } from "../lib/trip";
import { Button, Card, SectionTitle } from "../components/ui";
import { TripTypeIconBadge } from "../components/TripBadge";

const invoiceMeta: Record<
  InvoiceStatus,
  { label: string; cls: string; nextLabel: string | null }
> = {
  ISSUED: {
    label: "Issued",
    cls: "bg-amber-100 text-amber-700",
    nextLabel: "Validate & review",
  },
  VALIDATED: {
    label: "Validated",
    cls: "bg-brand-100 text-brand-700",
    nextLabel: "Reconcile with ERP",
  },
  RECONCILED: {
    label: "Reconciled",
    cls: "bg-indigo-100 text-indigo-700",
    nextLabel: "Process payment",
  },
  PAID: {
    label: "Paid",
    cls: "bg-emerald-100 text-emerald-700",
    nextLabel: null,
  },
};

type Tab = "invoices" | "statements";

export function Finance() {
  const { state, dispatch, currentOrg, orgRequests } = useApp();
  const [tab, setTab] = useState<Tab>("invoices");

  const invoices = orgRequests.filter((r) => !!r.invoiceStatus);
  const actor = state.currentUserName;

  return (
    <div>
      <SectionTitle
        title="Finance"
        subtitle={`Invoicing, payments and reconciliation for ${currentOrg.name}. Acting as ${state.currentUserName}.`}
      />

      <div className="mb-4 flex gap-2">
        <TabButton active={tab === "invoices"} onClick={() => setTab("invoices")}>
          Invoices & payments
        </TabButton>
        <TabButton
          active={tab === "statements"}
          onClick={() => setTab("statements")}
        >
          Statements
        </TabButton>
      </div>

      {tab === "invoices" ? (
        <InvoicesTab
          invoices={invoices}
          currency={currentOrg.currency}
          onAdvance={(id) =>
            dispatch({ type: "ADVANCE_INVOICE", requestId: id, actor })
          }
        />
      ) : (
        <StatementsTab invoices={invoices} currency={currentOrg.currency} />
      )}
    </div>
  );
}

function InvoicesTab({
  invoices,
  currency,
  onAdvance,
}: {
  invoices: TravelRequest[];
  currency: string;
  onAdvance: (id: string) => void;
}) {
  if (invoices.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500">
        No invoices yet. Invoices are raised automatically when a trip is booked.
      </Card>
    );
  }
  return (
    <Card className="divide-y divide-slate-100">
      {invoices.map((inv) => {
        const meta = invoiceMeta[inv.invoiceStatus!];
        const summary = getTripSummary(inv);
        return (
          <div
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <TripTypeIconBadge type={inv.tripType} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {inv.reference}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.cls}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {summary.headline} · {inv.travelerName} · {inv.department}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {formatMoney(inv.estimatedCost, currency)}
                </div>
                <div className="text-xs text-slate-400">
                  {inv.bookingReference}
                </div>
              </div>
              {meta.nextLabel ? (
                <Button onClick={() => onAdvance(inv.id)}>
                  {meta.nextLabel}
                </Button>
              ) : (
                <span className="text-xs font-medium text-emerald-600">
                  Complete
                </span>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function StatementsTab({
  invoices,
  currency,
}: {
  invoices: TravelRequest[];
  currency: string;
}) {
  const total = invoices.reduce((s, r) => s + r.estimatedCost, 0);
  const paid = invoices
    .filter((r) => r.invoiceStatus === "PAID")
    .reduce((s, r) => s + r.estimatedCost, 0);
  const outstanding = total - paid;

  const byStatus: { status: InvoiceStatus; count: number; amount: number }[] = (
    ["ISSUED", "VALIDATED", "RECONCILED", "PAID"] as InvoiceStatus[]
  ).map((status) => {
    const items = invoices.filter((r) => r.invoiceStatus === status);
    return {
      status,
      count: items.length,
      amount: items.reduce((s, r) => s + r.estimatedCost, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total invoiced" value={formatMoney(total, currency)} />
        <SummaryCard label="Paid" value={formatMoney(paid, currency)} />
        <SummaryCard
          label="Outstanding"
          value={formatMoney(outstanding, currency)}
        />
      </div>
      <Card className="p-6">
        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Statement by status
        </h4>
        <div className="space-y-3">
          {byStatus.map((row) => {
            const pct = total > 0 ? Math.round((row.amount / total) * 100) : 0;
            return (
              <div key={row.status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {invoiceMeta[row.status].label}
                    <span className="ml-2 text-xs text-slate-400">
                      {row.count} invoice(s)
                    </span>
                  </span>
                  <span className="text-slate-600">
                    {formatMoney(row.amount, currency)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
