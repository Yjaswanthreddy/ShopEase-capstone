# Boundary value analysis & equivalence partitioning

## Password (register / reset)

| Partition | Representative | Boundary | Expectation |
|-----------|----------------|----------|-------------|
| too short | 7 chars | below min | 400 |
| min valid | 8 chars | on boundary | 200/201 |
| strong | 64+ chars | upper stress | 200/201 |

## Rating (reviews)

| Value | Class | Expected |
|-------|-------|----------|
| 0 | invalid low | 400 |
| 1 | valid min | 201 |
| 5 | valid max | 201 |
| 6 | invalid high | 400 |

## Stock vs cart quantity

| stock | requested qty | Expected |
|-------|---------------|----------|
| 0 | 1 | 400 |
| 1 | 1 | 201 |
| 1 | 2 | 400 |

## Card PAN length

| length | Class |
|--------|-------|
| 12 | invalid |
| 13–19 | validate Luhn |
| 20 | invalid |

## UPI local part

| pattern | Class |
|---------|-------|
| empty | invalid |
| 2 chars min | valid lower bound |
| 256 chars | valid upper bound |
| 257 chars | invalid |
