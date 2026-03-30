# Defect report — sample realistic issues

| ID | Module | Title | Severity | Priority | Status | Steps to reproduce | Expected | Actual |
|----|--------|-------|----------|----------|--------|--------------------|----------|--------|
| DEF-001 | Product Details | Out-of-stock product still allows max qty default | Major | P2 | Open | Open SKU with stock 0, qty defaults to 1, click add | Block add or clamp qty | API error only after click |
| DEF-002 | Orders | Customer refund button visible before return | Minor | P3 | Open | Pay order, open Orders | Refund hidden until return | Refund visible (state guard missing in UI) |
| DEF-003 | Checkout | Error alert not cleared between attempts | Trivial | P4 | In Progress | Fail payment then fix fields | Clean alert | Old message remains until refresh |
| DEF-004 | Catalog | Search with only spaces behaves like full list | Minor | P3 | Deferred | Search ` ` on Home | Treat as empty or show hint | Returns all products |

## Fields guide

- **Severity:** Blocker / Critical / Major / Minor / Trivial  
- **Priority:** P1 (hotfix) … P4 (backlog)  
- **Status:** New / Open / In Progress / Fixed / Closed / Deferred
