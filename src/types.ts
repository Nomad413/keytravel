// Domain model for the Key Travel B2B approval-workflow prototype.
// All data is in-memory; there is no backend.

// AGENT = Key Travel Agent: platform super-admin who manages the client
// organizations. All other roles operate within a single client organization.
export type Role =
  | "TRAVELER"
  | "ARRANGER"
  | "APPROVER"
  | "ADMIN"
  | "FINANCE"
  | "AGENT";

export type TripType = "FLIGHT" | "HOTEL" | "CAR";

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
export type RoomType = "STANDARD" | "DELUXE" | "SUITE";
export type CarClass = "ECONOMY" | "COMPACT" | "SUV" | "PREMIUM";

// Seniority of the traveler — a policy/approval dimension the client called out
// ("employee role" as a trigger). Kept coarse-grained for the prototype.
export type TravelerSeniority = "STAFF" | "MANAGER" | "EXECUTIVE";

// When an approval step is triggered within an organization's chain.
export type StepTrigger =
  | "ALWAYS" // every request goes through this step
  | "COST_OVER" // only when estimated cost exceeds `threshold`
  | "DESTINATION_RESTRICTED" // only when the destination is policy-restricted
  | "CLASS_ABOVE" // only when the flight cabin exceeds `cabinThreshold`
  | "ROLE_ABOVE" // only when the traveler's seniority is at/above `roleThreshold`
  | "OUT_OF_POLICY"; // only when the request breaches a policy rule

// A configurable approval step as defined by an organization admin.
export interface ApprovalStepConfig {
  id: string;
  order: number;
  name: string; // e.g. "Line Manager"
  approverName: string; // demo stand-in for a resolved approver
  trigger: StepTrigger;
  threshold?: number; // used when trigger === "COST_OVER"
  cabinThreshold?: CabinClass; // used when trigger === "CLASS_ABOVE"
  roleThreshold?: TravelerSeniority; // used when trigger === "ROLE_ABOVE"
}

// Rules that determine whether a request is within an organization's policy.
export interface PolicyRules {
  maxTripCost: number; // soft cap; above this the trip is out-of-policy
  restrictedDestinations: string[]; // require extra scrutiny / approval
  maxCabinClass?: CabinClass; // highest permitted flight cabin; above = out-of-policy
  maxAdvanceBookingDays?: number; // informational only in the prototype
  notes?: string;
}

export interface DepartmentBudget {
  department: string;
  limitAmount: number; // annual travel budget for the department
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  currency: string; // ISO code, e.g. "GBP"
  policy: PolicyRules;
  approvalSteps: ApprovalStepConfig[];
  departmentBudgets: DepartmentBudget[];
}

export interface User {
  id: string;
  name: string;
  orgId: string;
  role: Role;
  department: string;
  title: string;
  seniority?: TravelerSeniority; // defaults to STAFF when unset
}

// ---- Runtime (per-request) types ----

export type RequestStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED";

// Lifecycle of the invoice raised once a trip is booked (Finance flow).
export type InvoiceStatus = "ISSUED" | "VALIDATED" | "RECONCILED" | "PAID";

export type StepDecision =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INFO_REQUESTED";

export interface ApprovalStepInstance {
  id: string;
  order: number;
  name: string;
  approverName: string;
  reason: string; // why this step was added to the chain
  decision: StepDecision;
  comment?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export type FlagSeverity = "ok" | "warning" | "violation";

export interface PolicyFlag {
  severity: FlagSeverity;
  message: string;
}

export interface PolicyEvaluation {
  inPolicy: boolean;
  requiresApproval: boolean;
  flags: PolicyFlag[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
}

// The shape of the form used to create a request.
// Common fields apply to every trip type; the type-specific blocks below are
// only populated for the relevant `tripType`. `destination` (city / country) is
// always set because the policy engine evaluates it for every trip type.
export interface TravelRequestDraft {
  travelerName: string;
  requestedByName: string;
  department: string;
  tripType: TripType;
  destination: string; // city / country - used by the policy engine + summary
  purpose: string;
  estimatedCost: number;
  travelerSeniority?: TravelerSeniority; // drives role-based approval triggers
  justification?: string; // required when out-of-policy (soft enforcement)

  // Trip linking: a flight, hotel and car request can belong to one trip.
  tripId?: string;
  tripName?: string;

  // Flight-specific
  origin?: string;
  departDate?: string;
  returnDate?: string;
  cabinClass?: CabinClass;
  oneWay?: boolean;
  adults?: number;
  // ...selected flight option details
  airline?: string;
  flightNumber?: string;
  departTime?: string;
  arriveTime?: string;
  durationLabel?: string;
  stops?: number;

  // Hotel-specific
  checkInDate?: string;
  checkOutDate?: string;
  roomType?: RoomType;
  guests?: number;
  // ...selected hotel option details
  hotelName?: string;
  hotelAddress?: string;
  hotelUrl?: string;
  hotelRating?: number;

  // Car-rental-specific
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  carClass?: CarClass;
  // ...selected car option details
  carVendor?: string;
  carModel?: string;
}

export interface TravelRequest extends TravelRequestDraft {
  id: string;
  reference: string; // human-friendly, e.g. "KT-1042"
  orgId: string;
  currency: string;
  status: RequestStatus;
  policy: PolicyEvaluation;
  chain: ApprovalStepInstance[];
  audit: AuditEntry[];
  createdAt: string;
  bookingReference?: string; // set when booked via the internal booking system
  invoiceStatus?: InvoiceStatus; // set when booked; progressed by Finance
}
