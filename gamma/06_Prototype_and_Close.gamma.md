# Bonus — a working prototype

The client's #1 capability, made tangible: Travel Request → multi-level Approval → booking → finance.

---

## The flow, made tangible

- **Role-based** workspace — switch role & organization in the top bar.
- **Live policy engine** — cost limits, restricted destinations, max cabin class, VIP/leadership oversight → in-policy / warning / violation.
- **Configurable multi-level chains** that differ per organization from the same engine.
- Full lifecycle: **Pending → Approved → Booked → Completed** + finance/invoicing.
- **MVP / Later scope badges** in the navigation so audiences see what's in vs. out.

*React 18 + TypeScript + Vite + Tailwind · `npm run dev` · deployed on Vercel.*

---

## Demo script

1. HopeBridge flight to **Nairobi** — in policy, clean chain.
2. Change to **Khartoum, £2,100** — restricted destination + over budget → **justification required**, approval chain grows.
3. Approve through **each level**.
4. **Book** via the (mocked) existing API.
5. Generate **centralized invoice** → sync to MS Business Central.

Also shows: cabin-class and VIP/leadership-oversight approval triggers per org.

---

## In summary

**Ship the spine, prove it with a pilot, scale with confidence.**

- **Focused MVP** — self-service request → approval → booking → centralized invoicing, integrated with the existing platform.
- **De-risked early** — integration spike + explicit assumptions + MoSCoW-managed scope.
- **Assisted onboarding & support** — Agent-led org setup and support layer for pilot maturity.
- **Tangible today** — a working, role-based prototype ready to demo.

---

## Next step

A focused **discovery phase**, starting with the **integration spike** and the **business-goals & policy** workshops.

Thank you — happy to walk through the artifacts and the live prototype.
