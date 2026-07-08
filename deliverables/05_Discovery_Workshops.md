# Discovery Sprint (1 week)

A short, intensive week at the very start to agree the key decisions, so the team can begin building with confidence. We deliberately tackle the riskiest unknowns first — how the existing booking system connects, the travel rules, and security/privacy. Anything less urgent is sorted out as we go during the first build stage.

| Day | Focus | Who from the client should join |
|-----|-------|--------------------------------|
| **1** | Goals, people & roles, onboarding | Project sponsor, Key Travel team, operations, IT |
| **2** | Booking process, the "trip", travel rules | Experienced agents, approvers, administrators |
| **3** | Booking-system link + payments & invoicing | Booking-system / IT experts, finance |
| **4** | Security, privacy & look-and-feel | Security/privacy lead, brand owner |
| **5** | Final scope + technical plan | Sponsor, technical lead |

### Day 1 — Goals, people & roles, onboarding
- Agree **what success looks like** and how we'll measure it (self-service rate, agent time saved, request-to-confirmation time).
- Confirm the **pilot organisations** and the criteria that prove the portal is ready to scale.
- Walk through the **six roles** and exactly what each can see and do.
- Decide **how staff get accounts** — single sign-on (SSO), MFA, starter staff list, welcome email.
- Agree **how Key Travel sets up and supports** each organisation in the MVP (and what becomes self-service later).

### Day 2 — Booking process, the "trip", travel rules
- Map **today's agent-led booking process** end to end and spot the manual pain points.
- Design the **future self-service flow**: request → policy check → approvals → book → invoice.
- Define what counts as **one "trip"** (multi-segment: flight + hotel + car).
- Agree the **policy rules** — spending limits, restricted destinations, cabin class, department, role/seniority — and how **soft enforcement** (warn + justify) behaves.
- Confirm **who configures the rules** (Key Travel-assisted in the MVP).

### Day 3 — Booking-system link + payments & invoicing
- Review **what the existing booking APIs cover** (search / book / change / cancel) and where the gaps are.
- Assess **documentation quality** and the risks around the "translator" layer.
- Agree how the **agent hand-off** works for anything the platform can't complete.
- Define **central invoicing** and the **Microsoft Business Central** data flow (no invoicing API today).
- Confirm **company-card payment** and card-security (PCI) needs.

### Day 4 — Security, privacy & look-and-feel
- Confirm **login and access** — SSO/MFA, roles & permissions, session rules.
- Agree **data privacy (GDPR)** obligations and **where data is stored** (UK/EU — to confirm).
- Define the **audit trail**: who did what, and when.
- Review **branding** and walk the **main screens** (request, approvals queue, trip view).

### Day 5 — Final scope + technical plan
- Lock the **MVP scope** (Must features) and the **Should/Could** stretch list.
- Agree the **release plan** and milestones across the ~9 months.
- Confirm the **high-level technical approach** and the delivery team setup.
- Capture **open risks and assumptions** with owners and a follow-up date.

**Happening in parallel (and continuing after the week):** a technical deep-dive into the booking-system link (the biggest unknown — starts Day 3, continues into the first build stage) · an early design/branding starter · ongoing refinement of the plan as each part begins.

**What we walk away with:** an agreed first-version scope and to-do list · a map of the travel process and a clear definition of a "trip" · the policy & approval rules · a plan (and risk list) for the booking-system link · the finance, security and privacy requirements · the technical foundation and delivery plan.
