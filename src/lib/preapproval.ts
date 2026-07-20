import type {
  Organization,
  PreApproval,
  TravelRequest,
  TravelRequestDraft,
} from "../types";
import { evaluatePolicy } from "./policy";

// A covered request draws down its envelope for as long as it is live.
// Rejected / cancelled requests release their hold on the envelope.
const drawsDown = (r: TravelRequest): boolean =>
  r.status !== "REJECTED" && r.status !== "CANCELLED";

// Total amount already committed against a specific envelope.
export function committedAgainst(
  preApprovalId: string,
  requests: TravelRequest[]
): number {
  return requests
    .filter((r) => r.coveredByPreApprovalId === preApprovalId && drawsDown(r))
    .reduce((sum, r) => sum + r.estimatedCost, 0);
}

// Remaining headroom on an envelope (never negative).
export function remainingOf(
  pa: PreApproval,
  requests: TravelRequest[]
): number {
  return Math.max(0, pa.amount - committedAgainst(pa.id, requests));
}

// The active envelope covering a given department, if any.
export function activePreApprovalForDept(
  preApprovals: PreApproval[],
  orgId: string,
  department: string
): PreApproval | null {
  return (
    preApprovals.find(
      (pa) => pa.active && pa.orgId === orgId && pa.department === department
    ) ?? null
  );
}

// Find an active envelope that FULLY covers this in-policy draft. Out-of-policy
// requests are never auto-approved — they always go through the chain, even if
// there is budget headroom, so policy breaches still get a human decision.
export function findCoveringPreApproval(
  preApprovals: PreApproval[],
  org: Organization,
  draft: TravelRequestDraft,
  requests: TravelRequest[]
): PreApproval | null {
  if (!evaluatePolicy(org, draft).inPolicy) return null;
  const pa = activePreApprovalForDept(preApprovals, org.id, draft.department);
  if (!pa) return null;
  return remainingOf(pa, requests) >= draft.estimatedCost ? pa : null;
}
