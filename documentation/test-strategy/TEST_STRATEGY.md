# ShopEase — Test Strategy

## Objectives

- Validate end-to-end e-commerce flows (auth → catalog → cart → checkout → payment → orders → reviews → admin).
- Prove data integrity between UI, API, and MySQL.
- Automate regression-critical paths with Playwright (POM).

## Test levels

| Level | Scope | Owner / Tooling |
|-------|--------|-----------------|
| Unit | Pure functions (e.g. payment Luhn/UPI validators) | Jest/Mocha (optional extension) |
| Integration | Express routes + MySQL (transactional flows) | Supertest + test DB |
| System | Full stack via browser | Manual + Playwright |
| Regression | Re-run automation + smoke manual | CI / local |

## Test types

- Functional, UI, API contract, negative, boundary, database reconciliation, security basics (JWT, role separation).

## Techniques

- **Equivalence partitioning:** valid/invalid emails, PAN classes, UPI suffix buckets.
- **Boundary value analysis:** password length 7/8/9, rating 0/1/5/6, stock 0/1/max.
- **Decision tables:** payment method × validation outcome × order state.

## Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Flaky E2E timing | Playwright auto-wait, traces on failure |
| Shared DB state | Seed script, dedicated test user, idempotent data |
| Payment simulation drift | Single `paymentValidationService` shared semantics with UI copy |

## Entry / exit criteria

- **Entry:** Schema migrated, seed loaded, server healthy on `/health`.
- **Exit:** Critical defects closed or waived; automation green on smoke suite; DB validation queries clean on sample run.
