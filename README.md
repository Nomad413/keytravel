# Key Travel B2B — Travel Request & Multi-Level Approval (Prototype)

An interactive, **role-based** prototype of the proposed Key Travel B2B travel platform,
centered on its most differentiating capability: **travel request creation with live policy
checks and configurable, multi-level approval workflows** — now set within the end-to-end
user flows for each role (Traveler, Travel Arranger, Approver, Organization Administrator,
Finance).

It was built for the Presale Consultant assignment to make the solution vision tangible and
to demonstrate the client's stated concern that *"different organizations may have different
approval structures"* and *"some organizations require multi-level approvals."*

> Prototype only: all data is in-memory (no backend, no persistence). Refresh the page to
> reset to the seeded demo state.

## Tech stack

- React 18 + TypeScript
- Vite (dev server / build)
- Tailwind CSS (styling)

## Getting started

Prerequisites: Node.js 18+ (built and tested on Node 24).

```bash
npm install
npm run dev
```

Vite will print a local URL (default http://localhost:5173) and open it automatically.

Other scripts:

```bash
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## What it demonstrates

- **Role-based experience** — the app is driven by five roles from the "User Flows by Role"
  design (Traveler, Travel Arranger, Approver, Organization Administrator, Finance). Each
  role has its own navigation and a **dashboard that renders that role's end-to-end flow**
  as clickable steps, mirroring the flow diagram. Switch role in the top bar to change the
  whole workspace.
- **Trip-type-specific booking UX** — Flight, Hotel, and Car rental each have their own
  form, fields, icon, and accent colour (e.g. flights capture origin/cabin/round-trip vs.
  one-way; hotels capture check-in/out, room type, guests; cars capture pick-up/drop-off
  locations, dates, and car class). All three feed the same policy and approval engine.
- **Live policy engine** — as a request is entered, it is evaluated against the selected
  organization's policy (cost limit, restricted destinations) with clear in-policy /
  warning / violation flags (soft enforcement: out-of-policy travel is allowed but must be
  justified and is escalated).
- **Configurable multi-level approvals** — an approval chain is generated per request from
  the organization's rules. Steps can trigger *always*, *over a cost threshold*, on a
  *restricted destination*, or when a request is *out of policy*.
- **Different orgs, different chains** — three seeded organizations produce visibly
  different chains for the same trip:
  - **HopeBridge Relief (NGO):** single Line Manager, plus a Security Officer for restricted destinations.
  - **Atlas University:** Department Head, plus a Grants & Finance gate for trips over GBP 2,000.
  - **MediGlobal Health:** three-level chain (Line Manager, Regional Director over GBP 1,000, Compliance for out-of-policy).
- **Full trip lifecycle** — `Pending (level 1..n) -> Approved -> Booked -> Completed`, plus
  `Rejected` and `Cancelled`, with book / manage / cancel / complete actions and a full audit
  trail per trip.
- **Finance flow** — once booked, an invoice is raised and moves through
  `Issued -> Validated -> Reconciled -> Paid`, with a statements view.
- **Self-service administration** — an admin console for users, policies, approval workflows
  (reorder/add/edit steps and triggers), department budgets, and integrations.

The app loads with several seeded requests across all trip types and lifecycle states
(pending, approved, booked, completed) so every role's screens are populated on first run.

## Roles and screens

Switch **Role** and **Organization** in the top bar; navigation adapts to the role.

- **Dashboard** (all roles) — the role's end-to-end flow as clickable steps, key stats, and a status legend.
- **New request** (Traveler, Arranger) — pick Flight / Hotel / Car, with a live policy check and approval-chain preview.
- **My / Team trips** (Traveler, Arranger) — track approvals, book, manage/cancel, and complete trips; per-trip audit log.
- **Approvals** (Approver) — pending requests with policy flags; approve / reject / request info (multi-level = escalation).
- **Chain simulator** (Approver, Admin) — a what-if tool showing how cost / destination change the generated chain.
- **Admin console** (Admin) — Users, Policies, Approval workflows, Budgets, Integrations.
- **Activity log** (Admin) — full organization-wide audit trail.
- **Finance** (Finance) — invoices with validate / reconcile / process-payment actions, and statements.
- **Reporting** (Arranger, Finance) — spend by trip type / department and requests by status.
- **Notifications** (all roles) — real-time in-app activity feed.

## Suggested demo script

1. **Traveler (Org = HopeBridge Relief).** On the Dashboard, walk the end-to-end flow. Go to
   New request, enter a flight to *Nairobi* at *GBP 1,250* (in policy, single approver), then
   change to *Khartoum, Sudan* at *GBP 2,100* to trigger a restricted-destination warning and
   budget violation (justification required, chain grows). Submit.
2. **Approver.** Switch role to Approver, open Approvals, and approve the request through each
   level (multi-level escalation).
3. **Back to Traveler → My trips.** Book the approved trip, then mark it completed; review the
   audit trail.
4. **Finance.** Switch role to Finance, open Finance, and move an invoice from Issued →
   Validated → Reconciled → Paid; check Statements.
5. **Org Admin.** Switch role to Administrator, open Admin console, edit a policy or reorder an
   approval workflow, and view Budgets. Switch Organization to *MediGlobal Health* to show a
   completely different three-level chain from the same engine.

## Project structure

```
src/
  types.ts                 Domain model + request/invoice state types
  data/seed.ts             Seeded organizations, users, budgets, and requests
  lib/policy.ts            Policy evaluation + approval-chain generation engine
  lib/trip.ts              Trip-type labels, summaries, and validation
  lib/flows.ts             Role flow definitions + per-role navigation config
  state/store.tsx          App state (reducer + context): requests, roles, lifecycle actions
  components/              Reusable UI (badges, stepper, legend, approval-chain view, icons)
  screens/                 Dashboard, CreateRequest, MyTrips, ApproverInbox, ChainSimulator,
                           AdminConsole, AdminBuilder, ActivityLog, Finance, Reporting, Notifications
  App.tsx                  Layout, role-based navigation, org/role switchers
```

## Scope note

This prototype focuses on the role-based request-to-approval-to-finance experience. Real
inventory / GDS booking, authentication, payments, and persistence are intentionally out of
scope and are represented visually (e.g. "Book travel" simulates handing off to the existing
internal booking system; invoice steps simulate the finance/ERP hand-off).
