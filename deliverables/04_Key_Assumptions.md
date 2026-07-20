# Key Assumptions

The things we're assuming to be true, stated openly so we can confirm them early. Confidence: 🟢 the client told us · 🟡 our best guess · 🔴 still open.

| # | Assumption | Conf. |
|---|-----------|:---:|
| 1 | This is an **internal efficiency and growth tool** — not a product Key Travel will sell to others. | 🟢 |
| 2 | The heart of the MVP is **self-service: request → approval → booking**. | 🟢 |
| 3 | **The MVP is a pilot** — it launches to a **small number of organisations** to prove the portal end-to-end, before scaling to hundreds. | 🟡 |
| 4 | The MVP books **flights, hotels and cars** (the scope named in the brief, and what the existing APIs cover); **train & bus come later**. The client's own trip example is *air + rail + hotel*, but they noted rail is handled in **separate systems** today — so rail/bus likely needs **new integrations** and would be **added scope**. The trip object is multi-modal, so they slot in later. **Whether rail is needed in the pilot is a discovery decision to confirm.** | 🟡 |
| 5 | There are **six roles**, and staff can **book on behalf of others**. | 🟢 |
| 6 | Approvals are **step-by-step, 1–3 levels**, triggered by cost, destination, cabin class, department or role/seniority. | 🟢 |
| 7 | Breaking a rule **warns and asks for a justification** (rather than blocking outright). | 🟡 |
| 8 | In the MVP, **Key Travel sets up each pilot organisation by hand** (profile, rules, approvals, connections) — a **manual/internal** step, not a built onboarding product. A **self-service organisation onboarding flow** is **post-MVP**. | 🔴 |
| 9 | We **reuse the existing booking APIs** rather than connecting directly to airlines or hotels. The client confirmed **booking, changes and cancellations** are API-exposed (invoicing is manual, no API); **search-via-API is assumed and to be confirmed** in discovery. | 🟢 |
| 10 | There's **no invoicing API**, so the new platform creates invoices and sends the figures to **Microsoft Business Central**. | 🟢 |
| 11 | Payment is by **central invoice and company card** — not individual travellers paying. | 🟢 |
| 12 | **Secure login (SSO/MFA), data privacy (GDPR) and card security (PCI DSS)** are required; where data is stored (UK/EU) still to confirm. | 🟢 / 🔴 |
| 13 | The MVP is delivered as a **web app**, fully usable on desktop; **mobile/tablet-optimized layouts are a fast-follow (Should)** and a **native mobile app (iOS/Android)** comes later. | 🟡 |
| 14 | **Staff** are onboarded with SSO + staff-list upload + welcome email; automatic HR-system sync (SCIM) comes later. | 🟡 |
| 15 | **Key Travel builds and runs** the platform; the client advises but doesn't do the hands-on development. | 🟢 |
| 16 | Moving clients from **agent-only to self-service is a change-management risk**; we mitigate with a **visual onboarding guide** (MVP *Should*), a limited **pilot cohort**, and an interactive/AI-assisted walkthrough (later). | 🟡 |
| 17 | Hosting is likely on the **Microsoft/Azure stack** (they already run Business Central) — **to confirm**; **data-residency & hosting are decided in discovery and set up early** in the parallel foundation, **not** at the end. | 🟡 / 🔴 |

## Technical & non-functional scope (MVP)
*Baseline technical assumptions, kept deliberately lean for the pilot — to confirm in discovery.*

- **Platform:** a **web app**, delivered online — nothing to install.
- **Supported browser:** **latest Chrome** is the MVP target (other modern Chromium browsers, e.g. Edge, on a best-effort basis); legacy/older browsers are out of scope.
- **Screen resolution:** designed for **standard desktop — 1366×768 minimum, optimised for 1920×1080**.
- **Devices:** the MVP is **desktop-first**. Mobile/tablet **responsive layouts are a *Should* (E7.6)**; if built, we'd target **recent iOS/Android models (~last 2 generations, ~360–430 px viewports)**. Responsive design is **additional design & QA effort** — more breakpoints to design, build and test — which is why it sits outside the core MVP.
- **Security & privacy:** SSO/MFA login, per-organisation data separation, activity log, **GDPR**, and **PCI DSS** for corporate-card payments (see #8, #12); data-residency region still to confirm.
- **To define in discovery:** performance targets (search/response times), availability/uptime, accessibility target (e.g. **WCAG 2.1 AA**), **duty-of-care / travel-risk** handling for NGO/humanitarian travellers, and scale (pilot → hundreds of organisations).
- **Measuring success:** we assume we can establish a **"before" baseline** — realistically a *mix* of existing financial/volume data, a short **sampling / time-and-motion study** for agent-time and errors, and **satisfaction baselined at pilot start** (little history exists today). We **instrument success-metric events from the MVP** (a thin, vendor-agnostic event layer: self-service rate, agent-hours/booking, cycle time, errors, satisfaction rating); analytics **dashboards/charts and the tooling choice come later** — with **data-residency (GDPR/EU)** driving EU-hosted vs. self-hosted. Satisfaction and revenue are **outcome metrics on a longer horizon** — the pilot proves the leading indicators.

## Confirm these first (highest risk × impact)
1. **The booking-system reality** — what the existing APIs cover, the documentation, and the invoicing gap → investigate in Week 1.
2. **Pilot scope & client selection** — which organisations go first (prioritise those who've complained about phone/email; categorise by size & self-service appetite), and the success criteria that prove the portal is ready to scale.
3. **Who sets up organisations & rules** — Key Travel-assisted in the MVP; when org self-service onboarding arrives post-MVP.
4. **Where data must be stored** (country/region).
5. Agreement that, with fixed time and budget, **scope is the flexible part**.
