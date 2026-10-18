# Fix: Store currency to GBP

**Type:** Fix
**Status:** verified
**Branch:** fix/store-currency-to-gbp

## The problem

The whole store is hardcoded to US dollars:

- `lib/money.ts` formats every price with `en-US` / `USD`, so the storefront,
  cart, account, admin, and emails all show `$`.
- `lib/checkout.ts` sends `currency: "usd"` on every Stripe Checkout line item,
  so Stripe's hosted page shows and settles in USD.
- `lib/catalog.ts` types and returns `currency: "USD"`, which feeds the JSON-LD
  `priceCurrency` in `lib/seo.ts`.
- `app/[lang]/success/page.tsx` only shows the paid total when
  `session.currency === "usd"`.
- Admin copy says "Price (USD)", and the price/coupon minimum comments cite
  Stripe's USD minimum.

## The fix

Switch the single store currency from USD to GBP everywhere it is hardcoded.
Settlement in GBP follows from charging in GBP: Stripe settles a GBP charge
into a GBP balance with no conversion, provided the Stripe account has a GBP
bank account (a Stripe dashboard setting, not code).

- **Stored amounts are relabelled, not converted.** `priceCents` stays an
  integer of minor units; it now means pence. A product stored as `4900`
  shows as `£49.00` (it was `$49.00`). No migration and no exchange rates.
  Re-price in the admin if the old dollar figures are wrong in pounds.
- `lib/money.ts`: format with `en-GB` / `GBP` (gives `£49.00`, and keeps
  Western digits on Arabic pages as today).
- `lib/checkout.ts`: `currency: "gbp"` (type and value).
- `lib/catalog.ts`: `currency: "GBP"` (type and value), so JSON-LD reports GBP.
- `app/[lang]/success/page.tsx`: show the total when `session.currency === "gbp"`.
- Admin order detail (`app/admin/orders/[id]/page.tsx`) already appends the
  stored order currency code; keep that so any old USD test orders stay
  labelled as USD.
- Copy and comments: "Price (GBP)" in `components/admin/ProductForm.tsx`, the
  `$1,000` onboarding budget example in `lib/i18n/dictionaries/en.ts` (and the
  Arabic equivalent if present) to `£1,000`, and the "Stripe's minimum USD
  charge" comments in `lib/admin-product-rules.ts` and `lib/coupons.ts`.
  `PRICE_MIN_CENTS = 50` stays: £0.50 is above Stripe's £0.30 GBP minimum.
- Update the matching unit tests (`money`, `checkout`, `catalog`, `seo`, and
  any fixtures asserting `USD`/`usd` or `$`) and the browser tests if they
  assert `$` amounts.
- Update `blueprint/context/project-overview.md` ("whole US cents; store
  currency is USD") to pence / GBP.

Must not break: webhook order sync (it already stores whatever currency the
session reports), coupon math, refunds, analytics totals, download delivery.

Out of scope: per-visitor multi-currency display, live exchange-rate
conversion, and rewriting historical order rows.

## Build steps

- [x] 1. **Switch currency to GBP** - make the code, copy, test, and overview changes
   above.
   Done when: `pnpm test`, `pnpm lint`, and `pnpm build` pass, a repo search
   for `"usd"`, `"USD"`, and `en-US` in `lib/`, `app/`, `components/`, and
   `actions/` finds no store-currency use, and the storefront shows `£` prices.

## Verify

- Storefront home, listing, product detail, and cart show `£` prices in both
  English and Arabic.
- Proceed to checkout: Stripe's hosted page shows the same amounts in GBP (£).
- Pay with a test card: the success page shows the `£` total, the webhook
  creates an order whose currency is `gbp`, and the admin order detail shows
  `£… GBP`.
- Apply a coupon: the discounted total is in `£` on the cart and on Stripe.
- `pnpm test:browser` passes.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":3581,"specSha256":"7046274279310fad2a4f5daab5fdd61e28100626610e28b03977beb92c235076","branch":"refs/heads/fix/store-currency-to-gbp","head":"69cb8e811f5e107c411a3f2ed6712b7bb4181833","baseRef":"refs/heads/main","baseCommit":"cf2ce3832fc329df7024332a73bc4fb9e41f0628","sourceTree":"6ee9bf80f24bf932cd9ffa2927f33854ab79ce47","absentOptional":[]} -->

## Independent review

**Status:** passed
**Target commit:** 69cb8e811f5e107c411a3f2ed6712b7bb4181833
**Base commit:** cf2ce3832fc329df7024332a73bc4fb9e41f0628
**Base ref:** main
**Spec hash:** 7046274279310fad2a4f5daab5fdd61e28100626610e28b03977beb92c235076
**Prepared by:** claude
**Builder model:** claude-opus-5-5
**Requested reviewer:** claude
**Requested model:** claude-opus-5-5
**Requested execution:** automatic
**Requested at:** 2026-10-18T21:40:00Z
**Workflow:** regular
**Check required:** no
**Reviewer adapter:** claude
**Reviewer model:** claude-opus-5-5
**Reviewer context:** fresh subagent
**Actual execution:** automatic
**Reviewed at:** 2026-10-18T21:55:00Z
**Scope:** current
**Lenses:** quality, security, performance, tests
**Verdict:** passed
**Check result:** not-required

## Handoff

Review the active spec and the complete `cf2ce3832fc329df7024332a73bc4fb9e41f0628..69cb8e811f5e107c411a3f2ed6712b7bb4181833` delta in a fresh
session or isolated subagent without the builder conversation. Run all Audit lenses from scratch.
Run Check when required above. Do not edit product code, accept findings, or
reuse the existing findings as the review scope.

## Commands

- `pnpm test`: pass (77 files, 1373 tests)
- `pnpm lint`: pass
- `pnpm build`: pass

## Evidence

- Preconditions verified: HEAD equals Target commit, `git merge-base main HEAD` equals Base commit, the raw SHA-256 of the tracked `blueprint/context/current-feature.md` equals Spec hash, and the only dirty path was `blueprint/context/review.md`.
- Reviewed all 22 changed files in the delta. Checked the callers named in the spec: every `formatPriceCents` use (storefront, cart, account, admin, emails), `checkoutLineItems` (Stripe `price_data.currency: "gbp"`), the success-page `session.currency === "gbp"` guard, webhook `order-sync` (stores the session currency as-is), coupon minimum (`PRICE_MIN_CENTS` 50 is above Stripe's GBP minimum), refunds (`refunds.create` with no amount, so currency does not matter), the JSON-LD `priceCurrency`, and the admin order detail currency suffix.
- `e2e/fake-stripe.ts` copies the currency from `price_data`, and the browser specs assert prices through `formatPriceCents`, so they follow the change without hardcoded `$` amounts.
- No new trust boundary, query, or input handling in the delta. The security and performance lenses found nothing.

## Findings

- F-48 [P3] open: stale "USD" and dollar wording in a `lib/admin.ts` comment and two test names

## Remaining risk

- `pnpm test:browser` and Check were not run (not required). Stripe's hosted page in GBP and live settlement were not observed.
- Existing USD orders, if any, now show with `£` in admin and account lists and in the revenue totals. The admin order detail shows "£… USD" for them. The spec accepts this as out of scope (historical rows are not rewritten).
- GBP settlement depends on the Stripe account having a GBP bank account. That is a dashboard setting outside code.
