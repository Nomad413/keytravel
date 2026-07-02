import type {
  ApprovalStepInstance,
  Organization,
  PolicyEvaluation,
  PolicyFlag,
  TravelRequestDraft,
} from "../types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function isRestrictedDestination(
  org: Organization,
  destination: string
): boolean {
  const dest = destination.trim().toLowerCase();
  if (!dest) return false;
  return org.policy.restrictedDestinations.some((r) =>
    dest.includes(r.trim().toLowerCase())
  );
}

// Evaluate a draft against an organization's policy rules (soft enforcement).
export function evaluatePolicy(
  org: Organization,
  draft: Pick<TravelRequestDraft, "estimatedCost" | "destination">
): PolicyEvaluation {
  const flags: PolicyFlag[] = [];
  const { maxTripCost } = org.policy;

  const overBudget = draft.estimatedCost > maxTripCost;
  const restricted = isRestrictedDestination(org, draft.destination);

  if (overBudget) {
    flags.push({
      severity: "violation",
      message: `Estimated cost ${formatMoney(
        draft.estimatedCost,
        org.currency
      )} exceeds the policy limit of ${formatMoney(maxTripCost, org.currency)}.`,
    });
  }

  if (restricted) {
    flags.push({
      severity: "warning",
      message: `Destination "${draft.destination}" is on this organization's restricted list and needs additional approval.`,
    });
  }

  const inPolicy = !overBudget && !restricted;

  if (inPolicy) {
    flags.push({
      severity: "ok",
      message: "Request is within the organization's travel policy.",
    });
  }

  // The chain (below) determines whether approval is actually required.
  const requiresApproval =
    buildApprovalChain(org, {
      estimatedCost: draft.estimatedCost,
      destination: draft.destination,
    }).length > 0;

  return { inPolicy, requiresApproval, flags };
}

// Build the ordered approval chain that applies to a specific request,
// based on the organization's configured steps and their triggers.
export function buildApprovalChain(
  org: Organization,
  draft: Pick<TravelRequestDraft, "estimatedCost" | "destination">
): ApprovalStepInstance[] {
  const overBudget = draft.estimatedCost > org.policy.maxTripCost;
  const restricted = isRestrictedDestination(org, draft.destination);

  const steps = [...org.approvalSteps].sort((a, b) => a.order - b.order);

  const applicable = steps.filter((step) => {
    switch (step.trigger) {
      case "ALWAYS":
        return true;
      case "COST_OVER":
        return draft.estimatedCost > (step.threshold ?? 0);
      case "DESTINATION_RESTRICTED":
        return restricted;
      case "OUT_OF_POLICY":
        return overBudget || restricted;
      default:
        return false;
    }
  });

  return applicable.map((step, index) => ({
    id: uid(),
    order: index + 1,
    name: step.name,
    approverName: step.approverName,
    reason: reasonForStep(step, org, draft),
    decision: "PENDING",
  }));
}

function reasonForStep(
  step: { trigger: string; threshold?: number },
  org: Organization,
  draft: Pick<TravelRequestDraft, "estimatedCost" | "destination">
): string {
  switch (step.trigger) {
    case "ALWAYS":
      return "Required for every travel request.";
    case "COST_OVER":
      return `Triggered because estimated cost exceeds ${formatMoney(
        step.threshold ?? 0,
        org.currency
      )}.`;
    case "DESTINATION_RESTRICTED":
      return `Triggered because "${draft.destination}" is a restricted destination.`;
    case "OUT_OF_POLICY":
      return "Triggered because the request is out of policy.";
    default:
      return "";
  }
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
