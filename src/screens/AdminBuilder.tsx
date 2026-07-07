import { useEffect, useState } from "react";
import { useApp } from "../state/store";
import type {
  ApprovalStepConfig,
  CabinClass,
  StepTrigger,
  TravelerSeniority,
} from "../types";
import {
  Button,
  Card,
  Field,
  SectionTitle,
  inputClass,
} from "../components/ui";
import {
  CABIN_ORDER,
  SENIORITY_ORDER,
  formatMoney,
  seniorityLabel,
} from "../lib/policy";
import { cabinClassLabel } from "../lib/trip";

const triggerLabels: Record<StepTrigger, string> = {
  ALWAYS: "Always",
  COST_OVER: "Cost over threshold",
  DESTINATION_RESTRICTED: "Restricted destination",
  CLASS_ABOVE: "Cabin above class",
  ROLE_ABOVE: "VIP / senior-role oversight",
  OUT_OF_POLICY: "Out of policy",
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function AdminBuilder() {
  const { state, dispatch, currentOrg } = useApp();
  const [steps, setSteps] = useState<ApprovalStepConfig[]>(
    currentOrg.approvalSteps
  );
  const [dirty, setDirty] = useState(false);

  // Reset local editing state when the selected organization changes.
  useEffect(() => {
    setSteps(currentOrg.approvalSteps);
    setDirty(false);
  }, [currentOrg.id]);

  const updateStep = (id: string, patch: Partial<ApprovalStepConfig>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    setDirty(true);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setSteps(copy.map((s, i) => ({ ...s, order: i + 1 })));
    setDirty(true);
  };

  const remove = (id: string) => {
    setSteps((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }))
    );
    setDirty(true);
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: uid(),
        order: prev.length + 1,
        name: "New approval level",
        approverName: "Unassigned",
        trigger: "ALWAYS",
      },
    ]);
    setDirty(true);
  };

  const save = () => {
    dispatch({ type: "UPDATE_CHAIN", orgId: currentOrg.id, steps });
    setDirty(false);
  };

  const reset = () => {
    setSteps(currentOrg.approvalSteps);
    setDirty(false);
  };

  return (
    <div>
      <SectionTitle
        title="Approval chain builder"
        subtitle={`Configure the approval levels for ${currentOrg.name}. This is how each organization self-services its own multi-level structure.`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconBtn onClick={() => move(i, -1)} disabled={i === 0}>
                        ↑
                      </IconBtn>
                      <IconBtn
                        onClick={() => move(i, 1)}
                        disabled={i === steps.length - 1}
                      >
                        ↓
                      </IconBtn>
                      <IconBtn onClick={() => remove(step.id)} danger>
                        ✕
                      </IconBtn>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Level name">
                      <input
                        className={inputClass}
                        value={step.name}
                        onChange={(e) =>
                          updateStep(step.id, { name: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Approver">
                      <input
                        className={inputClass}
                        value={step.approverName}
                        onChange={(e) =>
                          updateStep(step.id, { approverName: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Trigger">
                      <select
                        className={inputClass}
                        value={step.trigger}
                        onChange={(e) =>
                          updateStep(step.id, {
                            trigger: e.target.value as StepTrigger,
                          })
                        }
                      >
                        {Object.entries(triggerLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {step.trigger === "COST_OVER" && (
                      <Field label={`Threshold (${currentOrg.currency})`}>
                        <input
                          type="number"
                          className={inputClass}
                          value={step.threshold ?? 0}
                          onChange={(e) =>
                            updateStep(step.id, {
                              threshold: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </Field>
                    )}
                    {step.trigger === "CLASS_ABOVE" && (
                      <Field label="Cabin above (fires when higher)">
                        <select
                          className={inputClass}
                          value={step.cabinThreshold ?? "PREMIUM_ECONOMY"}
                          onChange={(e) =>
                            updateStep(step.id, {
                              cabinThreshold: e.target.value as CabinClass,
                            })
                          }
                        >
                          {CABIN_ORDER.map((c) => (
                            <option key={c} value={c}>
                              {cabinClassLabel[c]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                    {step.trigger === "ROLE_ABOVE" && (
                      <Field
                        label="Applies to role at/above"
                        hint="Adds a leadership/VIP oversight step for senior travelers (duty-of-care, visibility)."
                      >
                        <select
                          className={inputClass}
                          value={step.roleThreshold ?? "EXECUTIVE"}
                          onChange={(e) =>
                            updateStep(step.id, {
                              roleThreshold: e.target.value as TravelerSeniority,
                            })
                          }
                        >
                          {SENIORITY_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {seniorityLabel[s]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button variant="secondary" onClick={addStep}>
                + Add approval level
              </Button>
              <div className="flex gap-2">
                {dirty && (
                  <Button variant="ghost" onClick={reset}>
                    Discard
                  </Button>
                )}
                <Button onClick={save} disabled={!dirty}>
                  Save configuration
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              {currentOrg.name} policy
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Policy cost limit</dt>
                <dd className="font-medium text-slate-700">
                  {formatMoney(currentOrg.policy.maxTripCost, currentOrg.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Max cabin class</dt>
                <dd className="font-medium text-slate-700">
                  {currentOrg.policy.maxCabinClass
                    ? cabinClassLabel[currentOrg.policy.maxCabinClass]
                    : "Any"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Restricted destinations</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {currentOrg.policy.restrictedDestinations.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700"
                    >
                      {d}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            {currentOrg.policy.notes && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                {currentOrg.policy.notes}
              </p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              Tip: switch organizations in the top bar to see how different
              clients configure entirely different chains. Changes apply to new
              requests created afterwards. Acting as {state.currentUserName}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md border text-sm transition disabled:opacity-30 ${
        danger
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
