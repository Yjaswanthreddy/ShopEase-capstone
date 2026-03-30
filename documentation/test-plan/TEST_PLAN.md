# ShopEase — Master Test Plan

## Scope

In scope: eight modules (Authentication, Catalog, Product Details, Cart, Checkout & Payment, Orders, Reviews, Admin).  
Out of scope: real PSP settlement, real email/SMS delivery, PCI DSS audit.

## References

- Requirements: capstone brief (ShopEase).
- Environment: Node 18+, MySQL 8, Chromium for Playwright.
- Test cases: `documentation/test-cases/MODULE_TEST_CASES.md` (120+).
- Automation: `automation/tests/shopease.e2e.spec.js`.

## Schedule (suggested)

| Phase | Activity |
|-------|----------|
| Week 1 | Test design + data prep |
| Week 2 | Manual execution + defect logging |
| Week 3 | Automation hardening + DB checks |
| Week 4 | Regression + summary report |

## Roles

- QA Lead: plan, metrics, sign-off.
- QA Engineer: execution, automation.
- Dev: defect fixes, API clarifications.

## Tools

- Playwright Test, MySQL client, browser devtools, REST client.

## Completion criteria

- All P1/P2 defects resolved or accepted.
- Documented evidence for 120+ designed cases (sample execution in `test-execution/`).
- Playwright smoke suite passes against seeded environment.
