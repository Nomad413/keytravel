import { useMemo, useState } from "react";
import { useApp } from "../state/store";
import { buildApprovalChain, evaluatePolicy, formatMoney } from "../lib/policy";
import { Card, Field, FlagRow, SectionTitle, inputClass } from "../components/ui";
import { ApprovalChainView } from "../components/ApprovalChainView";

// A "what-if" tool to show how the same organization's rules produce
// different approval chains as cost / destination change.
export function ChainSimulator() {
  const { currentOrg } = useApp();
  const [cost, setCost] = useState(1200);
  const [destination, setDestination] = useState("Madrid, Spain");

  const draft = { estimatedCost: cost, destination };
  const evaluation = useMemo(
    () => evaluatePolicy(currentOrg, draft),
    [currentOrg, cost, destination]
  );
  const chain = useMemo(
    () => buildApprovalChain(currentOrg, draft),
    [currentOrg, cost, destination]
  );

  const presets = [
    { label: "Low cost, safe", cost: 800, dest: "Dublin, Ireland" },
    {
      label: "Restricted destination",
      cost: 1200,
      dest: currentOrg.policy.restrictedDestinations[0] ?? "Russia",
    },
    {
      label: "Over budget",
      cost: currentOrg.policy.maxTripCost + 1500,
      dest: "Geneva, Switzerland",
    },
  ];

  return (
    <div>
      <SectionTitle
        title="Approval chain simulator"
        subtitle={`See how ${currentOrg.name}'s policy and approval rules react to different trips. Adjust the inputs or try a preset.`}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCost(p.cost);
                  setDestination(p.dest);
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Field
              label={`Estimated cost: ${formatMoney(cost, currentOrg.currency)}`}
              hint={`Policy limit is ${formatMoney(
                currentOrg.policy.maxTripCost,
                currentOrg.currency
              )}.`}
            >
              <input
                type="range"
                min={0}
                max={Math.max(6000, currentOrg.policy.maxTripCost * 2)}
                step={100}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </Field>
            <Field
              label="Destination"
              hint={`Restricted: ${
                currentOrg.policy.restrictedDestinations.join(", ") || "none"
              }`}
            >
              <input
                className={inputClass}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 space-y-2">
            {evaluation.flags.map((f, i) => (
              <FlagRow key={i} severity={f.severity} message={f.message} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Resulting approval chain
            </h3>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {chain.length} step(s)
            </span>
          </div>
          <ApprovalChainView chain={chain} activeIndex={0} />

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">
              Why this differs per organization
            </p>
            <p className="mt-1">
              Each organization configures its own steps and triggers (always,
              cost thresholds, restricted destinations, out-of-policy). The same
              trip can require one approval at one organization and three at
              another — all from the same engine.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
