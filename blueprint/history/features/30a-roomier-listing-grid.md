# Feature: Roomier Listing Grid

**From build-plan:** feature 30a
**Build attempt:** 1
**Branch:** feature/roomier-listing-grid
**Status:** verified

## Goal

On desktop, `/<lang>/products` and `/<lang>/services` show three cards per row
beside the 280px category sidebar. Inside the 1200px site width and the results
panel's padding, each card is only about 245px wide, which looks cramped. Show
two cards per row on desktop, which makes each card about 375px wide with a
larger cover image, and add more space between cards. Phones keep one card per
row. Works in English and Arabic, with no sideways scroll at phone width. This
is a layout-only change: no schema, data, URL, or text change.

## Design reference

Uses the listing grid in `components/catalog/StoreListing.tsx` and the shared
`ProductCard` / `ProductCover`. The 4:3 cover grows with the card width, so a
wider card gets a larger image automatically. Reuse existing spacing utilities
and add no new theme tokens. `prototypes/products.html` shows three columns.
This feature deliberately moves away from that because the user reported that
three columns look congested.

## In scope

- Results grid on both listing pages (`StoreListing` is shared by both):
  - below 600px: one column (unchanged)
  - 600px and up: two columns (unchanged)
  - 960px and up (sidebar beside results): **two columns**, replacing three,
    with a larger gap between cards than today's `gap-6`
- Cover images get larger only because the cards are wider. The 4:3 ratio
  stays the same.
- English and Arabic (RTL) both lay out correctly. The grid has no
  direction-specific classes.
- One browser assertion that two seeded cards share a row at desktop width.

## Out of scope

- Pagination (30b), and any change to search, sort, category, or URLs.
- `ProductCard` and `ProductCover` internals. They are shared by the home page,
  cart suggestions, related items, and admin previews, and those pages keep
  their current layout.
- The sidebar width, the toolbar, the empty states, the detail pages, and the
  home page.
- Moving the category filter above the results.

## Build loop

`workflow.stepReview` is `feature`: build all steps in order, run each step's
check as you go, and present one review packet after the last step.
`workflow.checkpointCommits` is `disabled`: no step commits. `/complete`
creates the final feature commit.

## Build steps

- [x] **1. Two-column desktop grid.** In `components/catalog/StoreListing.tsx`,
  change the results `<ul>` from
  `grid gap-6 min-[600px]:grid-cols-2 min-[960px]:grid-cols-3` to keep two
  columns at 960px and up and raise the gap at that breakpoint (for example
  `grid gap-6 min-[600px]:grid-cols-2 min-[960px]:gap-8`).
  **Done when:** `pnpm lint` and `pnpm build` pass. At 1280px width,
  `/en/products`, `/ar/products`, and `/en/services` show two cards per row,
  mirrored in Arabic. At phone width, the listing shows one card per row
  with no sideways scroll.

- [x] **2. Browser assertion.** In `e2e/storefront.spec.ts`, extend the existing
  "products listing shows published seeded products..." test, or add one
  small test under the desktop `chromium` project (1280px wide). It asserts
  that the `SEED.template` and `SEED.guide` cards' bounding boxes have the same
  top within a few pixels (they share a row) and that each card is wider than
  300px. This rules out a three-column layout.
  **Done when:** `pnpm test:browser` passes, including the existing
  `@mobile` no-sideways-scroll test.

## Files / areas

- `components/catalog/StoreListing.tsx` - results grid classes only.
- `e2e/storefront.spec.ts` - one desktop layout assertion.

## Data / contracts

None. No schema, API, URL, or dictionary change.

## Testing

- `pnpm lint`, `pnpm build`.
- `pnpm test` still passes (no unit tests added: the change has no logic).
- `pnpm test:browser`: the new desktop assertion plus the existing storefront
  tests, including the Arabic RTL and `@mobile` sideways-scroll tests.
- Not claimed: a pixel or visual comparison.

## Notes for the AI

- Listing breakpoints use arbitrary `min-[600px]` / `min-[960px]` variants.
  Keep that style.
- Do not touch `ProductCard` or the other grids (`RelatedProducts` uses four
  columns, and the home page has its own rows). This feature covers the
  listing pages only.
- Find cards in the browser test through their `h2` headings inside the
  results region, as the existing test does, then use the closest `li` or
  `article` for the bounding box.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":4505,"specSha256":"b8e35f2e3b27286e7a1ae0475f5ac2f46cab12b3daeed25bd9d1678fc2a7adcd","branch":"refs/heads/feature/roomier-listing-grid","head":"a9698729ca4fdcf5948e2144bedf7f3e6b4535a8","baseRef":"refs/heads/main","baseCommit":"a9698729ca4fdcf5948e2144bedf7f3e6b4535a8","sourceTree":"d15ce7721aade9920bb1ca56902a4b7129e773e5","absentOptional":[]} -->
