# Key Assumptions

The things we're assuming to be true, stated openly so we can confirm them early. Confidence: 🟢 the client told us · 🟡 our best guess · 🔴 still open.

| # | Assumption | Conf. |
|---|-----------|:---:|
| 1 | This is an **internal efficiency and growth tool** — not a product Key Travel will sell to others. | 🟢 |
| 2 | The heart of the MVP is **self-service: request → approval → booking**. | 🟢 |
| 3 | **The MVP is a pilot** — it launches to a **small number of organisations** to prove the portal end-to-end, before scaling to hundreds. | 🟡 |
| 4 | The MVP books **flights, hotels and cars**; **train & bus come later** (a trip can still combine several modes). | 🟡 |
| 5 | There are **six roles**, and staff can **book on behalf of others**. | 🟢 |
| 6 | Approvals are **step-by-step, 1–3 levels**, triggered by cost, destination, cabin class, department or role/seniority. | 🟢 |
| 7 | Breaking a rule **warns and asks for a justification** (rather than blocking outright). | 🟡 |
| 8 | In the MVP, **Key Travel sets up each pilot organisation by hand** (profile, rules, approvals, connections) — a **manual/internal** step, not a built onboarding product. A **self-service organisation onboarding flow** is **post-MVP**. | 🔴 |
| 9 | We **reuse the existing booking APIs** (search / book / change / cancel) rather than connecting directly to airlines or hotels. | 🟢 |
| 10 | There's **no invoicing API**, so the new platform creates invoices and sends the figures to **Microsoft Business Central**. | 🟢 |
| 11 | Payment is by **central invoice and company card** — not individual travellers paying. | 🟢 |
| 12 | **Secure login (SSO/MFA), data privacy (GDPR) and card security (PCI DSS)** are required; where data is stored (UK/EU) still to confirm. | 🟢 / 🔴 |
| 13 | The MVP is delivered as a **web app**, fully usable on desktop; **mobile/tablet-optimized layouts are a fast-follow (Should)** and a **native mobile app (iOS/Android)** comes later. | 🟡 |
| 14 | **Staff** are onboarded with SSO + staff-list upload + welcome email; automatic HR-system sync (SCIM) comes later. | 🟡 |
| 15 | **Key Travel builds and runs** the platform; the client advises but doesn't do the hands-on development. | 🟢 |

## Technical & non-functional scope (MVP)
*Baseline technical assumptions, kept deliberately lean for the pilot — to confirm in discovery.*

- **Platform:** a **web app**, delivered online — nothing to install.
- **Supported browser:** **latest Chrome** is the MVP target (other modern Chromium browsers, e.g. Edge, on a best-effort basis); legacy/older browsers are out of scope.
- **Screen resolution:** designed for **standard desktop — 1366×768 minimum, optimised for 1920×1080**.
- **Devices:** the MVP is **desktop-first**. Mobile/tablet **responsive layouts are a *Should* (E7.6)**; if built, we'd target **recent iOS/Android models (~last 2 generations, ~360–430 px viewports)**. Responsive design is **additional design & QA effort** — more breakpoints to design, build and test — which is why it sits outside the core MVP.
- **Security & privacy:** SSO/MFA login, per-organisation data separation, activity log, **GDPR**, and **PCI DSS** for corporate-card payments (see #8, #12); data-residency region still to confirm.
- **To define in discovery:** performance targets (search/response times), availability/uptime, accessibility target (e.g. **WCAG 2.1 AA**), **duty-of-care / travel-risk** handling for NGO/humanitarian travellers, and scale (pilot → hundreds of organisations).

## Confirm these first (highest risk × impact)
1. **The booking-system reality** — what the existing APIs cover, the documentation, and the invoicing gap → investigate in Week 1.
2. **Pilot scope** — which organisations go first, and the success criteria that prove the portal is ready to scale.
3. **Who sets up organisations & rules** — Key Travel-assisted in the MVP; when org self-service onboarding arrives post-MVP.
4. **Where data must be stored** (country/region).
5. Agreement that, with fixed time and budget, **scope is the flexible part**.
