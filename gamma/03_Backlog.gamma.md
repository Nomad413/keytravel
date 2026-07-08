# High-Level Backlog & Release Plan

Epics → features → MoSCoW → a 9-month MVP release plan.

---

## Epics at a glance

- **E1** Identity, Organizations & People
- **E2** Travel Request & Unified Trip
- **E3** Policy Engine
- **E4** Approval Workflows
- **E5** Integration Layer (existing booking APIs)
- **E6** Finance & Invoicing
- **E7** Notifications
- **E8** Reporting & KPIs
- **E9** Platform / Security / Cross-cutting

---

## E1 · Identity, Organizations & People

- Multi-tenant organizations — **M**
- Employee & profile management — **M**
- Role-based access control (6 roles) — **M**
- Book-on-behalf-of — **M**
- Agent cross-org support & **act-on-behalf (audited)** — **M**
- **Agent-assisted org onboarding** (draft → go-live) — **M**
- **Invitations & activation emails** — **M**
- **SSO Just-in-Time provisioning** — **M**
- Cost centers & departments — **S**
- Bulk user import (CSV) — **S**
- Self-service onboarding wizard — **C**
- SCIM / HRIS auto-provisioning — **C**

---

## E2 · Travel Request & Unified Trip

- Guided travel request (who/where/when/purpose) — **M**
- Search flights / hotels / cars via existing API — **M**
- Unified multi-modal **Trip** object (groups segments) — **M**
- Status tracking (Pending → Approved → Booked → Completed) — **M**
- Add rail/bus leg as **agent-assisted segment** — **S**
- **Automated** rail & bus/coach booking — **W (post-MVP)**

---

## E3 · Policy Engine

- Per-org configurable policy rules — **M**
- Trigger dimensions: **cost, destination, travel class, employee role** (incl. VIP/leadership oversight — configurable either direction) — **M**
- **Soft enforcement** — warn + justification — **M**
- In-policy / warning / violation evaluation — **M**

---

## E4 · Approval Workflows

- Configurable **1–3 level sequential** approvals — **M**
- Approver queue with full context & flags — **M**
- **Rule-driven routing** (cost/destination/class/role/out-of-policy adds steps) — **M**
- Delegation / out-of-office — **S**
- Parallel / conditional / >3-level graphs — **W (post-MVP)**

---

## E5 · Integration Layer

- Anti-corruption layer over existing APIs — **M**
- Reuse search / book / change / cancel — **M**
- **Agent exception handoff** for failed/complex bookings — **M**
- Direct provider (GDS) integration — **W (post-MVP)**

---

## E6 · Finance & Invoicing

- **Centralized invoicing** generated in-platform (no booking invoice API) — **M**
- **Corporate card** payment model — **M**
- Cost-center allocation — **M**
- **MS Business Central** export/reconciliation — **M**
- Individual traveler payments — **W (post-MVP)**

---

## Cross-cutting (E7–E9)

- SSO + MFA — **M**
- GDPR, audit trail — **M**
- Email notifications (approvals, status, invites) — **M**
- KPI instrumentation & basic dashboards — **M**
- Advanced analytics / savings dashboards — **C/W**
- Duty-of-care / traveler tracking — **W (post-MVP)**

---

## What's in the MVP

- Multi-tenant orgs, people, RBAC, book-on-behalf-of
- **Agent-assisted onboarding + SSO JIT + invitation/activation emails**
- **Agent cross-org support & act-on-behalf (audited)**
- Travel request + unified multi-modal Trip + status
- Policy engine (cost/destination/class/role) + soft enforcement
- 1–3 level configurable approvals + approver queue
- Integration layer + agent handoff
- Centralized invoicing + corporate card + MS Business Central
- SSO/MFA, GDPR, audit, KPIs — **delivered as a responsive web app**

---

## Explicitly out of MVP (Later)

- Automated rail & bus/coach booking (Trip is multi-modal now)
- Native / PWA mobile app
- Org-admin self-serve config & self-onboarding wizard
- SCIM / HRIS auto-provisioning
- Direct provider integration · advanced analytics
- Duty-of-care · individual traveler payments · complex approval graphs

---

## 9-month release plan

| Phase | When | Focus |
|-------|------|-------|
| **Phase 0** | Weeks 1–6 | Discovery, integration spike, architecture baseline, design starter |
| **Release 1** | Months 2–5 | Request → Approve: orgs/people/RBAC, onboarding, request+Trip, policy, approvals, SSO |
| **Release 2** | Months 5–8 | Approve → Book → Invoice: booking, change/cancel, invoicing, Business Central |
| **Hardening** | Months 8–9 | Perf/security, data residency, UAT, pilot go-live, KPIs |

Fixed budget + speed → **scope is the flexible variable**, MoSCoW-managed, continuous demos.
