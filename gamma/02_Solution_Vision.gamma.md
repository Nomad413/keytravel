# Key Travel — A self-service B2B platform for organizational travel

Presale & Discovery Proposal · Trinetix — Presale Consultant

From an internal, agent-driven, manual process to a modern platform where client organizations self-serve travel — policy-checked and routed through configurable approvals, with Key Travel's booking engine behind the scenes.

---

## The situation today

- Booking platform is **internal & agent-only** — clients phone/email, agents do the work.
- Approvals, exception handling and **invoicing are manual** — slow and error-prone.
- Multi-stage trips (flight + rail + hotel) span different modules with **no joint "trip" concept**.
- Growth means **more agent hours per booking** — the model can't scale.

---

## What Key Travel wants

A customer-facing B2B platform for organizations to:

- Manage **people, roles & permissions**
- Submit, policy-check and **approve travel** (multi-level)
- **Book** flights / hotels / cars via the existing booking system
- Configure **policies & approval workflows**

**Constraints:** ~9-month MVP · limited budget · minimal client engineering capacity.

---

## Vision statement

> Give Key Travel's organizational clients a single, self-service platform to manage their people, travel policies and end-to-end trips — with the right approvals applied automatically and Key Travel's booking engine behind the scenes — so travel gets booked **faster, within policy, and with far less manual effort** on both sides.

---

## Design principles

- **Reuse over rebuild** — wrap the existing booking engine; don't re-implement it.
- **Thin, high-value MVP** — ship the end-to-end spine before breadth.
- **Configurable, not coded** — orgs, policies & approvals are data; onboarding is configuration.
- **Assisted where it matters** — Key Travel agents stay in the loop for exceptions.
- **Compliant by design** — SSO/MFA, GDPR, audit from day one.

---

## Six roles we build for

- **Traveler** — requests a compliant trip; tracks approval.
- **Travel Arranger** — books on behalf of colleagues.
- **Approver (L1–L3)** — approves/rejects with full context & policy flags.
- **Organization Administrator** — manages people, roles, cost centers, policies.
- **Finance User** — centralized invoicing, cost allocation, Business Central export.
- **Key Travel Agent** — onboards/configures orgs, supports users, handles exceptions (act-on-behalf, audited).

---

## Six solution pillars

- **1 · Organization & People** — multi-tenant orgs, RBAC, cost centers, book-on-behalf-of, Agent-assisted onboarding.
- **2 · Policy & Approval** — data-driven rules (cost/destination/class/role) + 1–3 level approvals.
- **3 · Travel & Trip** — travel request + unified multi-modal **Trip**; search/book/change/cancel.
- **4 · Finance & Invoicing** — centralized invoicing, corporate card, MS Business Central.
- **5 · Integration Layer** — anti-corruption layer over existing (incomplete) booking APIs.
- **6 · Platform** — SSO/MFA, audit, notifications, reporting, scalability.

---

## The MVP "golden path"

**Request → policy check → approval → book → invoice**

1. **Create request** — who, where, when, purpose.
2. **Search options** — flights/hotels/cars via existing API.
3. **Policy check** — cost, destination, class, role → in/out of policy.
4. **Approvals (1–3)** — configurable chain; extra level if out of policy.
5. **Book** — via existing API; agent handles exceptions.
6. **Invoice** — centralized invoice → MS Business Central.

Out-of-policy travel is **allowed with justification** (soft enforcement) and escalated.

---

## Architecture & integration direction

- **SPA + API/BFF** over domain services: Identity/Org, Policy & Approval, Trip/Booking, Finance.
- **Anti-corruption integration layer** reuses search/book/change/cancel; isolates booking-system quirks.
- **Invoicing owned by us** (no API) and pushed to **MS Business Central**.
- **SSO + MFA**, tenant-aware **RBAC + audit**; PCI-minimizing card handling.
- **Multi-tenant**, scalable from pilot to hundreds of orgs.

> #1 unknown: the existing platform's APIs and docs are incomplete → **de-risk with a time-boxed integration spike in Phase 0**.

---

## Onboarding — organizations (Agent-assisted)

- Key Travel Agent creates the tenant in a **draft** state.
- Configures structure, policy, SSO and **Business Central** mapping.
- Runs a go-live checklist (validates a test request end-to-end).
- **Activation email** to the primary Org Admin **at go-live** — first login lands on a working workspace.

> Post-MVP: a self-serve org onboarding wizard.

---

## Onboarding — employees (no client engineering)

- **SSO Just-in-Time** provisioning — auto-create account with default Traveler role.
- **Admin invite + CSV import** — each invited user gets an invitation email.
- **Later:** SCIM / HRIS joiner-mover-leaver sync.

Each record carries role & permissions, department & cost center, **seniority** (VIP/leadership oversight) and delegate relationships.

---

## Support model — who fixes what

- **Org Admin:** routine self-service (users, budgets, view).
- **Key Travel Agent (assisted-support layer, MVP):** cross-org support, config, exception handling, **act-on-behalf** (audited).
- **Complementary, not a replacement** — the Agent carries heavier config/support in MVP while orgs grow into self-service.
- **Guardrails:** audited act-on-behalf, least-privilege, GDPR/consent-aware.

---

## Success metrics (12 months post-launch)

- **Adoption** — % of eligible requests self-service vs. agent.
- **Agent effort** — agent minutes per booking ↓; % auto-completed.
- **Satisfaction** — CSAT/NPS; request→confirmation cycle time.
- **Pilot** — # pilot orgs live & active; time-to-onboard.
- **Quality** — booking error / rework rate ↓.

---

## Delivery approach (~9 months)

- **Phase 0 (Wks 1–6)** — discovery, integration spike, architecture baseline, design starter.
- **Release 1 (Mo 2–5)** — Request → Approve: orgs/people/RBAC, request+Trip, policy engine, approvals, SSO.
- **Release 2 (Mo 5–8)** — Approve → Book → Invoice: booking, change/cancel, invoicing, Business Central.
- **Hardening (Mo 8–9)** — perf/security, data residency, UAT, onboard NGO/humanitarian pilots.

Fixed budget + speed pressure → **scope is the flexible variable** (MoSCoW).
