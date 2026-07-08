# Key Assumptions

Made explicit so they can be **validated (or corrected) early in discovery**.
Legend: 🟢 stated/implied by client · 🟡 reasonable inference · 🔴 open, needs validation.

---

## Business & scope

- Platform is an **internal efficiency/scaling enabler**, not a SaaS product to sell. 🟢
- MVP success = **adoption, agent-effort reduction, CSAT, pilot onboarding** — not feature count. 🟢
- The **self-service request → approval → booking** flow is the MVP centerpiece. 🟢
- No hard deadline, but **launch speed is a strong priority** (board push). 🟢
- MVP channels = **flights, hotels, cars**; automated rail/bus post-MVP, but **Trip is multi-modal from MVP**. 🟡

---

## Users & organizations

- **Six roles** suffice for MVP. 🟢
- **Book-on-behalf-of** required from MVP. 🟢
- Pilot = **tens of orgs**, architected for **hundreds / thousands of users**. 🟢
- MVP optimizes for **NGO/humanitarian** orgs first, academic later. 🟢

---

## Process, policy & approvals

- Approvals are **sequential, 1–3 levels** in MVP. 🟢
- Policy triggers = **cost, destination, travel class, employee role** (+ exceptions). 🟢
- **Soft enforcement** (warn + justification + extra approval). 🟡
- **Key Travel configures** policies in MVP; org self-config post-MVP. 🔴
- A **unified Trip object** is in scope and valuable. 🟢
- **Agents stay in the loop** for exceptions & manual invoicing. 🟢

---

## Integration & booking platform

- Existing APIs cover **search/book/change/cancel** and are **reused**; no direct provider integration. 🟢
- **Invoicing not API-exposed** → platform generates/centralizes invoices. 🟢
- API docs **incomplete** → **integration spike** needed early. 🟢
- Client SMEs available for consultancy. 🟢
- Existing platform can handle **pilot** volumes. 🔴

---

## Finance · Security · UX

- MVP payment = **centralized invoicing + corporate card**; no individual payments. 🟢
- Finance integration targets **MS Business Central**. 🟢
- **SSO + MFA** and **GDPR** are MVP requirements. 🟢
- **Data residency** (likely UK/EU) to confirm. 🔴
- MVP is a **responsive web app**; native/PWA app post-MVP. 🟡

---

## Onboarding & support

- Org onboarding is **Key Travel Agent-assisted** in MVP; self-serve wizard later. 🟡
- Platform sends **activation email at go-live** + employee **invitation emails**; email is the primary MVP channel. 🟡
- Employee onboarding = **SSO JIT + invite + CSV**; SCIM/HRIS later. 🟡
- **Agent can support & act within an org** (audited) as assisted-support layer, complementing the Org Admin. 🔴
- **Approver→employee (line-manager) mapping** source TBD (HRIS vs. in-app). 🔴

---

## Delivery & team

- **Vendor-led delivery**; client engineering minimal (SME consultancy only). 🟢
- The **customer case team** is the primary validation stakeholder. 🟢
- Fixed budget/timeline → **scope is the flexible variable** (MoSCoW). 🟡
- Agile, 2-week sprints, continuous demos. 🟡

---

## Validate first (highest risk × impact)

1. **Integration reality** — API coverage, docs, invoicing gap → Phase 0 spike.
2. **Policy configuration ownership** — Key Travel vs. org admin.
3. **Data residency / hosting region** — affects architecture early.
4. **Scope-as-flex agreement** — given fixed budget + speed pressure.
5. **Agent support & act-on-behalf model** — role/permissions + privacy stance.
6. **Onboarding & provisioning approach** — assisted vs. self-serve; JIT/CSV vs. SCIM.
