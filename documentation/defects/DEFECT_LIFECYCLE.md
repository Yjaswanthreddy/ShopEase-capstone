# Defect lifecycle

```mermaid
stateDiagram-v2
  [*] --> New: Test fails / anomaly logged
  New --> Open: Triaged & acknowledged
  Open --> InProgress: Dev assigned
  InProgress --> Fixed: Commit + build
  Fixed --> Verified: QA retest pass
  Verified --> Closed: Release note updated
  Fixed --> Reopened: QA retest fail
  Open --> Deferred: Business waiver
  Deferred --> Open: Re-prioritised
```

## SLA (example)

| Severity | Target fix | Target verify |
|----------|------------|---------------|
| Blocker | 24h | 24h |
| Critical | 48h | 48h |
| Major | 5d | 2d after fix |
| Minor | Sprint | Next regression |
