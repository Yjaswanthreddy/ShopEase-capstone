# High-level test scenarios (≥15 per module)

## 1. User Authentication

Register happy path; duplicate email; weak password; login success; wrong password; wrong email; JWT persistence; logout; forgot-password (dev token); reset with invalid token; reset success; role claim in token; unauthorized API access; XSS-safe error rendering; rate-limit placeholder.

## 2. Product Catalog

Default listing; category filter; brand filter; price min/max; rating filter; in-stock only; sort each option; pagination/load-more; search by name; search no results; combined filters; invalid sort ignored; API error surfaced.

## 3. Product Details

Load by id; 404 missing id; gallery switch; stock message; out-of-stock add blocked; add to cart auth gate; reviews listed; submit review; duplicate review blocked; edit own review; delete own review; admin delete.

## 4. Shopping Cart

Empty cart UI; add first line; merge duplicate SKU qty; stock exceeded; update qty; remove line; subtotal math; concurrent price change (refresh); checkout link auth; clear implicit on order.

## 5. Checkout & Payment

Address required fields; place order creates pending_payment; valid credit; valid debit; invalid Luhn; expired card format; insufficient funds PAN; valid UPI each suffix; invalid UPI domain; UPI insufficient prefix; duplicate payment blocked.

## 6. Orders

List only own orders; detail view; cancel pending_payment restores stock; cancel paid marks refund; return request allowed states; refund simulation customer; refund admin; status transitions admin; forbidden cross-user.

## 7. Ratings & Reviews

Create; validation rating range; edit title/body; delete; aggregate average update; single review per product per user; guest cannot submit; product deleted cascades reviews (DB).

## 8. Admin Dashboard

Dashboard metrics; revenue net calculation; list users; promote/demote role; self-demotion blocked; list orders; patch status; CRUD product; add multi-image; delete product; non-admin 403.
