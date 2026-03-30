# Test summary & metrics — ShopEase (sample)

## Automation HTML report

After `npm run test:e2e`, open:

`automation/reports/html-report/index.html`

Playwright captures screenshots on failure and retains traces when configured.

## Sample metrics (from sample execution report)

- **Pass rate:** 112 / 116 ≈ **96.6%** (manual sample)  
- **Fail rate:** 4 / 116 ≈ **3.4%**  
- **Defect density:** 4 defects / 8 modules = **0.5 defects per module** (illustrative)  
- **Automation coverage (flows):** register, login, search, PDP, cart mutate, checkout card/UPI variants, insufficient funds, admin product create.

## Recommended KPIs for ongoing releases

- P0/P1 escape rate = 0 per sprint  
- Playwright smoke duration < 10 minutes  
- Mean time to restore (MTTR) for Blocker < 24h  

## Decision table — release gate (example)

| Condition | Gate |
|-----------|------|
| Any open Blocker | No release |
| Playwright red | No release |
| Open Major > 3 | PM approval |
