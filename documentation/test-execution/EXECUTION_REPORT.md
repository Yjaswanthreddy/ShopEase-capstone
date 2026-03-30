# Test execution report — Sample cycle

**Project:** ShopEase Capstone  
**Build / commit:** local dev  
**Environment:** macOS / Node 20 / MySQL 8  
**Executed by:** QA Engineer (sample)  
**Date:** 2026-03-28  

## Summary

| Module | Planned | Executed | Pass | Fail | Blocked |
|--------|---------|----------|------|------|---------|
| Authentication | 15 | 15 | 14 | 1 | 0 |
| Catalog | 15 | 15 | 15 | 0 | 0 |
| Product Details | 15 | 14 | 13 | 1 | 0 |
| Cart | 15 | 15 | 15 | 0 | 0 |
| Checkout & Payment | 15 | 15 | 14 | 1 | 0 |
| Orders | 15 | 12 | 11 | 1 | 0 |
| Reviews | 15 | 15 | 15 | 0 | 0 |
| Admin | 15 | 15 | 15 | 0 | 0 |
| **Total** | **120** | **116** | **112** | **4** | **0** |

## Notes

- Failures logged in `documentation/defects/DEFECT_REPORT.md`.
- Playwright suite: see CI/local log + `automation/reports/html-report` after `npm run test:e2e`.

## Sign-off

Test Lead: _________________  Date: _______
