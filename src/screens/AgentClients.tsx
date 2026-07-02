import { useState } from "react";
import { useApp } from "../state/store";
import { computeInsights } from "../lib/insights";
import { formatMoney } from "../lib/policy";
import { Button, Card, Field, SectionTitle, inputClass } from "../components/ui";

export function AgentClients() {
  const { state, dispatch } = useApp();
  const orgs = state.organizations;
  const [showForm, setShowForm] = useState(false);

  const manage = (orgId: string) => {
    dispatch({ type: "SET_ORG", orgId });
    dispatch({ type: "SET_ROLE", role: "ADMIN" });
    dispatch({ type: "SET_VIEW", view: "admin" });
  };

  return (
    <div>
      <SectionTitle
        title="Client organizations"
        subtitle="Onboard and manage the organizations that use Key Travel. Acting as Key Travel Agent."
      />

      <div className="mb-5 flex justify-end">
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "+ Add client organization"}
        </Button>
      </div>

      {showForm && <AddClientForm onDone={() => setShowForm(false)} />}

      <div className="space-y-4">
        {orgs.map((org) => {
          const insights = computeInsights(
            state.requests.filter((r) => r.orgId === org.id)
          );
          const users = state.users.filter((u) => u.orgId === org.id).length;
          return (
            <Card key={org.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                  <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
                    {org.description}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => manage(org.id)}>
                  Manage client →
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <Metric label="Currency" value={org.currency} />
                <Metric label="Users" value={String(users)} />
                <Metric label="Requests" value={String(insights.total)} />
                <Metric label="Pending" value={String(insights.pending)} />
                <Metric
                  label="Booked spend"
                  value={formatMoney(insights.bookedSpend, org.currency)}
                />
                <Metric label="Compliance" value={`${insights.inPolicyRate}%`} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <Info
                  label="Trip cost cap"
                  value={formatMoney(org.policy.maxTripCost, org.currency)}
                />
                <Info
                  label="Approval steps"
                  value={`${org.approvalSteps.length} configured`}
                />
                <Info
                  label="Restricted destinations"
                  value={
                    org.policy.restrictedDestinations.length
                      ? org.policy.restrictedDestinations.join(", ")
                      : "None"
                  }
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AddClientForm({ onDone }: { onDone: () => void }) {
  const { dispatch } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [maxTripCost, setMaxTripCost] = useState(2000);
  const [restricted, setRestricted] = useState("Russia, Belarus");
  const [approverName, setApproverName] = useState("Line Manager");

  const canSave = name.trim().length > 1;

  const save = () => {
    if (!canSave) return;
    dispatch({
      type: "ADD_ORG",
      name: name.trim(),
      description: description.trim() || "New Key Travel client organization.",
      currency,
      maxTripCost,
      restrictedDestinations: restricted
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      approverName: approverName.trim() || "Line Manager",
    });
    onDone();
  };

  return (
    <Card className="mb-5 p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
        Onboard a new client organization
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Organization name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Default currency">
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {["GBP", "EUR", "USD", "CHF"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Trip cost cap">
          <input
            type="number"
            className={inputClass}
            value={maxTripCost}
            onChange={(e) => setMaxTripCost(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Restricted destinations (comma-separated)">
          <input
            className={inputClass}
            value={restricted}
            onChange={(e) => setRestricted(e.target.value)}
          />
        </Field>
        <Field label="First approver (name)">
          <input
            className={inputClass}
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!canSave}>
          Create client
        </Button>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-sm font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-medium text-slate-700">{value}</div>
    </div>
  );
}
