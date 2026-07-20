# Discovery Sprint (1 week — minimum, working hypothesis)

> **This 1-week plan is a working hypothesis — the *minimum* I'd propose, not a fixed ceiling.** A tightly-run week is enough to agree the decisions that unblock the build **provided** the right people are in the room and the booking-system experts are available. If the existing system turns out more complex, or stakeholders are harder to convene, discovery may need longer — or simply continue **alongside** early build. We'd rather start lean and extend if the evidence demands it than hold the whole team back waiting for perfect clarity.

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
- Define what counts as **one "trip"** (multi-segment: flight + hotel + car) — the client noted agents split multi-stage trips (air + rail + hotel) across systems today with no joint trip object; MVP covers air/hotel/car, **rail/bus later**.
- Agree the **policy rules** — spending limits, restricted destinations, cabin class, department, role/seniority — and how **soft enforcement** (warn + justify) behaves.
- Confirm **who configures the rules** (Key Travel-assisted in the MVP).

### Day 3 — Booking-system link + payments & invoicing
- Review **what the existing booking APIs cover** — booking, changes and cancellations are confirmed; **confirm search-via-API**, and note **invoicing is manual (no API)** — and where the gaps are.
- Assess **documentation quality** and the risks around the "translator" layer.
- Agree how the **agent hand-off** works for anything the platform can't complete.
- Define **central invoicing** and the **Microsoft Business Central** data flow (no invoicing API today).
- Confirm **company-card payment** and card-security (PCI) needs.

### Day 4 — Security, privacy & look-and-feel
- Confirm **login and access** — SSO/MFA, roles & permissions, session rules.
- Agree **data privacy (GDPR)** obligations and **where data is stored** (UK/EU — to confirm).
- Define the **audit trail**: who did what, and when.
- Agree the **measurement plan** — the success-metric events to capture, the "before" baseline, and the **analytics tooling** (own a thin event layer now; pick the tool later, with **data-residency** deciding EU-hosted vs. self-hosted).
- Review **branding** and walk the **main screens** (request, approvals queue, trip view).

### Day 5 — Final scope + technical plan
- Lock the **MVP scope** (Must features) and the **Should/Could** stretch list.
- Agree the **release plan** and milestones across the ~9 months.
- Confirm the **high-level technical approach** and the delivery team setup.
- Capture **open risks and assumptions** with owners and a follow-up date.

## Build in parallel — discovery is not a gate
To protect the ~9-month timeline, we **don't wait for all discovery results before starting**. Low-risk foundation and setup work begins on **Day 1**, in parallel with the workshops, and each stream picks up decisions the moment they land:
- **Foundation & setup** (no discovery dependency): repositories, environments, CI/CD, the app skeleton, secure-login (SSO/MFA) scaffolding, and the multi-tenant structure.
- **Booking-system "translator" spike** (the biggest unknown, and the *one exception* to the 1-week frame): a **time-boxed technical spike of up to ~2 weeks, run in parallel** — starting **Day 3** and continuing into the first build stage. The aim is to prove we can search / book / change / cancel through the existing system and get figures into Business Central — or to confirm the agent hand-off fallback. Under-investing here is the classic way a fixed-timeline project gets a nasty mid-project surprise, so this risk gets a little more room than the rest.
- **Design/branding starter:** early screens for the core request → approve → book flow.
- **Prototype as a discovery tool:** we validate the flow, roles and policy model with client SMEs against the **working prototype** — reacting to something concrete is faster and cheaper than authoring specs (and fits the client's minimal engineering capacity).
- **Continuous hand-off:** as each decision is agreed during the week, the relevant build stream starts immediately — so implementation **ramps up *with* discovery, not after it**.

## After the sprint — continuous discovery
Rather than a second big phase, remaining questions are folded into normal **sprint refinement** — lightweight, just-in-time, and close to the code. We keep a live **risk register** with owners; discovery is "done enough" once integration feasibility is proven (or a fallback agreed), the MVP **Must** scope is locked, the architecture baseline and data-residency are decided, and no *blocking* questions remain.

**What we walk away with:** an agreed first-version scope and to-do list · a map of the travel process and a clear definition of a "trip" · the policy & approval rules · a plan (and risk list) for the booking-system link · the finance, security and privacy requirements · the technical foundation and delivery plan.
