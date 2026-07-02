import type {
  DepartmentBudget,
  RequestStatus,
  TravelRequest,
  TripType,
} from "../types";

export interface RankItem {
  label: string;
  count: number;
  spend: number;
}

export interface TypeStat {
  type: TripType;
  count: number;
  spend: number;
}

export interface Insights {
  total: number;
  pending: number;
  approved: number; // status APPROVED (ready to book)
  booked: number; // BOOKED
  completed: number;
  cancelled: number;
  rejected: number;
  passedApproval: number; // APPROVED + BOOKED + COMPLETED
  bookedSpend: number; // BOOKED + COMPLETED
  pipelineSpend: number; // PENDING + APPROVED
  avgTripCost: number; // average across booked+completed
  inPolicyRate: number; // 0..100 across all non-cancelled requests
  approvalRate: number; // approved / (approved + rejected), 0..100
  tripCount: number; // distinct trips (tripId or standalone request)
  upcoming: number; // future-dated active trips
  byType: TypeStat[];
  topDestinations: RankItem[];
  topAirlines: RankItem[];
  topHotels: RankItem[];
  topTravelers: RankItem[];
  topDepartments: RankItem[];
  statusBreakdown: { status: RequestStatus; count: number }[];
}

const isSpend = (s: RequestStatus) => s === "BOOKED" || s === "COMPLETED";
const isActive = (s: RequestStatus) =>
  s === "PENDING" || s === "APPROVED" || s === "BOOKED" || s === "COMPLETED";

function tripStartDate(r: TravelRequest): string | undefined {
  return r.departDate ?? r.checkInDate ?? r.pickupDate;
}

function rank(
  requests: TravelRequest[],
  keyFn: (r: TravelRequest) => string | undefined
): RankItem[] {
  const map = new Map<string, RankItem>();
  for (const r of requests) {
    if (r.status === "CANCELLED" || r.status === "REJECTED") continue;
    const key = keyFn(r);
    if (!key) continue;
    const item = map.get(key) ?? { label: key, count: 0, spend: 0 };
    item.count += 1;
    if (isSpend(r.status)) item.spend += r.estimatedCost;
    map.set(key, item);
  }
  return [...map.values()].sort((a, b) =>
    b.count === a.count ? b.spend - a.spend : b.count - a.count
  );
}

export function computeInsights(
  requests: TravelRequest[],
  now: Date = new Date()
): Insights {
  const count = (fn: (r: TravelRequest) => boolean) =>
    requests.filter(fn).length;

  const pending = count((r) => r.status === "PENDING");
  const approved = count((r) => r.status === "APPROVED");
  const booked = count((r) => r.status === "BOOKED");
  const completed = count((r) => r.status === "COMPLETED");
  const cancelled = count((r) => r.status === "CANCELLED");
  const rejected = count((r) => r.status === "REJECTED");
  const passedApproval = approved + booked + completed;

  const spendReqs = requests.filter((r) => isSpend(r.status));
  const bookedSpend = spendReqs.reduce((s, r) => s + r.estimatedCost, 0);
  const pipelineSpend = requests
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    .reduce((s, r) => s + r.estimatedCost, 0);
  const avgTripCost = spendReqs.length
    ? Math.round(bookedSpend / spendReqs.length)
    : 0;

  const nonCancelled = requests.filter((r) => r.status !== "CANCELLED");
  const inPolicyCount = nonCancelled.filter((r) => r.policy.inPolicy).length;
  const inPolicyRate = nonCancelled.length
    ? Math.round((inPolicyCount / nonCancelled.length) * 100)
    : 100;
  const approvalRate =
    passedApproval + rejected > 0
      ? Math.round((passedApproval / (passedApproval + rejected)) * 100)
      : 0;

  const tripIds = new Set<string>();
  for (const r of requests) {
    if (r.status === "CANCELLED" || r.status === "REJECTED") continue;
    tripIds.add(r.tripId ?? r.id);
  }

  const upcoming = requests.filter((r) => {
    if (!isActive(r.status)) return false;
    const d = tripStartDate(r);
    return d ? new Date(d).getTime() >= now.getTime() : false;
  }).length;

  const byType: TypeStat[] = (["FLIGHT", "HOTEL", "CAR"] as TripType[]).map(
    (type) => {
      const rs = requests.filter(
        (r) => r.tripType === type && r.status !== "CANCELLED" && r.status !== "REJECTED"
      );
      return {
        type,
        count: rs.length,
        spend: rs
          .filter((r) => isSpend(r.status))
          .reduce((s, r) => s + r.estimatedCost, 0),
      };
    }
  );

  const statusOrder: RequestStatus[] = [
    "PENDING",
    "APPROVED",
    "BOOKED",
    "COMPLETED",
    "REJECTED",
    "CANCELLED",
  ];
  const statusBreakdown = statusOrder
    .map((status) => ({ status, count: count((r) => r.status === status) }))
    .filter((s) => s.count > 0);

  return {
    total: requests.length,
    pending,
    approved,
    booked,
    completed,
    cancelled,
    rejected,
    passedApproval,
    bookedSpend,
    pipelineSpend,
    avgTripCost,
    inPolicyRate,
    approvalRate,
    tripCount: tripIds.size,
    upcoming,
    byType,
    topDestinations: rank(requests, (r) => r.destination),
    topAirlines: rank(
      requests.filter((r) => r.tripType === "FLIGHT"),
      (r) => r.airline
    ),
    topHotels: rank(
      requests.filter((r) => r.tripType === "HOTEL"),
      (r) => r.hotelName
    ),
    topTravelers: rank(requests, (r) => r.travelerName),
    topDepartments: rank(requests, (r) => r.department),
    statusBreakdown,
  };
}

export interface BudgetUsage {
  department: string;
  limitAmount: number;
  used: number;
  pct: number; // 0..100+ (can exceed)
}

export function budgetUsage(
  requests: TravelRequest[],
  budgets: DepartmentBudget[]
): BudgetUsage[] {
  return budgets
    .map((b) => {
      const used = requests
        .filter(
          (r) =>
            r.department === b.department &&
            (r.status === "BOOKED" ||
              r.status === "COMPLETED" ||
              r.status === "APPROVED")
        )
        .reduce((s, r) => s + r.estimatedCost, 0);
      return {
        department: b.department,
        limitAmount: b.limitAmount,
        used,
        pct: b.limitAmount ? Math.round((used / b.limitAmount) * 100) : 0,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}
