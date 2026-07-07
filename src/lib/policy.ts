import type {
  ApprovalStepConfig,
  ApprovalStepInstance,
  CabinClass,
  Organization,
  PolicyEvaluation,
  PolicyFlag,
  TravelRequestDraft,
  TravelerSeniority,
} from "../types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Ordered low → high, so we can compare "is this cabin above the allowed one?".
export const CABIN_ORDER: CabinClass[] = [
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
];
export const cabinRank = (c?: CabinClass): number =>
  c ? CABIN_ORDER.indexOf(c) : 0;

// Ordered junior → senior.
export const SENIORITY_ORDER: TravelerSeniority[] = [
  "STAFF",
  "MANAGER",
  "EXECUTIVE",
];
export const seniorityRank = (s?: TravelerSeniority): number =>
  s ? SENIORITY_ORDER.indexOf(s) : 0;

export const seniorityLabel: Record<TravelerSeniority, string> = {
  STAFF: "Staff",
  MANAGER: "Manager",
  EXECUTIVE: "Executive / VIP",
};

// The subset of a request the policy engine reasons about. tripType, cabin and
// seniority are optional so lightweight callers (e.g. the simulator) still work.
export type PolicyInput = Pick<
  TravelRequestDraft,
  "estimatedCost" | "destination"
> &
  Partial<
    Pick<TravelRequestDraft, "tripType" | "cabinClass" | "travelerSeniority">
  >;

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

// Is the selected flight cabin above the organization's permitted maximum?
export function isCabinAbovePolicy(org: Organization, draft: PolicyInput): boolean {
  const max = org.policy.maxCabinClass;
  if (!max || draft.tripType !== "FLIGHT" || !draft.cabinClass) return false;
  return cabinRank(draft.cabinClass) > cabinRank(max);
}

// Evaluate a draft against an organization's policy rules (soft enforcement).
export function evaluatePolicy(
  org: Organization,
  draft: PolicyInput
): PolicyEvaluation {
  const flags: PolicyFlag[] = [];
  const { maxTripCost, maxCabinClass } = org.policy;

  const overBudget = draft.estimatedCost > maxTripCost;
  const restricted = isRestrictedDestination(org, draft.destination);
  const cabinTooHigh = isCabinAbovePolicy(org, draft);

  if (overBudget) {
    flags.push({
      severity: "violation",
      message: `Estimated cost ${formatMoney(
        draft.estimatedCost,
        org.currency
      )} exceeds the policy limit of ${formatMoney(maxTripCost, org.currency)}.`,
    });
  }

  if (cabinTooHigh && maxCabinClass) {
    flags.push({
      severity: "violation",
      message: `${cabinLabel(draft.cabinClass)} class exceeds this organization's maximum permitted cabin (${cabinLabel(
        maxCabinClass
      )}).`,
    });
  }

  if (restricted) {
    flags.push({
      severity: "warning",
      message: `Destination "${draft.destination}" is on this organization's restricted list and needs additional approval.`,
    });
  }

  const inPolicy = !overBudget && !restricted && !cabinTooHigh;

  if (inPolicy) {
    flags.push({
      severity: "ok",
      message: "Request is within the organization's travel policy.",
    });
  }

  // The chain (below) determines whether approval is actually required.
  const requiresApproval = buildApprovalChain(org, draft).length > 0;

  return { inPolicy, requiresApproval, flags };
}

// Build the ordered approval chain that applies to a specific request,
// based on the organization's configured steps and their triggers.
export function buildApprovalChain(
  org: Organization,
  draft: PolicyInput
): ApprovalStepInstance[] {
  const overBudget = draft.estimatedCost > org.policy.maxTripCost;
  const restricted = isRestrictedDestination(org, draft.destination);
  const cabinTooHigh = isCabinAbovePolicy(org, draft);

  const steps = [...org.approvalSteps].sort((a, b) => a.order - b.order);

  const applicable = steps.filter((step) => {
    switch (step.trigger) {
      case "ALWAYS":
        return true;
      case "COST_OVER":
        return draft.estimatedCost > (step.threshold ?? 0);
      case "DESTINATION_RESTRICTED":
        return restricted;
      case "CLASS_ABOVE":
        return (
          draft.tripType === "FLIGHT" &&
          cabinRank(draft.cabinClass) > cabinRank(step.cabinThreshold)
        );
      case "ROLE_ABOVE":
        return (
          seniorityRank(draft.travelerSeniority) >=
          seniorityRank(step.roleThreshold ?? "EXECUTIVE")
        );
      case "OUT_OF_POLICY":
        return overBudget || restricted || cabinTooHigh;
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
  step: ApprovalStepConfig,
  org: Organization,
  draft: PolicyInput
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
    case "CLASS_ABOVE":
      return `Triggered because ${cabinLabel(
        draft.cabinClass
      )} class is above ${cabinLabel(step.cabinThreshold)}.`;
    case "ROLE_ABOVE":
      return `Added for leadership / VIP oversight — the traveler's role (${seniorityLabel[
        draft.travelerSeniority ?? "STAFF"
      ]}) is at or above ${seniorityLabel[step.roleThreshold ?? "EXECUTIVE"]}.`;
    case "OUT_OF_POLICY":
      return "Triggered because the request is out of policy.";
    default:
      return "";
  }
}

function cabinLabel(c?: CabinClass): string {
  const labels: Record<CabinClass, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "Premium economy",
    BUSINESS: "Business",
    FIRST: "First",
  };
  return c ? labels[c] : "—";
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
