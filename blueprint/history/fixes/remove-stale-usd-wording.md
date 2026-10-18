# Fix: Remove stale USD wording

**Type:** Fix
**Status:** verified
**Branch:** fix/remove-stale-usd-wording
**Fixes:** F-48

## The problem

The store currency moved from USD to GBP (fix `store-currency-to-gbp`), but some
comments and test names in `lib/` still describe dollars:

- `lib/admin.ts:70` - the revenue comment says "all orders are USD". New orders
  are GBP, and any older USD test orders are summed as-is into a `£` figure.
- `lib/catalog.test.ts:83` - test named "adds USD" now asserts GBP.
- `lib/money.test.ts:5` - test named "formats whole dollars".
- `lib/admin-products.ts:84` and `:93` - price parsing comments say "Dollars"
  and "dollar text".
- `lib/admin-products.test.ts:63` - test named "the form's dollar text".

Comments and test names only; runtime behaviour is already correct.

## The fix

Reword each to the store currency (GBP, pounds and pence). The `lib/admin.ts`
comment notes that earlier USD test orders, if any, are summed as-is. Change no
code, assertions, or behaviour.

## Build steps

- [x] 1. **Reword the six comments and test names** above.
   Done when: a search for `USD` and `dollar` (any case) in `lib/`, `app/`,
   `components/`, and `actions/` finds no store-currency use, and `pnpm test`
   and `pnpm lint` pass.

## Verify

- `pnpm test` and `pnpm lint` pass with the same test count (1373).
- The search above comes back clean.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":1386,"specSha256":"dc90b1ceecd96be247af19d7d3d0a4091876220152f8bd0149e50fa7cf8f34f8","branch":"refs/heads/fix/remove-stale-usd-wording","head":"41ad801b57ce921c7f9fde5d602adeac9a5cfdfc","baseRef":"refs/heads/main","baseCommit":"41ad801b57ce921c7f9fde5d602adeac9a5cfdfc","sourceTree":"fa86180a010952579199d7680d12f7081f7c3d40","absentOptional":[]} -->
