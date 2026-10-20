# Fix: Listing grid test ignores extra products

**Type:** Fix
**Status:** verified
**Branch:** fix/listing-grid-test-ignores-extra-products

## The problem

`e2e/storefront.spec.ts` › "desktop listing shows two roomy cards per row"
fails whenever the `DATABASE_URL` database holds a published digital product
that is not in the seed. `pnpm test:browser` re-seeds with upserts but never
removes other rows, so a newer product (today "Social Media Content Planner")
sorts first under Newest. The seeded guide and template then land on different
rows, and the test's `template.y === guide.y` check fails (observed 554px apart,
2026-10-20). The layout itself is correct: the snapshot showed two cards per
row.

## The fix

Assert the layout on whatever cards the listing shows, not on two named seeded
products:

- Take the first two `listitem` cards in the Products results region.
- Require at least two cards (the seed guarantees two published digital
  products), then assert the same row (`|y1 - y2| < 4`) and each width
  `> 300`.

Must not break: the test still fails if the grid drops to one column or three
narrow columns; the other storefront tests and the seed are unchanged. No
product code, seed, or data cleanup changes; deleting other rows from a shared
database is out of scope.

Note: `e2e/` is gitignored, so this change stays local. The fix commit will hold
only this archive under `blueprint/history/fixes/`.

## Build steps

- [x] 1. Rewrite the test body in `e2e/storefront.spec.ts` to measure the first
  two result cards.
  Done when: the test passes on the current database with the extra product,
  and `pnpm test:browser` reports no failures.

## Verify

- `pnpm test:browser` - all tests pass (previously 29 passed, 1 failed).
- Sanity: the assertions still fail for a one-column grid (cards stack, so `y`
  differs) or three narrow columns (each about 270px wide, under 300).


<!-- blueprint:completion {"schemaVersion":1,"specBytes":1904,"specSha256":"72de2af8e2e1281c8ce9c09d078185ba01e71420043d3da5f32bdf27b217e790","branch":"refs/heads/fix/listing-grid-test-ignores-extra-products","head":"62c0be63d79d7ef04ce4c9c385f597fa3cd5d65f","baseRef":"refs/heads/main","baseCommit":"62c0be63d79d7ef04ce4c9c385f597fa3cd5d65f","sourceTree":"6f45271f1afee2af70d61d5828b051a98f529583","absentOptional":[]} -->
