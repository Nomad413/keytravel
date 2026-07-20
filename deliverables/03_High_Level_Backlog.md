# High-Level Backlog

The work grouped into **epics**. Within each epic, features are listed **in user-flow order**. Each MVP feature is tagged **M**ust · **S**hould · **C**ould (MoSCoW); the *Later* line lists deferred, post-MVP features.

> **How we prioritise:** the **MVP** launches as a **pilot to a few organisations** to prove the portal. Only the **Must** features are essential to that pilot; **Should/Could** are included if time allows. Time and budget are fixed, so **scope is the flexible part** — Musts first, then Should/Could, then *Later*.
>
> **M** = Must (core spine) · **S** = Should (valuable, not blocking) · **C** = Could (nice-to-have) · *Later* = post-MVP.
>
> **Who configures what in the MVP:** **Key Travel** sets up each organisation's **policies, approval workflows, budgets and integrations** during onboarding. **Managing your own users is the only org-admin self-service capability in the MVP** — self-service editing of everything else is *Later*.

## E1 · Organisations & people
*Set up each client organisation and its staff, and get everyone signed in.*
1. **M** · **Key Travel-assisted organisation setup (manual/internal)** — for the pilot, an agent sets up each organisation by hand (profile, structure, rules, system connections). No self-service onboarding flow is built yet — that's *Later*.
2. **S** · **Welcome / activation email at go-live** — an automated invite into a ready-to-use workspace (for a few pilot orgs an agent can also do this by hand).
3. **M** · **Single sign-on (SSO) login** — people sign in with their existing company account.
4. **M** · **Multi-factor authentication (MFA)** — a second verification step for secure access, **enforced through the organisation's SSO/identity provider** (a bespoke MFA system is only needed if non-SSO accounts are supported — a *Should*).
5. **S** · **Auto-create accounts on first sign-in (SSO JIT)** — new staff get an account automatically instead of being pre-loaded.
6. **M** · **Roles & permissions** — traveller, arranger, approver, admin, finance and agent each see only what their role allows.
7. **M** · **Org admin manages their own people** — invite, assign a role, or deactivate staff.
8. **C** · **Bulk staff upload** — import an initial staff list from a spreadsheet (a few pilot orgs can also be invited manually).
9. **M** · **Book on behalf of colleagues** — arrangers can request and book for other people.

*Later:* Key Travel Agent cross-org support & act-on-behalf (audited) · self-service organisation onboarding (an org adds/configures its own profile) · automatic HR-system sync (SCIM/HRIS, e.g. Bamboo HR).

## E2 · Travel request & trip
*Create a request and turn it into one bookable trip.*
1. **M** · **Guided request form** — capture who's travelling, where, when and why in a simple flow, with **destination and dates set once at trip level and reused across flight/hotel/car search** (no double entry).
2. **M** · **Search flights, hotels & cars** — live options pulled from the existing booking APIs.
3. **M** · **Unified trip** — combine multiple segments (e.g. flight + hotel + car) into a single trip. Designed to be **multi-modal** so rail/bus slot in later (the client's own example spans air + rail + hotel).
4. **M** · **Status tracking** — follow a request from Pending → Approved → Booked → Completed.
5. **S** · **Notifications** — travellers and approvers are alerted (email) when something needs them or changes.

*Later:* automatic train & bus search and booking.

## E3 · Travel policy rules
*Check every request against the organisation's rules.*
1. **M** · **Configurable rules per organisation** — spending limits, restricted destinations, cabin class, department and role/seniority.
2. **M** · **Live policy check** — each request is flagged OK, warning or breach as it's built.
3. **M** · **Soft enforcement** — out-of-policy travel is allowed with a written justification, not blocked outright.
4. **M** · **Key Travel configures the rules** — set up during onboarding on the organisation's behalf.

*Later:* org self-service rule editor · approval-chain preview / simulator.

## E4 · Approvals
*Route the request to the right approvers.*
1. **M** · **1–3 level approval chains** — the number of steps is configurable per organisation.
2. **M** · **Rule-driven routing** — the right approver is chosen from cost, destination, cabin class, department or role.
3. **M** · **Extra approval on breach** — an additional step is added automatically when a rule is broken.
4. **M** · **Approver to-do list** — a clear queue showing each request with its policy context.
5. **S** · **Approve or reject with comments** — a decision and its reason captured in one place.
6. **S** · **Partial approval** — approve or reject individual bookings within a trip (a trip can end up *partially approved*).
7. **S** · **Alternate approvers & reminders** — delegate when an approver is away, with reminders/escalation so requests don't stall.
8. **S** · **Price re-check at approval** — re-validate the fare before booking and surface any change since the request to the approver.
9. **M** · **Key Travel configures the approval chains** — set up per organisation during onboarding (the org self-service workflow editor is *Later*).

*Later:* org self-service approval-workflow editor · pre-approved trip budget (approve an amount, then book within it) · parallel / conditional / more-than-3-level chains.

## E5 · Link to the booking system
*Reuse Key Travel's existing engine to actually book.*
1. **M** · **"Translator" layer** — a safe adapter over the existing booking APIs that shields the platform from their quirks.
2. **M** · **Book through the existing system** — confirm the trip via Key Travel's engine.
3. **S** · **Change / cancel a booking** — amend or cancel through the same engine.
4. **M** · **Agent hand-off** — anything the platform can't complete is passed to an agent.

*Later:* direct provider (GDS) integration.

## E6 · Money & invoicing
*Pay for the trip and get the figures into finance.*
1. **C** · **Cost-centre tagging** — tag each request so spend can be allocated.
2. **M** · **Central invoicing** — one consolidated invoice per organisation.
3. **M** · **Company-card payment** — pay centrally by corporate card.
4. **M** · **Business Central sync** — invoice figures flow to Microsoft Business Central.

*Later:* individual / self-pay or reimbursement flows — **only if a client requests it** (outside the client's current central-payment model).

## E7 · Platform foundations *(cross-cutting)*
*The things every epic relies on.*
1. **M** · **Multi-tenant separation** — every organisation's data is kept isolated from the others.
2. **M** · **Data privacy (GDPR) & residency** — compliant handling and a defined storage location.
3. **M** · **Activity log / audit trail** — a record of who did what and when.
4. **S** · **Success-metric tracking (KPIs)** — usage and efficiency measured (can be light at pilot stage).
5. **M** · **Web app UI** — the platform is delivered as a web app (no separate app to install), fully usable on a desktop browser.
6. **S** · **Responsive / mobile-optimized layouts** — the same site adapts cleanly to phone and tablet (desk-based pilot users can work on desktop first).
7. **S** · **Adoption / onboarding guide** — a short, visual how-to (screenshots, minimal text) to move users off phone/email onto self-service (a key change-management risk).

*Later:* in-app / AI-assisted interactive walkthrough · reporting dashboards & charts · traveller safety tracking (duty-of-care) · **native mobile app (iOS/Android)**.

## Rough 9-month timeline
| Stage | When | What's delivered |
|---|---|---|
| **0 · Discovery** | Week 1 (min.) | A 1-week sprint to agree the plan — a proposed **minimum**, could run longer. Build starts **in parallel** (foundation + booking-system spike); **hosting & data-residency decided here**; discovery is not a gate |
| **1 · Request → Approve** | Months 1–4 | E1–E4: organisations, people, roles, onboarding, request + trip, policy rules, approvals, SSO/MFA |
| **2 · Approve → Book → Invoice** | Months 4–8 | E5–E6: booking, changes/cancellations, invoicing, company card, Business Central |
| **3 · Final polish + pilot** | Months 8–9 | E7 hardening: security & performance, client testing (UAT), first pilot organisations go live. *(Data-residency/hosting was decided in discovery and set up early in the parallel foundation — not here.)* |
