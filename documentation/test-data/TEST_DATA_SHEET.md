# Test data sheet — ShopEase

## Users

| Key | Email | Password | Role | Notes |
|-----|-------|----------|------|-------|
| SEED_ADMIN | admin@shopease.test | Admin12345! | admin | From `npm run seed` |
| SEED_CUSTOMER | customer@shopease.test | Customer123! | customer | Default buyer |
| NEG_EMAIL | not-exists@shopease.test | x | — | Negative login |
| REG_DUP | customer@shopease.test | Newpass123! | — | Expect 409 on register |

## Products (after seed)

| ID | Brand | Name | Stock | Price |
|----|-------|------|-------|-------|
| 1 | Soniq | NoiseCancel Headphones | 45 | 199.99 |
| 2 | Soniq | Wireless Earbuds | 120 | 79.50 |
| 5 | UrbanThread | Running Tee | 200 | 29.99 |

*Adjust stock via admin UI/SQL for out-of-stock scenarios.*

## Payments

| Label | Method | Payload | Expected |
|-------|--------|---------|----------|
| CARD_OK | credit_card | pan `4242424242424242`, exp `12/30`, cvv `123` | success |
| CARD_BAD | credit_card | pan `1234567890123456` | invalid |
| CARD_NSFS | credit_card | pan `4000000000000002` | insufficient |
| UPI_OK | upi | `qa.user@oksbi` | success |
| UPI_BAD | upi | `qa@gmail.com` | invalid suffix |
| UPI_NSFS | upi | `nofunds.x@ybl` | insufficient sim |

## Addresses

| Field | Sample |
|-------|--------|
| shipping_name | Jane Customer |
| shipping_line1 | 221B Baker Street |
| shipping_city | Mumbai |
| shipping_postal | 400001 |
| shipping_country | IN |

## Reviews

| Case | rating | title | body |
|------|--------|-------|------|
| MIN | 1 | Poor | — |
| MID | 3 | OK | Average experience |
| MAX | 5 | Great | Would buy again |
