import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  ApprovalStepConfig,
  InvoiceStatus,
  Organization,
  PolicyRules,
  PreApproval,
  RequestStatus,
  Role,
  StepDecision,
  TravelRequest,
  TravelRequestDraft,
  User,
} from "../types";
import { buildApprovalChain, evaluatePolicy, formatMoney } from "../lib/policy";
import { findCoveringPreApproval, remainingOf } from "../lib/preapproval";
import { getTripSummary } from "../lib/trip";
import { roleNav, type ViewId } from "../lib/flows";
import {
  defaultUserByRole,
  organizations as seedOrgs,
  seedPreApprovals,
  seedRequests,
  users as seedUsers,
} from "../data/seed";

export type { ViewId } from "../lib/flows";

interface AppState {
  organizations: Organization[];
  users: User[];
  currentOrgId: string;
  currentRole: Role;
  currentUserName: string;
  requests: TravelRequest[];
  preApprovals: PreApproval[];
  view: ViewId;
  selectedRequestId: string | null;
}

type Action =
  | { type: "SET_ORG"; orgId: string }
  | { type: "SET_ROLE"; role: Role }
  | { type: "SET_VIEW"; view: ViewId }
  | { type: "SELECT_REQUEST"; id: string | null }
  | { type: "SUBMIT_REQUEST"; draft: TravelRequestDraft }
  | {
      type: "DECIDE";
      requestId: string;
      decision: Exclude<StepDecision, "PENDING">;
      comment: string;
      actor: string;
    }
  | {
      type: "DECIDE_TRIP";
      requestIds: string[];
      decision: Exclude<StepDecision, "PENDING">;
      comment: string;
      actor: string;
    }
  | { type: "BOOK"; requestId: string; actor: string }
  | { type: "CANCEL"; requestId: string; actor: string }
  | { type: "COMPLETE"; requestId: string; actor: string }
  | { type: "ADVANCE_INVOICE"; requestId: string; actor: string }
  | { type: "UPDATE_CHAIN"; orgId: string; steps: ApprovalStepConfig[] }
  | { type: "UPDATE_POLICY"; orgId: string; policy: PolicyRules }
  | { type: "UPDATE_USER_ROLE"; userId: string; role: Role }
  | {
      type: "ADD_PREAPPROVAL";
      orgId: string;
      department: string;
      amount: number;
      note: string;
      approverName: string;
    }
  | { type: "REVOKE_PREAPPROVAL"; id: string }
  | {
      type: "ADD_ORG";
      name: string;
      description: string;
      currency: string;
      maxTripCost: number;
      restrictedDestinations: string[];
      approverName: string;
    };

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const roleForOrgDefault: Role = "TRAVELER";

const initialState: AppState = {
  organizations: seedOrgs,
  users: seedUsers,
  currentOrgId: seedOrgs[0].id,
  currentRole: roleForOrgDefault,
  currentUserName: defaultUserByRole[roleForOrgDefault],
  requests: seedRequests,
  preApprovals: seedPreApprovals,
  view: "dashboard",
  selectedRequestId: null,
};

const nextInvoiceStatus: Record<InvoiceStatus, InvoiceStatus | null> = {
  ISSUED: "VALIDATED",
  VALIDATED: "RECONCILED",
  RECONCILED: "PAID",
  PAID: null,
};

const invoiceActionLabel: Record<InvoiceStatus, string> = {
  ISSUED: "Invoice validated & reviewed",
  VALIDATED: "Payment reconciled with ERP",
  RECONCILED: "Payment processed",
  PAID: "Payment complete",
};

let refSeq = 1100;
const nextRef = () => `KT-${refSeq++}`;

function firstPendingIndex(req: TravelRequest): number {
  return req.chain.findIndex((s) => s.decision === "PENDING");
}

// Apply a single approval decision to the current pending step of a request.
// Shared by both per-request (DECIDE) and whole-trip (DECIDE_TRIP) actions.
function applyDecision(
  req: TravelRequest,
  decision: Exclude<StepDecision, "PENDING">,
  comment: string,
  actor: string
): TravelRequest {
  if (req.status !== "PENDING") return req;
  const idx = firstPendingIndex(req);
  if (idx < 0) return req;

  const now = new Date().toISOString();
  const chain = req.chain.map((step, i) =>
    i === idx
      ? {
          ...step,
          decision: decision as StepDecision,
          comment: comment || undefined,
          decidedBy: actor,
          decidedAt: now,
        }
      : step
  );

  let status: RequestStatus = req.status;
  const auditEntries = [
    {
      id: uid(),
      timestamp: now,
      actor,
      action:
        decision === "APPROVED"
          ? `Approved at step "${req.chain[idx].name}"`
          : decision === "REJECTED"
          ? `Rejected at step "${req.chain[idx].name}"`
          : `Requested more info at step "${req.chain[idx].name}"`,
      detail: comment || undefined,
    },
  ];

  if (decision === "REJECTED") {
    status = "REJECTED";
  } else if (decision === "APPROVED") {
    const remaining = chain.some((s) => s.decision === "PENDING");
    if (!remaining) {
      status = "APPROVED";
      auditEntries.push({
        id: uid(),
        timestamp: now,
        actor: "System",
        action: "All approvals complete - ready to book",
        detail: undefined,
      });
    }
  }
  // INFO_REQUESTED keeps the request pending on the same step until re-decided.

  return { ...req, chain, status, audit: [...req.audit, ...auditEntries] };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ORG": {
      return { ...state, currentOrgId: action.orgId, selectedRequestId: null };
    }
    case "SET_ROLE": {
      // Reset to the role's landing view and switch to a representative user.
      const nav = roleNav[action.role];
      const view = nav.includes(state.view) ? state.view : "dashboard";
      return {
        ...state,
        currentRole: action.role,
        currentUserName: defaultUserByRole[action.role] ?? state.currentUserName,
        view,
      };
    }
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SELECT_REQUEST":
      return { ...state, selectedRequestId: action.id };

    case "SUBMIT_REQUEST": {
      const org = state.organizations.find((o) => o.id === state.currentOrgId);
      if (!org) return state;

      const policy = evaluatePolicy(org, action.draft);

      // If an active pre-approved budget covers this in-policy request, it is
      // auto-approved and draws down the envelope — no per-trip approval chain.
      const covering = findCoveringPreApproval(
        state.preApprovals,
        org,
        action.draft,
        state.requests
      );
      const chain = covering ? [] : buildApprovalChain(org, action.draft);
      const now = new Date().toISOString();

      const audit = [
        {
          id: uid(),
          timestamp: now,
          actor: action.draft.requestedByName || state.currentUserName,
          action: "Request submitted",
          detail: covering
            ? `${getTripSummary(action.draft).headline} - covered by pre-approved budget`
            : `${getTripSummary(action.draft).headline} - ${
                chain.length
              } approval step(s) required`,
        },
      ];

      if (covering) {
        const remainingAfter =
          remainingOf(covering, state.requests) - action.draft.estimatedCost;
        audit.push({
          id: uid(),
          timestamp: now,
          actor: "System",
          action: "Auto-approved under pre-approved budget",
          detail: `Covered by the ${covering.department} pre-approved budget (${formatMoney(
            Math.max(0, remainingAfter),
            org.currency
          )} remaining of ${formatMoney(covering.amount, org.currency)}) — ready to book`,
        });
      }

      const request: TravelRequest = {
        ...action.draft,
        id: uid(),
        reference: nextRef(),
        orgId: org.id,
        currency: org.currency,
        status: chain.length > 0 ? "PENDING" : "APPROVED",
        policy,
        chain,
        coveredByPreApprovalId: covering ? covering.id : undefined,
        createdAt: now,
        audit,
      };

      return {
        ...state,
        requests: [request, ...state.requests],
        selectedRequestId: request.id,
        view: "trips",
      };
    }

    case "DECIDE": {
      const requests = state.requests.map((req) =>
        req.id === action.requestId
          ? applyDecision(req, action.decision, action.comment, action.actor)
          : req
      );
      return { ...state, requests };
    }

    case "DECIDE_TRIP": {
      const ids = new Set(action.requestIds);
      const requests = state.requests.map((req) =>
        ids.has(req.id)
          ? applyDecision(req, action.decision, action.comment, action.actor)
          : req
      );
      return { ...state, requests };
    }

    case "BOOK": {
      const requests = state.requests.map((req) => {
        if (req.id !== action.requestId) return req;
        if (req.status !== "APPROVED") return req;
        const now = new Date().toISOString();
        const bookingReference = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          ...req,
          status: "BOOKED" as const,
          bookingReference,
          invoiceStatus: "ISSUED" as const,
          audit: [
            ...req.audit,
            {
              id: uid(),
              timestamp: now,
              actor: action.actor,
              action: "Trip booked via internal booking system",
              detail: `Booking reference ${bookingReference} - confirmation sent to ${req.travelerName}`,
            },
          ],
        };
      });
      return { ...state, requests };
    }

    case "CANCEL": {
      const requests = state.requests.map((req) => {
        if (req.id !== action.requestId) return req;
        if (req.status !== "APPROVED" && req.status !== "BOOKED") return req;
        const now = new Date().toISOString();
        return {
          ...req,
          status: "CANCELLED" as const,
          audit: [
            ...req.audit,
            {
              id: uid(),
              timestamp: now,
              actor: action.actor,
              action: "Trip cancelled",
            },
          ],
        };
      });
      return { ...state, requests };
    }

    case "COMPLETE": {
      const requests = state.requests.map((req) => {
        if (req.id !== action.requestId) return req;
        if (req.status !== "BOOKED") return req;
        const now = new Date().toISOString();
        return {
          ...req,
          status: "COMPLETED" as const,
          audit: [
            ...req.audit,
            {
              id: uid(),
              timestamp: now,
              actor: action.actor,
              action: "Trip completed",
            },
          ],
        };
      });
      return { ...state, requests };
    }

    case "ADVANCE_INVOICE": {
      const requests = state.requests.map((req) => {
        if (req.id !== action.requestId) return req;
        if (!req.invoiceStatus) return req;
        const next = nextInvoiceStatus[req.invoiceStatus];
        if (!next) return req;
        const now = new Date().toISOString();
        return {
          ...req,
          invoiceStatus: next,
          audit: [
            ...req.audit,
            {
              id: uid(),
              timestamp: now,
              actor: action.actor,
              action: invoiceActionLabel[req.invoiceStatus],
            },
          ],
        };
      });
      return { ...state, requests };
    }

    case "UPDATE_CHAIN": {
      const organizations = state.organizations.map((o) =>
        o.id === action.orgId ? { ...o, approvalSteps: action.steps } : o
      );
      return { ...state, organizations };
    }

    case "UPDATE_POLICY": {
      const organizations = state.organizations.map((o) =>
        o.id === action.orgId ? { ...o, policy: action.policy } : o
      );
      return { ...state, organizations };
    }

    case "UPDATE_USER_ROLE": {
      const users = state.users.map((u) =>
        u.id === action.userId ? { ...u, role: action.role } : u
      );
      return { ...state, users };
    }

    case "ADD_PREAPPROVAL": {
      const preApproval: PreApproval = {
        id: `pa-${uid().slice(0, 8)}`,
        orgId: action.orgId,
        department: action.department,
        amount: action.amount,
        approverName: action.approverName,
        note: action.note || undefined,
        createdAt: new Date().toISOString(),
        active: true,
      };
      return { ...state, preApprovals: [preApproval, ...state.preApprovals] };
    }

    case "REVOKE_PREAPPROVAL": {
      const preApprovals = state.preApprovals.map((pa) =>
        pa.id === action.id ? { ...pa, active: false } : pa
      );
      return { ...state, preApprovals };
    }

    case "ADD_ORG": {
      const org: Organization = {
        id: `org-${uid().slice(0, 6)}`,
        name: action.name,
        description: action.description,
        currency: action.currency,
        policy: {
          maxTripCost: action.maxTripCost,
          restrictedDestinations: action.restrictedDestinations,
          maxAdvanceBookingDays: 120,
          notes: "Default policy created at onboarding — edit in the admin console.",
        },
        approvalSteps: [
          {
            id: `${uid().slice(0, 6)}-1`,
            order: 1,
            name: "Line Manager",
            approverName: action.approverName,
            trigger: "ALWAYS",
          },
        ],
        departmentBudgets: [],
      };
      return { ...state, organizations: [...state.organizations, org] };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentOrg: Organization;
  orgRequests: TravelRequest[];
  orgUsers: User[];
  orgPreApprovals: PreApproval[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppContextValue>(() => {
    const currentOrg =
      state.organizations.find((o) => o.id === state.currentOrgId) ??
      state.organizations[0];
    const orgRequests = state.requests.filter(
      (r) => r.orgId === state.currentOrgId
    );
    const orgUsers = state.users.filter((u) => u.orgId === state.currentOrgId);
    const orgPreApprovals = state.preApprovals.filter(
      (p) => p.orgId === state.currentOrgId
    );
    return { state, dispatch, currentOrg, orgRequests, orgUsers, orgPreApprovals };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
