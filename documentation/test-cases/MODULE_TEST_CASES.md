# ShopEase — Detailed test cases (120+)

Columns: **ID | Module | Description | Preconditions | Steps | Test data | Expected**

---

## Module 1 — User Authentication (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-AUTH-01 | Register valid user | DB up | POST /api/auth/register | strong pwd, new email | 201 + token |
| TC-AUTH-02 | Duplicate email | User exists | Register same email | existing email | 409 |
| TC-AUTH-03 | Password boundary low | — | Register pwd len 7 | 7 chars | 400 |
| TC-AUTH-04 | Password boundary ok | — | Register pwd len 8 | 8+ chars | 201 |
| TC-AUTH-05 | Login valid | Seeded user | POST /api/auth/login | customer creds | 200 + JWT |
| TC-AUTH-06 | Login bad password | User exists | Login wrong pwd | bad pwd | 401 |
| TC-AUTH-07 | Login unknown email | — | Login | random email | 401 |
| TC-AUTH-08 | /me without token | — | GET /api/auth/me | no header | 401 |
| TC-AUTH-09 | /me with token | Logged in | GET /api/auth/me | Bearer JWT | 200 user |
| TC-AUTH-10 | Forgot password | User exists | POST forgot | email | 200 message |
| TC-AUTH-11 | Forgot unknown email | — | POST forgot | random@x.com | 200 (no leak) |
| TC-AUTH-12 | Reset invalid token | — | POST reset | bad token | 400 |
| TC-AUTH-13 | Reset valid token | Token issued | POST reset | token+pwd | 200 |
| TC-AUTH-14 | UI register validation | — | Submit empty Register.html | blanks | HTML5 / alert |
| TC-AUTH-15 | Logout clears storage | Logged in | Click logout | — | token removed |

*Techniques:* BVA on password length; EP on email format; decision: token present/absent.

---

## Module 2 — Product Catalog (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-CAT-01 | List default | Seed | GET /products | — | 200 array |
| TC-CAT-02 | Filter category | Seed | categoryId=1 | id=1 | all cat 1 |
| TC-CAT-03 | Filter brand | Seed | brand=Soniq | Soniq | only brand |
| TC-CAT-04 | Price min boundary | Seed | minPrice=199.99 | boundary | excludes lower |
| TC-CAT-05 | Price max boundary | Seed | maxPrice=50 | 50 | within range |
| TC-CAT-06 | Min rating | Seed | minRating=4.5 | 4.5 | filtered |
| TC-CAT-07 | In stock only | Out-of-stock sku exists | inStock=1 | — | stock>0 |
| TC-CAT-08 | Sort price asc | Seed | sort=price_asc | — | non-decreasing |
| TC-CAT-09 | Sort popularity | Seed | sort=popularity | — | ordered |
| TC-CAT-10 | Search partial | Seed | search=Head | — | matches name |
| TC-CAT-11 | Search no hit | Seed | search=ZZZNONE | — | empty data ok |
| TC-CAT-12 | Pagination page 2 | Enough rows | page=2 | limit=4 | correct slice |
| TC-CAT-13 | Combined filters | Seed | brand+minRating | — | intersect |
| TC-CAT-14 | UI apply filters | Home.html | Set filters+Apply | — | grid updates |
| TC-CAT-15 | Invalid product id | — | GET /products/99999 | 99999 | 404 |

---

## Module 3 — Product Details (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-PD-01 | Load detail | Seed | GET /products/1 | id=1 | images[] |
| TC-PD-02 | Gallery primary | UI | Open Product.html?id=1 | — | hero image |
| TC-PD-03 | Gallery alternate | UI | Click thumb | — | hero swaps |
| TC-PD-04 | Stock label in-stock | stock>0 | View page | — | green text |
| TC-PD-05 | Stock out | Admin sets SKU stock 0 | View that Product.html | id adjusted | out label |
| TC-PD-06 | Add cart guest | Logged out | Add | — | redirect login |
| TC-PD-07 | Add cart qty valid | Auth | qty=1 | in stock | success |
| TC-PD-08 | Add cart over stock | Auth | qty>stock | huge qty | 400 |
| TC-PD-09 | Reviews list | Seed | GET reviews/product/1 | — | array |
| TC-PD-10 | Submit review | Auth, not reviewed | POST review | rating 5 | 201 |
| TC-PD-11 | Duplicate review | Already reviewed | POST again | — | 409 |
| TC-PD-12 | Edit review | Owner | PUT /reviews/:id | new rating | 200 |
| TC-PD-13 | Delete review | Owner | DELETE | — | 200 |
| TC-PD-14 | Rating aggregate | After review | GET product | — | avg updated |
| TC-PD-15 | Missing id param | UI | /Product.html | no query | error alert |

*Note:* adjust product id for out-of-stock per seed (id 5 is Running Tee with stock 40 in seed - use admin to set 0 for negative case).

---

## Module 4 — Shopping Cart (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-CART-01 | Empty cart | Auth, cleared | GET /cart | — | items=[] |
| TC-CART-02 | Add line | Auth | POST item | product_id | 201 |
| TC-CART-03 | Increment same SKU | Line exists | POST again | +qty | merged qty |
| TC-CART-04 | Stock boundary | stock=n | POST qty=n | n | 201 |
| TC-CART-05 | Stock overflow | stock=n | POST qty=n+1 | — | 400 |
| TC-CART-06 | Patch qty | Line exists | PATCH | new qty | 200 |
| TC-CART-07 | Patch qty over stock | — | PATCH | stock+1 | 400 |
| TC-CART-08 | Delete line | Line exists | DELETE | id | 200 |
| TC-CART-09 | Subtotal accuracy | Known prices | GET | — | matches SQL |
| TC-CART-10 | Cart isolation | Two users | Each GET | — | different lines |
| TC-CART-11 | UI update qty | Cart.html | change input | 2 | recalculates |
| TC-CART-12 | UI remove | Cart.html | Remove btn | — | row gone |
| TC-CART-13 | Checkout link | Items present | Click checkout | — | Checkout.html |
| TC-CART-14 | Guest cart API | No token | GET /cart | — | 401 |
| TC-CART-15 | Product deleted mid-session | Rare | Add deleted SKU | — | 404/400 |

---

## Module 5 — Checkout & Payment (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-CHK-01 | Address required | Auth+cart | POST checkout missing city | — | 400 |
| TC-CHK-02 | Place order | Valid address | POST checkout | full addr | 201 order |
| TC-CHK-03 | Stock reserved | Concurrent | Two checkouts last unit | — | one fails |
| TC-PAY-01 | Valid credit | Order pending_payment | POST pay | 4242… | completed |
| TC-PAY-02 | Valid debit | Same | method debit_card | valid pan | completed |
| TC-PAY-03 | Invalid Luhn | Order pending | bad pan | 1234… | 400 |
| TC-PAY-04 | Bad expiry format | — | MM/YY wrong | 13/40 | 400 |
| TC-PAY-05 | Expired card | past date | expiry old | 01/20 | 400 |
| TC-PAY-06 | Insufficient sim | — | pan 4000…002 | — | 400 code |
| TC-PAY-07 | UPI valid ybl | — | upi a@ybl | — | 201 |
| TC-PAY-08 | UPI valid oksbi | — | a@oksbi | — | 201 |
| TC-PAY-09 | UPI invalid domain | — | a@gmail | — | 400 |
| TC-PAY-10 | UPI nofunds sim | — | nofunds.x@ybl | — | 400 |
| TC-PAY-11 | Duplicate pay | Paid order | POST pay again | — | 409 |
| TC-PAY-12 | UI client validation | Checkout | invalid before API | — | alert |
| TC-PAY-13 | Wrong user pay | User B token | Pay order A | — | 403 |

---

## Module 6 — Orders (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-ORD-01 | List mine | Auth | GET /orders | — | only user rows |
| TC-ORD-02 | Detail | Order exists | GET /orders/:id | id | items+pay |
| TC-ORD-03 | Cross user forbidden | Two users | GET other id | — | 403 |
| TC-ORD-04 | Cancel pending_payment | Status ok | POST cancel | — | cancelled+stock back |
| TC-ORD-05 | Cancel paid | Paid | cancel | — | stock back+pay refunded |
| TC-ORD-06 | Cancel shipped blocked | Delivered | cancel | — | 400 |
| TC-ORD-07 | Return request | delivered | POST return | — | return_requested |
| TC-ORD-08 | Refund customer | return_requested | POST refund | — | refunded |
| TC-ORD-09 | Refund admin | Admin token | POST refund | — | 200 |
| TC-ORD-10 | Admin list | Admin | GET admin/all | — | all orders |
| TC-ORD-11 | Admin status patch | Admin | PATCH status shipped | — | 200 |
| TC-ORD-12 | Invalid transition | — | PATCH bad | — | 400 |
| TC-ORD-13 | UI orders table | Customer | Orders.html | — | rows |
| TC-ORD-14 | Order total vs DB | After checkout | SQL validation query | — | match |
| TC-ORD-15 | Payment amount match | Paid | SQL join | — | amounts equal |

---

## Module 7 — Reviews (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-REV-01 | List by product | Any | GET reviews/product/1 | — | 200 |
| TC-REV-02 | Create | Auth | POST | rating 3 | 201 |
| TC-REV-03 | BVA rating low | — | rating 0 | — | 400 |
| TC-REV-04 | BVA rating high | — | rating 6 | — | 400 |
| TC-REV-05 | EP rating 1 | — | rating 1 | — | 201 |
| TC-REV-06 | EP rating 5 | — | rating 5 | — | 201 |
| TC-REV-07 | Duplicate | Same user/product | POST twice | — | 409 |
| TC-REV-08 | Edit other user | User B | PUT A’s review | — | 403 |
| TC-REV-09 | Delete admin | Admin | DELETE | — | 200 |
| TC-REV-10 | Aggregate | Multiple reviews | SQL avg vs column | — | aligned |
| TC-REV-11 | Title optional | — | body only | null title | 201 |
| TC-REV-12 | XSS stored safe | — | Submit <script> | escaped in UI | neutralized |
| TC-REV-13 | Product missing | — | POST review bad product | id=0 | 404 |
| TC-REV-14 | Guest POST | — | no JWT | — | 401 |
| TC-REV-15 | Edit updates timestamp | Owner | PUT | — | updated_at moves |

---

## Module 8 — Admin (15)

| ID | Description | Preconditions | Steps | Test data | Expected |
|----|-------------|---------------|-------|-----------|----------|
| TC-ADM-01 | Dashboard metrics | Admin | GET dashboard | — | counts+revenue |
| TC-ADM-02 | List users | Admin | GET users | — | includes roles |
| TC-ADM-03 | Promote user | Admin | PATCH role admin | — | 200 |
| TC-ADM-04 | Demote self blocked | Admin | PATCH own id | — | 400 |
| TC-ADM-05 | Customer hits admin | Customer token | GET dashboard | — | 403 |
| TC-ADM-06 | Create product | Admin | POST /products | payload | 201 |
| TC-ADM-07 | Update product | Admin | PUT | new price | 200 |
| TC-ADM-08 | Delete product | Admin | DELETE | — | 200 |
| TC-ADM-09 | Multi-image | Admin | images[] | 2 urls | rows in pi |
| TC-ADM-10 | Orders board | Admin | GET admin/all | — | emails |
| TC-ADM-11 | Status workflow | Admin | PATCH processing→shipped | — | ok |
| TC-ADM-12 | Revenue net | Refunds exist | dashboard | — | net = gross-refund |
| TC-ADM-13 | UI Products form | Admin | Submit | — | alert success |
| TC-ADM-14 | SQL revenue cross-check | — | validation_queries | — | match API |
| TC-ADM-15 | JWT role change effect | After demote | Call admin | — | 403 |

---

**Total rows above:** 8 × 15 = **120** documented cases (extend with variants per release).
