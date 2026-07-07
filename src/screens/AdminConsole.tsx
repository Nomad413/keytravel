import { useEffect, useState } from "react";
import { useApp } from "../state/store";
import type { CabinClass, Role } from "../types";
import { CABIN_ORDER, formatMoney } from "../lib/policy";
import { cabinClassLabel } from "../lib/trip";
import { roleMeta } from "../lib/flows";
import {
  Button,
  Card,
  Field,
  SectionTitle,
  inputClass,
} from "../components/ui";
import { AdminBuilder } from "./AdminBuilder";

type AdminTab =
  | "users"
  | "policies"
  | "workflows"
  | "budgets"
  | "integrations";

const TABS: { id: AdminTab; label: string; later?: boolean }[] = [
  { id: "users", label: "Users" },
  { id: "policies", label: "Policies", later: true },
  { id: "workflows", label: "Approval workflows", later: true },
  { id: "budgets", label: "Budgets", later: true },
  { id: "integrations", label: "Integrations", later: true },
];

export function AdminConsole() {
  const [tab, setTab] = useState<AdminTab>("users");
  const { currentOrg } = useApp();

  return (
    <div>
      <SectionTitle
        title="Admin console"
        subtitle={`Manage ${currentOrg.name}: users, policies, approval workflows, budgets and integrations.`}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand-600 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
            {t.later && (
              <span
                title="In MVP this is set up by Key Travel (Agent-assisted onboarding); org self-service is post-MVP"
                className={`ml-1.5 rounded px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  tab === t.id
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                Later
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersPanel />}
      {tab === "policies" && <PoliciesPanel />}
      {tab === "workflows" && <AdminBuilder />}
      {tab === "budgets" && <BudgetsPanel />}
      {tab === "integrations" && <IntegrationsPanel />}
    </div>
  );
}

function LaterNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <span className="mr-2 rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-900">
        Later · post-MVP
      </span>
      {children}
    </div>
  );
}

const roleBadge: Record<Role, string> = {
  TRAVELER: "bg-violet-100 text-violet-700",
  ARRANGER: "bg-emerald-100 text-emerald-700",
  APPROVER: "bg-orange-100 text-orange-700",
  ADMIN: "bg-teal-100 text-teal-700",
  FINANCE: "bg-brand-100 text-brand-700",
  AGENT: "bg-indigo-100 text-indigo-700",
};

const ALL_ROLES: Role[] = ["TRAVELER", "ARRANGER", "APPROVER", "ADMIN", "FINANCE"];

function UsersPanel() {
  const { orgUsers, dispatch } = useApp();
  return (
    <>
    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
      <span className="mr-2 rounded-full bg-emerald-200 px-2 py-0.5 font-semibold text-emerald-900">
        MVP
      </span>
      Org Admins self-serve day-to-day user management (invite, assign role,
      deactivate). Bulk seeding is Agent-assisted (CSV) at onboarding; SSO JIT
      auto-creates accounts. Directory (SCIM / HRIS) auto-provisioning is
      post-MVP.
    </div>
    <Card className="divide-y divide-slate-100">
      <div className="flex items-center justify-between px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>User</span>
        <span>Role</span>
      </div>
      {orgUsers.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between gap-3 px-5 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${roleBadge[u.role]}`}
            >
              {u.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {u.name}
              </div>
              <div className="text-xs text-slate-500">
                {u.title} · {u.department}
              </div>
            </div>
          </div>
          <select
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500"
            value={u.role}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_USER_ROLE",
                userId: u.id,
                role: e.target.value as Role,
              })
            }
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleMeta[r].label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </Card>
    </>
  );
}

function PoliciesPanel() {
  const { currentOrg, dispatch } = useApp();
  const [maxTripCost, setMaxTripCost] = useState(currentOrg.policy.maxTripCost);
  const [restricted, setRestricted] = useState(
    currentOrg.policy.restrictedDestinations.join(", ")
  );
  const [maxCabinClass, setMaxCabinClass] = useState<CabinClass>(
    currentOrg.policy.maxCabinClass ?? "FIRST"
  );
  const [notes, setNotes] = useState(currentOrg.policy.notes ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMaxTripCost(currentOrg.policy.maxTripCost);
    setRestricted(currentOrg.policy.restrictedDestinations.join(", "));
    setMaxCabinClass(currentOrg.policy.maxCabinClass ?? "FIRST");
    setNotes(currentOrg.policy.notes ?? "");
    setSaved(false);
  }, [currentOrg.id]);

  const save = () => {
    dispatch({
      type: "UPDATE_POLICY",
      orgId: currentOrg.id,
      policy: {
        ...currentOrg.policy,
        maxTripCost,
        restrictedDestinations: restricted
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        maxCabinClass,
        notes,
      },
    });
    setSaved(true);
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label={`Policy cost limit (${currentOrg.currency})`}
          hint="Trips above this are treated as out of policy (soft enforcement)."
        >
          <input
            type="number"
            className={inputClass}
            value={maxTripCost}
            onChange={(e) => {
              setMaxTripCost(Number(e.target.value) || 0);
              setSaved(false);
            }}
          />
        </Field>
        <Field
          label="Restricted destinations"
          hint="Comma-separated. These trigger additional approval."
        >
          <input
            className={inputClass}
            value={restricted}
            onChange={(e) => {
              setRestricted(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
        <Field
          label="Maximum cabin class"
          hint="Flights above this cabin are out of policy (travel-class rule)."
        >
          <select
            className={inputClass}
            value={maxCabinClass}
            onChange={(e) => {
              setMaxCabinClass(e.target.value as CabinClass);
              setSaved(false);
            }}
          >
            {CABIN_ORDER.map((c) => (
              <option key={c} value={c}>
                {cabinClassLabel[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Policy notes">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
      </div>
      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs font-medium text-emerald-600">
            Policy saved — applies to new requests.
          </span>
        )}
        <Button onClick={save}>Save policy</Button>
      </div>
    </Card>
  );
}

function BudgetsPanel() {
  const { currentOrg, orgRequests } = useApp();

  const spentByDept = (department: string) =>
    orgRequests
      .filter(
        (r) =>
          r.department === department &&
          (r.status === "BOOKED" || r.status === "COMPLETED")
      )
      .reduce((s, r) => s + r.estimatedCost, 0);

  return (
    <div className="space-y-4">
      <LaterNote>
        Setting department budgets (org self-serve config) and this budget-vs-spend
        view (analytics) are <b>post-MVP</b>. In MVP, <b>cost-center tagging</b> for
        finance allocation is captured, and Key Travel configures any budget caps
        during onboarding.
      </LaterNote>
      {currentOrg.departmentBudgets.map((b) => {
        const spent = spentByDept(b.department);
        const pct = Math.min(100, Math.round((spent / b.limitAmount) * 100));
        const over = spent > b.limitAmount;
        return (
          <Card key={b.department} className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">
                {b.department}
              </div>
              <div className="text-sm text-slate-600">
                {formatMoney(spent, currentOrg.currency)}{" "}
                <span className="text-slate-400">
                  / {formatMoney(b.limitAmount, currentOrg.currency)}
                </span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  over ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {pct}% of annual travel budget committed
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const initialIntegrations = [
  {
    name: "Internal booking system",
    desc: "Search, book, change and cancel via the existing platform APIs.",
    enabled: true,
  },
  {
    name: "MS Business Central (Finance / ERP)",
    desc: "Centralized invoicing & reconciliation synced to MS Business Central.",
    enabled: true,
  },
  {
    name: "Payments (corporate card)",
    desc: "Corporate card payments via a PCI-compliant provider (tokenized).",
    enabled: true,
  },
  {
    name: "SSO / Identity provider",
    desc: "SAML / OIDC single sign-on with MFA.",
    enabled: true,
  },
  {
    name: "GDS / NDC content",
    desc: "Direct flight content from Amadeus / Sabre / Travelport.",
    enabled: false,
  },
  {
    name: "Notifications (email / Slack / Teams)",
    desc: "Approval and status notifications to travelers and approvers.",
    enabled: true,
  },
];

function IntegrationsPanel() {
  return (
    <div>
      <LaterNote>
        Integrations are <b>Key Travel-managed</b> connections configured during
        Agent-assisted onboarding (booking system, MS Business Central, SSO,
        payments). In MVP the Org Admin sees this as a <b>read-only status</b>;
        self-serve integration management is post-MVP.
      </LaterNote>
      <Card className="divide-y divide-slate-100">
        {initialIntegrations.map((it) => (
          <div
            key={it.name}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800">{it.name}</div>
              <div className="text-xs text-slate-500">{it.desc}</div>
            </div>
            <span
              className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${
                it.enabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {it.enabled ? "Connected" : "Available · post-MVP"}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
