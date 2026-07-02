import type { Role } from "../types";

// All navigable views in the app.
export type ViewId =
  | "dashboard"
  | "create"
  | "trips"
  | "approvals"
  | "simulate"
  | "admin"
  | "activity"
  | "finance"
  | "reporting"
  | "clients"
  | "notifications";

export interface FlowStep {
  title: string;
  description: string;
  view?: ViewId; // where this step is actually performed in the prototype
}

export interface RoleMeta {
  label: string;
  blurb: string;
  accent: { text: string; bg: string; solid: string; border: string };
}

export const roleMeta: Record<Role, RoleMeta> = {
  TRAVELER: {
    label: "Traveler",
    blurb: "Employee who needs to travel.",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      solid: "bg-violet-600",
      border: "border-violet-300",
    },
  },
  ARRANGER: {
    label: "Travel Arranger",
    blurb: "Books travel on behalf of employees.",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      solid: "bg-emerald-600",
      border: "border-emerald-300",
    },
  },
  APPROVER: {
    label: "Approver",
    blurb: "Reviews and approves travel requests.",
    accent: {
      text: "text-orange-700",
      bg: "bg-orange-50",
      solid: "bg-orange-500",
      border: "border-orange-300",
    },
  },
  ADMIN: {
    label: "Organization Administrator",
    blurb: "Manages organization settings, users and policies.",
    accent: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      solid: "bg-teal-600",
      border: "border-teal-300",
    },
  },
  FINANCE: {
    label: "Finance",
    blurb: "Handles invoicing, payments and reconciliation.",
    accent: {
      text: "text-brand-700",
      bg: "bg-brand-50",
      solid: "bg-brand-600",
      border: "border-brand-300",
    },
  },
  AGENT: {
    label: "Key Travel Agent",
    blurb: "Key Travel super-admin managing all client organizations.",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      solid: "bg-indigo-600",
      border: "border-indigo-300",
    },
  },
};

// End-to-end flows mirroring the "User Flows by Role" diagram.
export const roleFlows: Record<Role, FlowStep[]> = {
  TRAVELER: [
    { title: "Log in", description: "Access the platform via SSO and land on the dashboard.", view: "dashboard" },
    { title: "New trip request", description: "Create a trip request: purpose, destination, dates, budget.", view: "create" },
    { title: "Policy check", description: "System validates against travel policy and shows guidance.", view: "create" },
    { title: "Submit request", description: "Submit the request for approval.", view: "create" },
    { title: "Track approval", description: "Monitor approval status in real time.", view: "trips" },
    { title: "Book travel", description: "Once approved, book flights, hotels, cars within policy.", view: "trips" },
    { title: "Manage trip", description: "View itinerary, request changes or cancellations.", view: "trips" },
    { title: "Trip completion", description: "Trip completed; provide feedback if enabled.", view: "trips" },
  ],
  ARRANGER: [
    { title: "Log in", description: "Access the platform and go to the arranger dashboard.", view: "dashboard" },
    { title: "Create request for others", description: "Search or select traveler(s) and create a trip request.", view: "create" },
    { title: "Policy check", description: "Review policy warnings or constraints before submission.", view: "create" },
    { title: "Submit for approval", description: "Submit for the appropriate approval workflow.", view: "create" },
    { title: "Monitor approvals", description: "Track status and handle additional information requests.", view: "trips" },
    { title: "Book travel", description: "Book approved travel on behalf of travelers within policy.", view: "trips" },
    { title: "Manage trips", description: "Make changes, add services, rebook or cancel if needed.", view: "trips" },
    { title: "Reporting (optional)", description: "View trip summary or download itineraries.", view: "reporting" },
  ],
  APPROVER: [
    { title: "Notification", description: "Receive email / in-app notification for a new request.", view: "notifications" },
    { title: "Review request", description: "Open request details: traveler, purpose, itinerary, cost.", view: "approvals" },
    { title: "Policy & budget check", description: "View policy results, budget impact, context and comments.", view: "approvals" },
    { title: "Approve / reject", description: "Approve, reject or send back for modification with comments.", view: "approvals" },
    { title: "Escalation (if needed)", description: "Request is routed to the next approver in the workflow.", view: "approvals" },
    { title: "Final decision", description: "Final approval granted or request rejected; traveler notified.", view: "approvals" },
  ],
  ADMIN: [
    { title: "Log in", description: "Access the admin console.", view: "dashboard" },
    { title: "Manage users", description: "Invite users, assign roles, manage permissions.", view: "admin" },
    { title: "Manage policies", description: "Create and maintain travel policies, rules, exceptions.", view: "admin" },
    { title: "Manage approval workflows", description: "Configure approval flows and assign approvers.", view: "admin" },
    { title: "Manage budgets", description: "Set budgets by department, project or cost center.", view: "admin" },
    { title: "Manage integrations", description: "Configure integrations (booking system, finance/ERP, SSO).", view: "admin" },
    { title: "Monitor activity", description: "View activity logs, user actions and policy violations.", view: "activity" },
  ],
  FINANCE: [
    { title: "View invoices", description: "Access issued invoices for trips and services.", view: "finance" },
    { title: "Validate & review", description: "Review invoice details, taxes and supporting documents.", view: "finance" },
    { title: "Reconcile & approve", description: "Reconcile with ERP and approve payments if applicable.", view: "finance" },
    { title: "Process payments", description: "Payments processed through the configured payment method.", view: "finance" },
    { title: "Statements", description: "View account statements, payment history and balances.", view: "finance" },
    { title: "Reports", description: "Download financial reports and spend summaries.", view: "reporting" },
  ],
  AGENT: [
    { title: "Platform overview", description: "Monitor spend, activity and compliance across all clients.", view: "dashboard" },
    { title: "Manage clients", description: "Onboard organizations and maintain their configuration.", view: "clients" },
    { title: "Drill into a client", description: "Open a client's admin console to manage policies and users.", view: "clients" },
    { title: "Cross-client reporting", description: "Analyse spend and travel patterns across the portfolio.", view: "reporting" },
  ],
};

// Which top-level views each role can navigate to.
export const roleNav: Record<Role, ViewId[]> = {
  TRAVELER: ["dashboard", "create", "trips"],
  ARRANGER: ["dashboard", "create", "trips", "reporting"],
  APPROVER: ["dashboard", "approvals", "create", "trips", "simulate"],
  ADMIN: ["dashboard", "admin", "trips", "activity", "simulate"],
  FINANCE: ["dashboard", "finance", "trips", "reporting"],
  AGENT: ["dashboard", "clients", "reporting"],
};

// Base labels; some are refined per-role in the header (e.g. My vs Team trips).
export const viewLabel: Record<ViewId, string> = {
  dashboard: "Dashboard",
  create: "New request",
  trips: "My trips",
  approvals: "Approvals",
  simulate: "Chain simulator",
  admin: "Admin console",
  activity: "Activity log",
  finance: "Finance",
  reporting: "Reporting",
  clients: "Client organizations",
  notifications: "Notifications",
};

export function labelForView(view: ViewId, role: Role): string {
  if (view === "trips") {
    if (role === "TRAVELER") return "My trips";
    if (role === "ARRANGER") return "Team trips";
    return "Trips";
  }
  if (view === "create" && role === "ARRANGER") return "New request (for others)";
  return viewLabel[view];
}
