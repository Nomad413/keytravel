import type { ReactNode } from "react";
import { useApp } from "../state/store";
import type { Role } from "../types";
import { labelForView, roleMeta, roleNav } from "../lib/flows";
import { formatMoney } from "../lib/policy";
import { budgetUsage, computeInsights, type Insights } from "../lib/insights";
import { Card, StatusBadge } from "../components/ui";
import {
  BudgetCard,
  ComplianceCard,
  KpiCard,
  Panel,
  RankedList,
  TypeBreakdown,
} from "../components/insights";

export function RoleDashboard() {
  const { state, currentOrg, orgRequests } = useApp();
  const role = state.currentRole;
  const meta = roleMeta[role];
  const currency = currentOrg.currency;

  const company = computeInsights(orgRequests);
  const mine = computeInsights(
    orgRequests.filter(
      (r) =>
        r.travelerName === state.currentUserName ||
        r.requestedByName === state.currentUserName
    )
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className={`${meta.accent.bg} px-6 py-5`}>
          <div className={`text-xs font-semibold uppercase tracking-wide ${meta.accent.text}`}>
            {meta.label} workspace
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Welcome, {state.currentUserName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {meta.blurb} ·{" "}
            {role === "AGENT"
              ? `${state.organizations.length} client organizations`
              : currentOrg.name}
          </p>
        </div>
      </Card>

      <QuickActions role={role} />

      <AnalyticsSection>
        {role === "AGENT" && <AgentDashboard />}
        {role === "TRAVELER" && (
          <TravelerDashboard mine={mine} company={company} currency={currency} />
        )}
        {role === "ARRANGER" && (
          <ArrangerDashboard company={company} currency={currency} />
        )}
        {role === "APPROVER" && (
          <ApproverDashboard company={company} currency={currency} />
        )}
        {role === "ADMIN" && (
          <AdminDashboard company={company} currency={currency} />
        )}
        {role === "FINANCE" && <FinanceDashboard currency={currency} />}
      </AnalyticsSection>
    </div>
  );
}

// The MVP "home" for every role is intentionally light: the welcome header +
// Quick actions above route into the real MVP worklists (approval queue, trips,
// finance, admin console). The metrics/charts below are grouped and clearly
// flagged as the *post-MVP* reporting & analytics vision — data is instrumented
// from MVP, but these dashboards are a later phase.
function AnalyticsSection({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Reporting &amp; analytics
        </h3>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          Later · post-MVP vision
        </span>
      </div>
      <p className="max-w-3xl text-xs text-slate-500">
        In the MVP, each role works from lightweight <b>worklists</b> (approval
        queue, my trips, invoices) plus the quick actions above. KPI data is
        captured from day one, but the dashboards below preview the{" "}
        <b>post-MVP reporting &amp; analytics</b> layer rather than MVP scope.
      </p>
      {children}
    </div>
  );
}

/* ----------------------------- Role sections ---------------------------- */

function TravelerDashboard({
  mine,
  company,
  currency,
}: {
  mine: Insights;
  company: Insights;
  currency: string;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="My upcoming trips" value={String(mine.upcoming)} tone="brand" />
        <KpiCard label="Awaiting approval" value={String(mine.pending)} tone="amber" />
        <KpiCard label="Ready to book" value={String(mine.approved)} tone="emerald" />
        <KpiCard
          label="My booked spend"
          value={formatMoney(mine.bookedSpend, currency)}
          sub={`${mine.tripCount} trip(s) total`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RankedList
          title="Top destinations"
          subtitle="Across your organization"
          items={company.topDestinations}
          currency={currency}
          withFlags
        />
        <RankedList
          title="Most booked airlines"
          subtitle="Across your organization"
          items={company.topAirlines}
          currency={currency}
        />
        <RankedList
          title="Most booked hotels"
          subtitle="Across your organization"
          items={company.topHotels}
          currency={currency}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TypeBreakdown byType={mine.byType} currency={currency} />
        </div>
        <ComplianceCard
          rate={company.inPolicyRate}
          sub="Share of organization requests within travel policy."
        />
      </div>
    </>
  );
}

function ArrangerDashboard({
  company,
  currency,
}: {
  company: Insights;
  currency: string;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Active trips" value={String(company.tripCount)} tone="brand" />
        <KpiCard label="Pending approvals" value={String(company.pending)} tone="amber" />
        <KpiCard
          label="Booked spend"
          value={formatMoney(company.bookedSpend, currency)}
        />
        <KpiCard
          label="Travelers served"
          value={String(company.topTravelers.length)}
          tone="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankedList
          title="Top travelers"
          items={company.topTravelers}
          currency={currency}
        />
        <RankedList
          title="Top destinations"
          items={company.topDestinations}
          currency={currency}
          withFlags
        />
        <RankedList
          title="Most booked hotels"
          items={company.topHotels}
          currency={currency}
        />
        <RankedList
          title="Most booked airlines"
          items={company.topAirlines}
          currency={currency}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TypeBreakdown byType={company.byType} currency={currency} />
        </div>
        <ComplianceCard rate={company.inPolicyRate} />
      </div>
    </>
  );
}

function ApproverDashboard({
  company,
  currency,
}: {
  company: Insights;
  currency: string;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Awaiting your approval" value={String(company.pending)} tone="amber" />
        <KpiCard label="Approval rate" value={`${company.approvalRate}%`} tone="emerald" />
        <KpiCard label="Rejected" value={String(company.rejected)} tone="rose" />
        <KpiCard
          label="Value under review"
          value={formatMoney(company.pipelineSpend, currency)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatusBreakdownCard company={company} />
        <RankedList
          title="Top destinations"
          items={company.topDestinations}
          currency={currency}
          withFlags
        />
        <ComplianceCard rate={company.inPolicyRate} />
      </div>

      <TypeBreakdown byType={company.byType} currency={currency} />
    </>
  );
}

function AdminDashboard({
  company,
  currency,
}: {
  company: Insights;
  currency: string;
}) {
  const { currentOrg, orgRequests } = useApp();
  const usage = budgetUsage(orgRequests, currentOrg.departmentBudgets);
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total requests" value={String(company.total)} tone="brand" />
        <KpiCard label="Policy compliance" value={`${company.inPolicyRate}%`} tone="emerald" />
        <KpiCard label="Booked spend" value={formatMoney(company.bookedSpend, currency)} />
        <KpiCard label="Active trips" value={String(company.tripCount)} tone="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BudgetCard usage={usage} currency={currency} />
        <StatusBreakdownCard company={company} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RankedList
          title="Top departments"
          items={company.topDepartments}
          currency={currency}
        />
        <RankedList
          title="Top destinations"
          items={company.topDestinations}
          currency={currency}
          withFlags
        />
        <TypeBreakdown byType={company.byType} currency={currency} />
      </div>
    </>
  );
}

function FinanceDashboard({ currency }: { currency: string }) {
  const { orgRequests } = useApp();
  const company = computeInsights(orgRequests);
  const invoiced = orgRequests.filter((r) => !!r.invoiceStatus);
  const cnt = (s: string) => invoiced.filter((r) => r.invoiceStatus === s).length;
  const payable = invoiced
    .filter((r) => r.invoiceStatus !== "PAID")
    .reduce((s, r) => s + r.estimatedCost, 0);
  const paid = invoiced
    .filter((r) => r.invoiceStatus === "PAID")
    .reduce((s, r) => s + r.estimatedCost, 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Outstanding payable" value={formatMoney(payable, currency)} tone="amber" />
        <KpiCard label="Paid to date" value={formatMoney(paid, currency)} tone="emerald" />
        <KpiCard label="Open invoices" value={String(invoiced.length - cnt("PAID"))} />
        <KpiCard label="Total invoices" value={String(invoiced.length)} tone="brand" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Invoice pipeline">
          <div className="space-y-2 text-sm">
            {[
              ["ISSUED", "Issued"],
              ["VALIDATED", "Validated"],
              ["RECONCILED", "Reconciled"],
              ["PAID", "Paid"],
            ].map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-800">{cnt(k)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <TypeBreakdown byType={company.byType} currency={currency} />
        <RankedList
          title="Top hotels"
          items={company.topHotels}
          currency={currency}
        />
      </div>
    </>
  );
}

function AgentDashboard() {
  const { state } = useApp();
  const orgs = state.organizations;
  const currency = orgs[0]?.currency ?? "GBP";
  const portfolio = computeInsights(state.requests);

  const perClient = orgs.map((o) => ({
    org: o,
    insights: computeInsights(state.requests.filter((r) => r.orgId === o.id)),
    users: state.users.filter((u) => u.orgId === o.id).length,
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Client organizations" value={String(orgs.length)} tone="brand" />
        <KpiCard label="Requests (all clients)" value={String(portfolio.total)} />
        <KpiCard
          label="Portfolio booked spend"
          value={formatMoney(portfolio.bookedSpend, currency)}
        />
        <KpiCard label="Pending (all clients)" value={String(portfolio.pending)} tone="amber" />
      </div>

      <Panel title="Client portfolio">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-3 font-semibold">Organization</th>
                <th className="pb-2 pr-3 font-semibold">Users</th>
                <th className="pb-2 pr-3 font-semibold">Requests</th>
                <th className="pb-2 pr-3 font-semibold">Pending</th>
                <th className="pb-2 pr-3 font-semibold">Booked spend</th>
                <th className="pb-2 font-semibold">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {perClient.map(({ org, insights, users }) => (
                <tr key={org.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-800">{org.name}</td>
                  <td className="py-2 pr-3 text-slate-600">{users}</td>
                  <td className="py-2 pr-3 text-slate-600">{insights.total}</td>
                  <td className="py-2 pr-3 text-slate-600">{insights.pending}</td>
                  <td className="py-2 pr-3 text-slate-600">
                    {formatMoney(insights.bookedSpend, org.currency)}
                  </td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        insights.inPolicyRate >= 90
                          ? "bg-emerald-100 text-emerald-700"
                          : insights.inPolicyRate >= 70
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {insights.inPolicyRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RankedList
            title="Top destinations"
            subtitle="Across all client organizations"
            items={portfolio.topDestinations}
            currency={currency}
            withFlags
          />
        </div>
        <ComplianceCard
          rate={portfolio.inPolicyRate}
          label="Portfolio compliance"
          sub="Requests within policy across all clients."
        />
      </div>

      <TypeBreakdown byType={portfolio.byType} currency={currency} />
    </>
  );
}

/* ------------------------------ Shared bits ----------------------------- */

function StatusBreakdownCard({ company }: { company: Insights }) {
  const total = company.total || 1;
  return (
    <Panel title="Requests by status">
      <div className="space-y-2">
        {company.statusBreakdown.map((s) => (
          <div key={s.status} className="flex items-center gap-3">
            <div className="w-24 flex-none">
              <StatusBadge status={s.status} />
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.max(4, (s.count / total) * 100)}%` }}
              />
            </div>
            <span className="w-6 flex-none text-right text-xs font-semibold text-slate-600">
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function QuickActions({ role }: { role: Role }) {
  const { dispatch } = useApp();
  const quickLinks = roleNav[role].filter((v) => v !== "dashboard");
  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Quick actions
        </h3>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          MVP · your worklist
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {quickLinks.map((v) => (
          <button
            key={v}
            onClick={() => dispatch({ type: "SET_VIEW", view: v })}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-slate-50"
          >
            {labelForView(v, role)}
          </button>
        ))}
      </div>
    </Card>
  );
}
