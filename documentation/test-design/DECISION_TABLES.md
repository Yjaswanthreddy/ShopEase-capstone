# Decision tables — ShopEase (examples)

## Payment processing × order state

| Order status | Valid method | Completed payment exists | Action | Expected |
|--------------|--------------|---------------------------|--------|----------|
| pending_payment | card/upi | no | process | 201 + order→paid |
| pending_payment | invalid | no | process | 400 validation |
| paid | any | yes | process | 409 duplicate |
| pending_payment | valid | no (race double click) | process×2 | second 409 (DB unique) |

## Cancel order × fulfillment

| Current status | Payment | Cancel by customer | Stock restore | Payment row |
|----------------|---------|--------------------|--------------|-------------|
| pending_payment | none/pending | yes | yes | pending→failed |
| paid | completed | yes | yes | completed→refunded |
| shipped | completed | no | — | 400 |

## UPI validation (suffix)

| Local part | Suffix | Expected |
|------------|--------|----------|
| user | @ybl | valid |
| user | @upi | valid |
| user | @oksbi | valid |
| user | @okhdfc | valid |
| user | @gmail.com | invalid |
| nofunds.x | @ybl | insufficient (simulated) |
