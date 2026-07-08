# Clarification questions — what we heard

The answers to our already-sent questionnaire that shaped this proposal.
*(Full verbatim Q&A lives in `deliverables/01_Clarification_Questions.md` — this is the presentation summary.)*

---

## Priority & goal

- **#1 capability:** a complete **self-service travel request + approval flow**, integrated with the existing booking platform.
- **Goal:** strengthen & scale the existing business — reduce manual effort, enable self-service — **not** sell software.

---

## Users & organizations

- **Six roles**, including a **Key Travel Agent**.
- **Book-on-behalf-of** is required.
- **Pilot-first** (tens of orgs) → architected for **hundreds** of orgs.
- **NGO / humanitarian** organizations first, academic later.

---

## Policy & approvals

- Most approvals are **1–3 configurable levels**.
- Triggers include **cost, destination, role, travel class**, and exceptions.
- Orgs differ → the engine must be **configurable, not hard-coded**.

---

## Integration & finance

- Reuse existing **search / book / change / cancel** APIs.
- API docs are **incomplete**; **invoicing is not API-exposed**.
- Finance system is **MS Business Central**.
- **Centralized invoicing + corporate card**; no individual traveler payments.

---

## Non-functional & delivery

- **SSO / MFA / GDPR** are required.
- **~9-month** MVP, limited budget, minimal client engineering capacity.
- **Strong board push to launch fast** → thin, high-value MVP.
- **Vendor-led** delivery; client SMEs consult, not hands-on build.
