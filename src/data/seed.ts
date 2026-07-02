import type {
  Organization,
  TravelRequest,
  TravelRequestDraft,
  User,
} from "../types";
import { buildApprovalChain, evaluatePolicy } from "../lib/policy";
import { getTripSummary } from "../lib/trip";

// Three organizations with deliberately DIFFERENT approval structures and
// policies. This directly demonstrates the client's concern that
// "different organizations may have different approval structures".
export const organizations: Organization[] = [
  {
    id: "org-hope",
    name: "HopeBridge Relief (NGO)",
    description:
      "Humanitarian NGO. Simple single-manager approval, tight budgets, several restricted/high-risk destinations.",
    currency: "GBP",
    policy: {
      maxTripCost: 1500,
      restrictedDestinations: ["Russia", "Belarus", "Iran", "Venezuela"],
      maxAdvanceBookingDays: 90,
      notes:
        "Travel to high-risk / sanctioned regions requires security sign-off. Economy class only.",
    },
    approvalSteps: [
      {
        id: "hope-1",
        order: 1,
        name: "Line Manager",
        approverName: "Amara Okafor",
        trigger: "ALWAYS",
      },
      {
        id: "hope-2",
        order: 2,
        name: "Security & Safety Officer",
        approverName: "Daniel Reyes",
        trigger: "DESTINATION_RESTRICTED",
      },
    ],
    departmentBudgets: [
      { department: "Field Operations", limitAmount: 60000 },
      { department: "Programmes", limitAmount: 35000 },
      { department: "IT & Operations", limitAmount: 15000 },
    ],
  },
  {
    id: "org-atlas",
    name: "Atlas University",
    description:
      "Academic institution. Department-based approval with a finance gate for higher-cost trips funded by grants.",
    currency: "GBP",
    policy: {
      maxTripCost: 3500,
      restrictedDestinations: ["Russia", "Belarus"],
      maxAdvanceBookingDays: 180,
      notes:
        "Conference travel must map to a grant/project code. Premium economy allowed on long-haul.",
    },
    approvalSteps: [
      {
        id: "atlas-1",
        order: 1,
        name: "Department Head",
        approverName: "Prof. Helen Carter",
        trigger: "ALWAYS",
      },
      {
        id: "atlas-2",
        order: 2,
        name: "Grants & Finance Office",
        approverName: "Marcus Webb",
        trigger: "COST_OVER",
        threshold: 2000,
      },
    ],
    departmentBudgets: [
      { department: "Physics", limitAmount: 45000 },
      { department: "Humanities", limitAmount: 30000 },
      { department: "Research Office", limitAmount: 80000 },
    ],
  },
  {
    id: "org-medi",
    name: "MediGlobal Health",
    description:
      "Large humanitarian agency. Strict three-level chain with a compliance gate for out-of-policy travel.",
    currency: "GBP",
    policy: {
      maxTripCost: 2500,
      restrictedDestinations: ["Russia", "Iran", "North Korea"],
      maxAdvanceBookingDays: 120,
      notes:
        "All international travel is centrally coordinated. Out-of-policy trips need compliance review.",
    },
    approvalSteps: [
      {
        id: "medi-1",
        order: 1,
        name: "Line Manager",
        approverName: "Sofia Nkemcho",
        trigger: "ALWAYS",
      },
      {
        id: "medi-2",
        order: 2,
        name: "Regional Director",
        approverName: "James Whitfield",
        trigger: "COST_OVER",
        threshold: 1000,
      },
      {
        id: "medi-3",
        order: 3,
        name: "Compliance Office",
        approverName: "Priya Raman",
        trigger: "OUT_OF_POLICY",
      },
    ],
    departmentBudgets: [
      { department: "Logistics", limitAmount: 120000 },
      { department: "Medical Programmes", limitAmount: 200000 },
      { department: "Operations", limitAmount: 90000 },
    ],
  },
];

export const users: User[] = [
  // HopeBridge Relief
  {
    id: "u-1",
    name: "Elena Rossi",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Field Operations",
    title: "Programme Coordinator",
  },
  {
    id: "u-2",
    name: "Amara Okafor",
    orgId: "org-hope",
    role: "APPROVER",
    department: "Field Operations",
    title: "Line Manager",
  },
  {
    id: "u-3",
    name: "Tomás Alvarez",
    orgId: "org-hope",
    role: "ADMIN",
    department: "IT & Operations",
    title: "Travel Programme Admin",
  },
  {
    id: "u-4",
    name: "Grace Mensah",
    orgId: "org-hope",
    role: "ARRANGER",
    department: "Programmes",
    title: "Travel Arranger",
  },
  {
    id: "u-5",
    name: "Peter Lindqvist",
    orgId: "org-hope",
    role: "FINANCE",
    department: "Finance",
    title: "Finance Officer",
  },
  // Atlas University
  {
    id: "u-6",
    name: "Dr. Nadia Khan",
    orgId: "org-atlas",
    role: "TRAVELER",
    department: "Physics",
    title: "Senior Lecturer",
  },
  {
    id: "u-7",
    name: "Prof. Helen Carter",
    orgId: "org-atlas",
    role: "APPROVER",
    department: "Physics",
    title: "Department Head",
  },
  {
    id: "u-8",
    name: "Marcus Webb",
    orgId: "org-atlas",
    role: "FINANCE",
    department: "Research Office",
    title: "Grants & Finance Lead",
  },
  {
    id: "u-9",
    name: "Sarah Bright",
    orgId: "org-atlas",
    role: "ADMIN",
    department: "IT Services",
    title: "Systems Administrator",
  },
  // MediGlobal Health
  {
    id: "u-10",
    name: "Ahmed Hassan",
    orgId: "org-medi",
    role: "TRAVELER",
    department: "Logistics",
    title: "Logistics Officer",
  },
  {
    id: "u-11",
    name: "Sofia Nkemcho",
    orgId: "org-medi",
    role: "APPROVER",
    department: "Logistics",
    title: "Line Manager",
  },
  {
    id: "u-12",
    name: "Priya Raman",
    orgId: "org-medi",
    role: "ADMIN",
    department: "Operations",
    title: "Compliance & Systems Admin",
  },

  // Additional travelers — give arrangers a real pool for multi-traveler trips.
  // HopeBridge Relief
  {
    id: "u-13",
    name: "Lucas Moreau",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Field Operations",
    title: "Field Engineer",
  },
  {
    id: "u-14",
    name: "Ingrid Larsen",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Programmes",
    title: "Programme Officer",
  },
  {
    id: "u-15",
    name: "Daniel Owusu",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Logistics",
    title: "Logistics Coordinator",
  },
  {
    id: "u-16",
    name: "Fatima Al-Sayed",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Field Operations",
    title: "WASH Specialist",
  },
  {
    id: "u-17",
    name: "James Whitfield",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Programmes",
    title: "M&E Officer",
  },
  {
    id: "u-18",
    name: "Yuki Tanaka",
    orgId: "org-hope",
    role: "TRAVELER",
    department: "Field Operations",
    title: "Logistics Analyst",
  },
  // Atlas University
  {
    id: "u-19",
    name: "Dr. Omar Farouk",
    orgId: "org-atlas",
    role: "TRAVELER",
    department: "Physics",
    title: "Research Fellow",
  },
  {
    id: "u-20",
    name: "Emily Zhang",
    orgId: "org-atlas",
    role: "TRAVELER",
    department: "Chemistry",
    title: "Postdoctoral Researcher",
  },
  {
    id: "u-21",
    name: "Robert King",
    orgId: "org-atlas",
    role: "TRAVELER",
    department: "Engineering",
    title: "Senior Lecturer",
  },
  {
    id: "u-22",
    name: "Laura Bianchi",
    orgId: "org-atlas",
    role: "TRAVELER",
    department: "Physics",
    title: "PhD Researcher",
  },
  // MediGlobal Health
  {
    id: "u-23",
    name: "Maria Santos",
    orgId: "org-medi",
    role: "TRAVELER",
    department: "Logistics",
    title: "Supply Chain Officer",
  },
  {
    id: "u-24",
    name: "Kevin Brown",
    orgId: "org-medi",
    role: "TRAVELER",
    department: "Medical Programmes",
    title: "Field Doctor",
  },
  {
    id: "u-25",
    name: "Aisha Bello",
    orgId: "org-medi",
    role: "TRAVELER",
    department: "Operations",
    title: "Operations Coordinator",
  },
];

// Default acting user per role, used when the demo switches role.
export const defaultUserByRole: Record<string, string> = {
  TRAVELER: "Elena Rossi",
  ARRANGER: "Grace Mensah",
  APPROVER: "Amara Okafor",
  ADMIN: "Tomás Alvarez",
  FINANCE: "Peter Lindqvist",
  AGENT: "Olivia Bennett (Key Travel)",
};

let refCounter = 1041;
const nextRef = () => `KT-${refCounter++}`;

function buildRequest(
  org: Organization,
  draft: TravelRequestDraft,
  createdAt: string
): TravelRequest {
  const policy = evaluatePolicy(org, draft);
  const chain = buildApprovalChain(org, draft);

  return {
    ...draft,
    id: crypto.randomUUID(),
    reference: nextRef(),
    orgId: org.id,
    currency: org.currency,
    status: chain.length > 0 ? "PENDING" : "APPROVED",
    policy,
    chain,
    audit: [
      {
        id: crypto.randomUUID(),
        timestamp: createdAt,
        actor: draft.requestedByName,
        action: "Request submitted",
        detail: getTripSummary(draft).headline,
      },
    ],
    createdAt,
  };
}

let bookingSeq = 5200;
const nextBookingRef = () => `BK-${bookingSeq++}`;

// Fast-forward a request to a booked (and optionally completed) state so the
// Finance and Trips screens have realistic data on load.
function asBooked(req: TravelRequest, completed = false): TravelRequest {
  const chain = req.chain.map((s) => ({
    ...s,
    decision: "APPROVED" as const,
    decidedBy: s.approverName,
    decidedAt: req.createdAt,
    comment: undefined,
  }));
  const bookingReference = nextBookingRef();
  const audit = [
    ...req.audit,
    {
      id: crypto.randomUUID(),
      timestamp: req.createdAt,
      actor: "System",
      action: "All approvals complete - ready to book",
    },
    {
      id: crypto.randomUUID(),
      timestamp: req.createdAt,
      actor: req.requestedByName,
      action: "Trip booked via internal booking system",
      detail: `Booking reference ${bookingReference}`,
    },
  ];
  if (completed) {
    audit.push({
      id: crypto.randomUUID(),
      timestamp: req.createdAt,
      actor: "System",
      action: "Trip completed",
    });
  }
  return {
    ...req,
    chain,
    status: completed ? "COMPLETED" : "BOOKED",
    bookingReference,
    invoiceStatus: "ISSUED",
    audit,
  };
}

// Fully approved but not yet booked (shows in the approver "Approved" history
// and the traveler "ready to book" queue).
function asApproved(req: TravelRequest): TravelRequest {
  const chain = req.chain.map((s) => ({
    ...s,
    decision: "APPROVED" as const,
    decidedBy: s.approverName,
    decidedAt: req.createdAt,
  }));
  return {
    ...req,
    chain,
    status: "APPROVED",
    audit: [
      ...req.audit,
      ...chain.map((s) => ({
        id: crypto.randomUUID(),
        timestamp: req.createdAt,
        actor: s.approverName,
        action: `Approved at step "${s.name}"`,
      })),
      {
        id: crypto.randomUUID(),
        timestamp: req.createdAt,
        actor: "System",
        action: "All approvals complete - ready to book",
      },
    ],
  };
}

// Rejected at a given step (defaults to the first). Populates approver history.
function asRejected(
  req: TravelRequest,
  reason = "Does not meet current travel policy.",
  atStep = 0
): TravelRequest {
  const chain = req.chain.map((s, i) =>
    i < atStep
      ? { ...s, decision: "APPROVED" as const, decidedBy: s.approverName, decidedAt: req.createdAt }
      : i === atStep
      ? {
          ...s,
          decision: "REJECTED" as const,
          decidedBy: s.approverName,
          decidedAt: req.createdAt,
          comment: reason,
        }
      : s
  );
  return {
    ...req,
    chain,
    status: "REJECTED",
    audit: [
      ...req.audit,
      {
        id: crypto.randomUUID(),
        timestamp: req.createdAt,
        actor: chain[atStep].approverName,
        action: `Rejected at step "${chain[atStep].name}"`,
        detail: reason,
      },
    ],
  };
}

// Assign a shared trip id/name to a set of requests so they render as one trip.
let tripSeq = 700;
function linkTrip(tripName: string, reqs: TravelRequest[]): TravelRequest[] {
  const tripId = `trip-${tripSeq++}`;
  return reqs.map((r) => ({ ...r, tripId, tripName }));
}

const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// Seeded requests covering all three trip types and multiple lifecycle states so
// every role's screens (and analytics) are populated on load. HopeBridge (the
// default org) gets the most data; other orgs get a spread to show variety.
export const seedRequests: TravelRequest[] = [
  // ===================== HopeBridge Relief =====================

  // Pending - Flight - in policy - single approver
  buildRequest(
    organizations[0],
    {
      travelerName: "Elena Rossi",
      requestedByName: "Elena Rossi",
      department: "Field Operations",
      tripType: "FLIGHT",
      destination: "Madrid, Spain",
      purpose: "Partner programme review",
      estimatedCost: 1250,
      origin: "London (LHR)",
      departDate: "2026-08-04",
      returnDate: "2026-08-15",
      cabinClass: "ECONOMY",
      oneWay: false,
      airline: "Iberia",
      flightNumber: "IB3167",
      departTime: "07:30",
      arriveTime: "11:05",
      durationLabel: "2h 35m",
      stops: 0,
    },
    "2026-06-28T09:15:00.000Z"
  ),
  // Pending - Hotel - restricted destination + over budget - 2 approvers
  buildRequest(
    organizations[0],
    {
      travelerName: "Marcus Bello",
      requestedByName: "Elena Rossi",
      department: "Field Operations",
      tripType: "HOTEL",
      destination: "Tehran, Iran",
      purpose: "Field assessment mission",
      estimatedCost: 1800,
      checkInDate: "2026-09-01",
      checkOutDate: "2026-09-08",
      roomType: "STANDARD",
      guests: 1,
      hotelName: "Grand Plaza Tehran",
      hotelAddress: "Valiasr St, Tehran, Iran",
      hotelUrl: maps("Grand Plaza Tehran"),
      hotelRating: 4,
      justification:
        "Assessment mission to a sanctioned region; no in-policy accommodation available nearby.",
    },
    "2026-06-29T14:40:00.000Z"
  ),

  // PENDING multi-booking trip (2 flights + 2 hotels + 1 car) — lets the
  // approver demo "approve whole trip" vs deciding each booking separately.
  ...linkTrip("Madrid & Barcelona roadshow — Oct 2026", [
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "FLIGHT",
        destination: "Madrid, Spain",
        purpose: "Partner roadshow — leg 1",
        estimatedCost: 1150,
        origin: "London (LHR)",
        departDate: "2026-10-05",
        returnDate: "2026-10-09",
        cabinClass: "ECONOMY",
        oneWay: true,
        airline: "Iberia",
        flightNumber: "IB3163",
        departTime: "08:10",
        arriveTime: "11:40",
        durationLabel: "2h 30m",
        stops: 0,
      },
      "2026-06-30T09:00:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "FLIGHT",
        destination: "Barcelona, Spain",
        purpose: "Partner roadshow — leg 2 return",
        estimatedCost: 990,
        origin: "Barcelona (BCN)",
        departDate: "2026-10-12",
        cabinClass: "ECONOMY",
        oneWay: true,
        airline: "Vueling",
        flightNumber: "VY7810",
        departTime: "18:20",
        arriveTime: "20:05",
        durationLabel: "2h 05m",
        stops: 0,
      },
      "2026-06-30T09:01:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Madrid, Spain",
        purpose: "Partner roadshow — Madrid stay",
        estimatedCost: 720,
        checkInDate: "2026-10-05",
        checkOutDate: "2026-10-08",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "NH Collection Madrid Suecia",
        hotelAddress: "Calle del Marqués de Casa Riera 4, Madrid, Spain",
        hotelUrl: maps("NH Collection Madrid Suecia"),
        hotelRating: 4,
      },
      "2026-06-30T09:02:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Barcelona, Spain",
        purpose: "Partner roadshow — Barcelona stay",
        estimatedCost: 560,
        checkInDate: "2026-10-08",
        checkOutDate: "2026-10-12",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Hotel Barcelona Center",
        hotelAddress: "Carrer de Balmes 103, Barcelona, Spain",
        hotelUrl: maps("Hotel Barcelona Center"),
        hotelRating: 4,
      },
      "2026-06-30T09:03:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "CAR",
        destination: "Barcelona, Spain",
        purpose: "Partner roadshow — local transfers",
        estimatedCost: 260,
        pickupLocation: "Barcelona Airport (BCN)",
        dropoffLocation: "Barcelona Airport (BCN)",
        pickupDate: "2026-10-08",
        dropoffDate: "2026-10-12",
        carClass: "ECONOMY",
        carVendor: "Europcar",
        carModel: "Seat León",
      },
      "2026-06-30T09:04:00.000Z"
    ),
  ]),

  // PENDING multi-booking trip (1 flight + 2 hotels + 1 car) for a colleague.
  ...linkTrip("Lisbon & Porto field visit — Nov 2026", [
    buildRequest(
      organizations[0],
      {
        travelerName: "Marcus Bello",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "FLIGHT",
        destination: "Lisbon, Portugal",
        purpose: "Field visit — programme review",
        estimatedCost: 1090,
        origin: "London (LHR)",
        departDate: "2026-11-03",
        returnDate: "2026-11-10",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "TAP Air Portugal",
        flightNumber: "TP1363",
        departTime: "09:45",
        arriveTime: "12:20",
        durationLabel: "2h 35m",
        stops: 0,
      },
      "2026-06-30T10:00:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Marcus Bello",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Lisbon, Portugal",
        purpose: "Field visit — Lisbon stay",
        estimatedCost: 610,
        checkInDate: "2026-11-03",
        checkOutDate: "2026-11-06",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Hotel Mundial Lisbon",
        hotelAddress: "Praça Martim Moniz 2, Lisbon, Portugal",
        hotelUrl: maps("Hotel Mundial Lisbon"),
        hotelRating: 4,
      },
      "2026-06-30T10:01:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Marcus Bello",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Porto, Portugal",
        purpose: "Field visit — Porto stay",
        estimatedCost: 480,
        checkInDate: "2026-11-06",
        checkOutDate: "2026-11-10",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Porto A.S. 1829 Hotel",
        hotelAddress: "Largo São Domingos 45, Porto, Portugal",
        hotelUrl: maps("Porto AS 1829 Hotel"),
        hotelRating: 4,
      },
      "2026-06-30T10:02:00.000Z"
    ),
    buildRequest(
      organizations[0],
      {
        travelerName: "Marcus Bello",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "CAR",
        destination: "Lisbon, Portugal",
        purpose: "Field visit — intercity transfers",
        estimatedCost: 320,
        pickupLocation: "Lisbon Airport (LIS)",
        dropoffLocation: "Porto Airport (OPO)",
        pickupDate: "2026-11-03",
        dropoffDate: "2026-11-10",
        carClass: "ECONOMY",
        carVendor: "Sixt",
        carModel: "Renault Clio",
      },
      "2026-06-30T10:03:00.000Z"
    ),
  ]),

  // Linked booked trip: flight + hotel + car for one project mission
  ...linkTrip("Vienna project mission — Sep 2026", [
    asBooked(
      buildRequest(
        organizations[0],
        {
          travelerName: "Elena Rossi",
          requestedByName: "Elena Rossi",
          department: "Field Operations",
          tripType: "FLIGHT",
          destination: "Vienna, Austria",
          purpose: "Project mission — coordination",
          estimatedCost: 1180,
          origin: "London (LHR)",
          departDate: "2026-09-05",
          returnDate: "2026-09-14",
          cabinClass: "ECONOMY",
          oneWay: false,
          airline: "Austrian Airlines",
          flightNumber: "OS456",
          departTime: "10:05",
          arriveTime: "13:20",
          durationLabel: "2h 15m",
          stops: 0,
        },
        "2026-06-18T08:00:00.000Z"
      )
    ),
    asBooked(
      buildRequest(
        organizations[0],
        {
          travelerName: "Elena Rossi",
          requestedByName: "Elena Rossi",
          department: "Field Operations",
          tripType: "HOTEL",
          destination: "Vienna, Austria",
          purpose: "Project mission — coordination",
          estimatedCost: 640,
          checkInDate: "2026-09-05",
          checkOutDate: "2026-09-14",
          roomType: "STANDARD",
          guests: 1,
          hotelName: "Park Central Hotel Vienna",
          hotelAddress: "Kärntner Ring 8, Vienna, Austria",
          hotelUrl: maps("Park Central Hotel Vienna"),
          hotelRating: 4,
        },
        "2026-06-18T08:05:00.000Z"
      )
    ),
    asBooked(
      buildRequest(
        organizations[0],
        {
          travelerName: "Elena Rossi",
          requestedByName: "Elena Rossi",
          department: "Field Operations",
          tripType: "CAR",
          destination: "Vienna, Austria",
          purpose: "Project mission — coordination",
          estimatedCost: 280,
          pickupLocation: "Vienna Airport (VIE)",
          dropoffLocation: "Vienna Airport (VIE)",
          pickupDate: "2026-09-05",
          dropoffDate: "2026-09-14",
          carClass: "SUV",
          carVendor: "Avis",
          carModel: "Toyota RAV4",
        },
        "2026-06-18T08:10:00.000Z"
      )
    ),
  ]),

  // Booked / completed history (for Finance + spend analytics)
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "Grace Mensah",
        requestedByName: "Grace Mensah",
        department: "Programmes",
        tripType: "FLIGHT",
        destination: "Rome, Italy",
        purpose: "Partner coordination meeting",
        estimatedCost: 980,
        origin: "London (LHR)",
        departDate: "2026-07-14",
        returnDate: "2026-07-17",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "British Airways",
        flightNumber: "BA548",
        departTime: "08:15",
        arriveTime: "12:05",
        durationLabel: "2h 50m",
        stops: 0,
      },
      "2026-06-20T10:00:00.000Z"
    )
  ),
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Dublin, Ireland",
        purpose: "Regional donor workshop",
        estimatedCost: 720,
        checkInDate: "2026-06-02",
        checkOutDate: "2026-06-05",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Riverside Inn Dublin",
        hotelAddress: "18 Custom House Quay, Dublin, Ireland",
        hotelUrl: maps("Riverside Inn Dublin"),
        hotelRating: 4,
      },
      "2026-05-28T09:00:00.000Z"
    ),
    true
  ),
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "Grace Mensah",
        requestedByName: "Grace Mensah",
        department: "Programmes",
        tripType: "FLIGHT",
        destination: "Amsterdam, Netherlands",
        purpose: "Partner review",
        estimatedCost: 1290,
        origin: "London (LHR)",
        departDate: "2026-05-10",
        returnDate: "2026-05-18",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "KLM",
        flightNumber: "KL1002",
        departTime: "08:40",
        arriveTime: "11:05",
        durationLabel: "1h 25m",
        stops: 0,
      },
      "2026-04-22T09:00:00.000Z"
    ),
    true
  ),
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Amsterdam, Netherlands",
        purpose: "Partner review",
        estimatedCost: 690,
        checkInDate: "2026-05-10",
        checkOutDate: "2026-05-18",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Grand Plaza Amsterdam",
        hotelAddress: "Dam Square 1, Amsterdam, Netherlands",
        hotelUrl: maps("Grand Plaza Amsterdam"),
        hotelRating: 4,
      },
      "2026-04-22T09:05:00.000Z"
    ),
    true
  ),
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "David Okoye",
        requestedByName: "Grace Mensah",
        department: "Programmes",
        tripType: "FLIGHT",
        destination: "Barcelona, Spain",
        purpose: "Regional coordination",
        estimatedCost: 1150,
        origin: "London (LHR)",
        departDate: "2026-07-02",
        returnDate: "2026-07-09",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "Vueling",
        flightNumber: "VY8003",
        departTime: "13:30",
        arriveTime: "16:50",
        durationLabel: "2h 20m",
        stops: 0,
      },
      "2026-06-10T09:00:00.000Z"
    )
  ),
  asBooked(
    buildRequest(
      organizations[0],
      {
        travelerName: "Grace Mensah",
        requestedByName: "Grace Mensah",
        department: "Programmes",
        tripType: "FLIGHT",
        destination: "Geneva, Switzerland",
        purpose: "UN cluster meeting",
        estimatedCost: 1240,
        origin: "London (LHR)",
        departDate: "2026-04-08",
        returnDate: "2026-04-11",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "British Airways",
        flightNumber: "BA732",
        departTime: "07:40",
        arriveTime: "10:25",
        durationLabel: "1h 45m",
        stops: 0,
      },
      "2026-03-20T09:00:00.000Z"
    ),
    true
  ),

  // Approver history — approved (ready to book)
  asApproved(
    buildRequest(
      organizations[0],
      {
        travelerName: "Elena Rossi",
        requestedByName: "Elena Rossi",
        department: "Field Operations",
        tripType: "FLIGHT",
        destination: "Brussels, Belgium",
        purpose: "EU partner briefing",
        estimatedCost: 780,
        origin: "London (LHR)",
        departDate: "2026-09-22",
        returnDate: "2026-09-24",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "British Airways",
        flightNumber: "BA392",
        departTime: "06:55",
        arriveTime: "09:10",
        durationLabel: "1h 15m",
        stops: 0,
      },
      "2026-06-25T09:00:00.000Z"
    )
  ),
  // Approver history — rejected examples
  asRejected(
    buildRequest(
      organizations[0],
      {
        travelerName: "David Okoye",
        requestedByName: "David Okoye",
        department: "Programmes",
        tripType: "FLIGHT",
        destination: "Dubai, UAE",
        purpose: "Supplier visit",
        estimatedCost: 2600,
        origin: "London (LHR)",
        departDate: "2026-08-01",
        returnDate: "2026-08-05",
        cabinClass: "BUSINESS",
        oneWay: false,
        airline: "Emirates",
        flightNumber: "EK008",
        departTime: "14:30",
        arriveTime: "01:05",
        durationLabel: "7h 05m",
        stops: 0,
      },
      "2026-06-15T09:00:00.000Z"
    ),
    "Business class is not permitted; economy only per HopeBridge policy."
  ),
  asRejected(
    buildRequest(
      organizations[0],
      {
        travelerName: "Marcus Bello",
        requestedByName: "Grace Mensah",
        department: "Field Operations",
        tripType: "HOTEL",
        destination: "Minsk, Belarus",
        purpose: "Partner assessment",
        estimatedCost: 900,
        checkInDate: "2026-07-20",
        checkOutDate: "2026-07-27",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "City Inn Minsk",
        hotelAddress: "Nezavisimosti Ave, Minsk, Belarus",
        hotelUrl: maps("City Inn Minsk"),
        hotelRating: 3,
        justification: "Assessment mission requested by partner team.",
      },
      "2026-06-12T09:00:00.000Z"
    ),
    "Travel to Belarus is suspended on security grounds.",
    1
  ),

  // ===================== Atlas University =====================
  buildRequest(
    organizations[1],
    {
      travelerName: "Dr. Nadia Khan",
      requestedByName: "Dr. Nadia Khan",
      department: "Physics",
      tripType: "CAR",
      destination: "Berlin, Germany",
      purpose: "Conference travel",
      estimatedCost: 600,
      pickupLocation: "Berlin BER Airport",
      dropoffLocation: "Berlin BER Airport",
      pickupDate: "2026-10-10",
      dropoffDate: "2026-10-14",
      carClass: "COMPACT",
      carVendor: "Europcar",
      carModel: "VW Golf",
    },
    "2026-06-27T11:05:00.000Z"
  ),
  asBooked(
    buildRequest(
      organizations[1],
      {
        travelerName: "Dr. Nadia Khan",
        requestedByName: "Dr. Nadia Khan",
        department: "Physics",
        tripType: "FLIGHT",
        destination: "Boston, USA",
        purpose: "Physics conference (APS)",
        estimatedCost: 2800,
        origin: "London (LHR)",
        departDate: "2026-05-03",
        returnDate: "2026-05-09",
        cabinClass: "PREMIUM_ECONOMY",
        oneWay: false,
        airline: "British Airways",
        flightNumber: "BA213",
        departTime: "11:20",
        arriveTime: "14:05",
        durationLabel: "7h 45m",
        stops: 0,
      },
      "2026-04-01T09:00:00.000Z"
    ),
    true
  ),
  asApproved(
    buildRequest(
      organizations[1],
      {
        travelerName: "Dr. Nadia Khan",
        requestedByName: "Dr. Nadia Khan",
        department: "Physics",
        tripType: "FLIGHT",
        destination: "Tokyo, Japan",
        purpose: "Research collaboration",
        estimatedCost: 3200,
        origin: "London (LHR)",
        departDate: "2026-11-02",
        returnDate: "2026-11-12",
        cabinClass: "PREMIUM_ECONOMY",
        oneWay: false,
        airline: "Japan Airlines",
        flightNumber: "JL044",
        departTime: "18:55",
        arriveTime: "15:30",
        durationLabel: "11h 35m",
        stops: 0,
      },
      "2026-06-24T09:00:00.000Z"
    )
  ),
  asRejected(
    buildRequest(
      organizations[1],
      {
        travelerName: "Dr. Nadia Khan",
        requestedByName: "Dr. Nadia Khan",
        department: "Physics",
        tripType: "FLIGHT",
        destination: "Moscow, Russia",
        purpose: "Symposium",
        estimatedCost: 1500,
        origin: "London (LHR)",
        departDate: "2026-09-01",
        returnDate: "2026-09-05",
        cabinClass: "ECONOMY",
        oneWay: false,
        airline: "Lufthansa",
        flightNumber: "LH1450",
        departTime: "09:10",
        arriveTime: "16:40",
        durationLabel: "3h 30m",
        stops: 1,
      },
      "2026-06-14T09:00:00.000Z"
    ),
    "Russia is a restricted destination; travel not authorised."
  ),

  // ===================== MediGlobal Health =====================
  buildRequest(
    organizations[2],
    {
      travelerName: "Ahmed Hassan",
      requestedByName: "Ahmed Hassan",
      department: "Logistics",
      tripType: "FLIGHT",
      destination: "Geneva, Switzerland",
      purpose: "Inter-agency coordination summit",
      estimatedCost: 3000,
      origin: "London (LHR)",
      departDate: "2026-08-20",
      returnDate: "2026-08-24",
      cabinClass: "BUSINESS",
      oneWay: false,
      airline: "British Airways",
      flightNumber: "BA732",
      departTime: "07:40",
      arriveTime: "10:25",
      durationLabel: "1h 45m",
      stops: 0,
      justification:
        "Donor-approved business class for overnight connections to the summit.",
    },
    "2026-06-30T08:20:00.000Z"
  ),
  ...linkTrip("Singapore logistics deployment — Aug 2026", [
    asBooked(
      buildRequest(
        organizations[2],
        {
          travelerName: "Ahmed Hassan",
          requestedByName: "Ahmed Hassan",
          department: "Logistics",
          tripType: "FLIGHT",
          destination: "Singapore, Singapore",
          purpose: "Supply chain deployment",
          estimatedCost: 1400,
          origin: "London (LHR)",
          departDate: "2026-08-08",
          returnDate: "2026-08-20",
          cabinClass: "ECONOMY",
          oneWay: false,
          airline: "Singapore Airlines",
          flightNumber: "SQ317",
          departTime: "11:45",
          arriveTime: "08:15",
          durationLabel: "13h 30m",
          stops: 0,
        },
        "2026-06-16T09:00:00.000Z"
      )
    ),
    asBooked(
      buildRequest(
        organizations[2],
        {
          travelerName: "Ahmed Hassan",
          requestedByName: "Ahmed Hassan",
          department: "Logistics",
          tripType: "HOTEL",
          destination: "Singapore, Singapore",
          purpose: "Supply chain deployment",
          estimatedCost: 780,
          checkInDate: "2026-08-08",
          checkOutDate: "2026-08-20",
          roomType: "STANDARD",
          guests: 1,
          hotelName: "The Continental Singapore",
          hotelAddress: "10 Orchard Rd, Singapore",
          hotelUrl: maps("The Continental Singapore"),
          hotelRating: 4,
        },
        "2026-06-16T09:05:00.000Z"
      )
    ),
  ]),
  asRejected(
    buildRequest(
      organizations[2],
      {
        travelerName: "Ahmed Hassan",
        requestedByName: "Ahmed Hassan",
        department: "Logistics",
        tripType: "HOTEL",
        destination: "Tehran, Iran",
        purpose: "Warehouse assessment",
        estimatedCost: 1200,
        checkInDate: "2026-09-10",
        checkOutDate: "2026-09-16",
        roomType: "STANDARD",
        guests: 1,
        hotelName: "Harbour View Suites Tehran",
        hotelAddress: "Ferdowsi St, Tehran, Iran",
        hotelUrl: maps("Harbour View Suites Tehran"),
        hotelRating: 3,
        justification: "Warehouse capacity assessment for regional response.",
      },
      "2026-06-13T09:00:00.000Z"
    ),
    "Iran requires HQ security clearance, not yet granted.",
    2
  ),
];
