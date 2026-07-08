# Discovery Workshop Plan

A structured deep-dive (~4–6 weeks) that converts the presale vision into a validated, buildable MVP — front-loading the highest-risk unknowns.

---

## Schedule at a glance

| # | Workshop | When |
|---|----------|------|
| W0 | Kickoff & alignment | Week 1 |
| W1 | Business goals, KPIs & success | Week 1 |
| W2 | Users, roles, org model & onboarding | Week 1–2 |
| W3 | Current process & unified Trip | Week 2 |
| W4 | Travel policy & approval workflows | Week 2–3 |
| W5 | Booking integration (+ spike review) | Week 3 |
| W6 | Payments, invoicing & Business Central | Week 3–4 |
| W7 | Security, compliance & duty-of-care | Week 4 |
| W8 | UX, design system & branding | Week 4 |
| W9 | MVP scope & release planning | Week 5 |
| W10 | Architecture baseline & delivery readout | Week 6 |

---

## W0–W1 · Align & measure

- **W0 Kickoff:** RACI, cadence, confirm customer case team as decision-makers, validate assumptions & schedule, agree scope-as-flex.
- **W1 Business goals & KPIs:** confirm drivers, define measurable KPIs & baselines, define pilot success and cohort.

---

## W2 · Users, roles, org model & onboarding

- Walk each of the 6 roles → permissions matrix.
- Book-on-behalf-of rules; **Agent act-on-behalf boundaries + audit**; Agent-vs-Org-Admin support split.
- Org structure: departments, cost centers, inheritance.
- **Org onboarding** flow (assisted vs. self-serve; draft→go-live; activation email).
- **Employee provisioning** (SSO JIT / invite / CSV / SCIM); invitation emails; approver→employee mapping source.

---

## W3–W4 · Process & policy

- **W3 Current process & Trip:** as-is journey, multi-stage trip pain → design the Trip object; agent-in-loop boundaries.
- **W4 Policy & approvals:** real 1–3 level examples, trigger dimensions & thresholds, enforcement model, **who configures policies in MVP**.

---

## W5–W6 · Integration & finance

- **W5 Booking integration (+ spike):** API coverage/auth/limits, no direct provider in MVP, anti-corruption layer, invoicing workaround.
- **W6 Payments & Business Central:** centralized invoicing + corporate card, BC integration approach & mapping, PCI-scope minimization.

---

## W7–W8 · Security & UX

- **W7 Security & compliance:** SSO/MFA & IdPs, GDPR, **data residency**, retention; duty-of-care roadmap.
- **W8 UX & design system:** brand assets, key-screen walkthrough (request + approval), accessibility, responsive/mobile expectations.

---

## W9–W10 · Decide & baseline

- **W9 Scope & release planning:** confirm MoSCoW, agree Release 1/2 + hardening, identify pilot orgs & go-live criteria.
- **W10 Architecture & delivery readout:** target architecture, integration layer, hosting/residency, delivery model, sign-off to build.

---

## Discovery outputs

- Validated **MVP scope** + prioritized backlog with estimates
- **As-is/to-be process maps** + unified Trip definition
- **Policy & approval engine** spec + enforcement/config decisions
- **Integration design** + spike findings + risk log
- **Finance/BC** + **security/compliance** specs (incl. data residency)
- **UX** principles + design-system decision + key-screen prototypes
- **Architecture baseline** + delivery plan + sign-off

---

## Running in parallel

- **Integration spike (Weeks 2–3)** — the single most important de-risking activity.
- **Design-system starter (Weeks 3–4)** — enough to build Release 1 screens.
- **Continuous backlog refinement** with the customer case team.
