# Feature: Listing Pagination

**From build-plan:** feature 30b
**Build attempt:** 1
**Branch:** feature/listing-pagination
**Status:** verified

## Goal

Split `/products` and `/services` into pages of 12 items with a `?page=`
parameter that works together with `?q=`, `?sort=`, and `?category=`, in
English and Arabic.

## In scope

- 12 items per page on both listings (`/en` and `/ar`).
- `?page=` in the URL; page 1 never has `?page=`.
- Previous, next, and page-number links that keep `category`, `q`, and `sort`.
- Changing search, sort, or category lands on page 1.
- Invalid or past-the-end `?page=` values fall back safely without an error.
- Pagination controls hidden when all results fit on one page, and on the
  empty, category-empty, and search-empty views.
- Previous/next arrows mirrored in right-to-left layout.

## Out of scope

- Database-level `LIMIT/OFFSET` paging. The catalog is small and one query
  already feeds the category counts, so paging happens in memory after the
  filter and sort.
- Page-number windowing or ellipses (every page number is shown, wrapping if
  needed).
- Per-page canonical URLs, `rel="prev"/"next"`, or sitemap changes.
- Changing the result count line (it keeps showing the total for the current
  search and category, not the page's slice).
- Any admin listing.

## Build loop

`workflow.stepReview` is `feature`: build all steps, then present one review
packet. `workflow.checkpointCommits` is `disabled`: no step commits.
`/complete` creates the final feature commit.

## Build steps

- [x] **1. Pure paging helpers in `lib/listing.ts`.**
  - `LISTING_PAGE_SIZE = 12`.
  - `parsePageParam(value: string | string[] | undefined): number` - returns
    the integer only when `value` is a single string of ASCII digits
    (`/^\d+$/`) whose value is at least 1 and a safe integer; anything else
    (missing, empty, repeated, `0`, `-1`, `2.5`, `abc`, `1e3`, huge) returns 1.
  - `paginate<T>(items: T[], page: number, pageSize = LISTING_PAGE_SIZE)` ->
    `{ items: T[]; page: number; pageCount: number }`. `pageCount` is
    `max(1, ceil(items.length / pageSize))`; a page past the end clamps to
    `pageCount`, so the customer sees the last page rather than nothing.
  - `listingHref` gains an optional `page?: number` in its state; it is added
    as the last parameter only when greater than 1. Existing callers (search
    input, category links, clear links) pass no page, so they land on page 1.
  - Done when: `lib/listing.test.ts` covers `parsePageParam` (valid, all the
    invalid shapes above), `paginate` (exact multiple of 12, partial last page,
    empty list, clamp past end, page 1), and `listingHref` with page 1 (no
    `page`), page 2 with and without other params (parameter order
    `category, q, sort, page`); `pnpm test` passes.

- [x] **2. Wire paging into the pages and `StoreListing`.**
  - `app/[lang]/products/page.tsx` and `app/[lang]/services/page.tsx` read
    `page` from `searchParams` and pass `page={parsePageParam(page)}`.
  - `StoreListing` takes `page: number`, runs `paginate(shown, page)` after
    filter and sort, renders only that slice, and passes each card its index
    within the slice. The count line still uses `shown.length`.
  - The search/sort `Form` has no `page` field, so submitting search or sort
    naturally drops it; the category links and Clear search link use `href()`
    without a page. Confirm no other link on the page carries `page`.
  - Update the `listingMetadata` comment: `?page=` also canonicalizes to the
    unfiltered listing.
  - Done when: `/en/products?page=abc`, `?page=0`, and `?page=99` render the
    normal results with no error; `pnpm build` passes.

- [x] **3. Pagination controls.**
  - Rendered below the card list only when `view === "results"` and
    `pageCount > 1`: a `<nav aria-label={listing.pagination.label}>` holding a
    list of Previous, page numbers 1..pageCount, and Next.
  - Links use `listingHref(basePath, { category, q, sort, page })` so the
    other parameters are kept and page 1 has no `?page=`.
  - The current page is a non-link element with `aria-current="page"`.
    Previous on page 1 and Next on the last page render as non-link elements
    with `aria-disabled="true"` (not focusable), so the row keeps its shape.
  - Previous and Next show `ChevronIcon` (previous flipped with
    `-scale-x-100`, next plain) plus `rtl:-scale-x-100` on both so they point
    the right way in Arabic; each has visible text or an accessible name from
    the dictionary. Page-number links have an accessible name such as
    "Page 2" from the dictionary.
  - Styling follows the existing pill links in `StoreListing` (rounded,
    `border-border`, `focus-visible:outline-primary-strong`, current page in
    `primary-strong`), at least 44px tap targets, `flex-wrap` so it never
    causes sideways scroll at phone width.
  - Add `listing.pagination` strings to `lib/i18n/dictionaries/en.ts` and
    `ar.ts` (label, previous, next, page-number name), matching the existing
    dictionary typing.
  - Done when: with more than 12 published items, the controls show, links
    keep `q`/`sort`/`category`, Previous/Next point correctly in both
    directions; with 12 or fewer they are absent; `pnpm lint` and
    `pnpm build` pass.

- [x] **4. Browser coverage for the seeded (single-page) catalog.**
  - In `e2e/storefront.spec.ts`, add one test: `/en/products?page=99` and
    `/en/products?page=abc` show the seeded products and no pagination
    navigation, and `/en/products` shows no pagination navigation.
  - Done when: `pnpm test:browser` passes. Multi-page rendering is proven by
    the unit tests plus a manual check (see Testing), because the seed has
    fewer than 13 published items and adding shared fixture products would
    change counts other browser tests assert.

## Files / areas

- `lib/listing.ts`, `lib/listing.test.ts`
- `app/[lang]/products/page.tsx`, `app/[lang]/services/page.tsx`
- `components/catalog/StoreListing.tsx`
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts`
- `components/icons.tsx` (reuse `ChevronIcon`; no new icon)
- `e2e/storefront.spec.ts`

## Data / contracts

- URL: `/<lang>/{products|services}?category=&q=&sort=&page=`, parameters in
  that order, each present only when non-default. `page` is a positive integer
  written without leading zeros; `page=1` is never generated.
- Parsing: only a single all-digit string >= 1 is honored; everything else is
  page 1. A page beyond the last is shown as the last page (no redirect, the
  URL stays as typed).
- Page size is a code constant, 12. No schema, API, or persisted-data change.
- The page is server-rendered from `searchParams`; no client state.

## Testing

- Unit (Vitest, `pnpm test`): `parsePageParam`, `paginate`, `listingHref`
  with `page` in `lib/listing.test.ts`.
- Browser (`pnpm test:browser`): single-page catalog hides controls; invalid
  and past-the-end `?page=` fall back without error.
- Manual (`/check`): with 13+ published items in the dev database, verify
  page 2 in English and Arabic, that links keep `q`/`sort`/`category`, that
  changing search, sort, or category drops `page`, arrow direction in RTL, and
  no sideways scroll at phone width.
- `pnpm lint` and `pnpm build` before review.

## Notes for the AI

- Read the relevant guide in `node_modules/next/dist/docs/` before touching
  `searchParams` / `PageProps` usage; follow the existing pattern in the two
  page files.
- Keep `lib/listing.ts` free of `next/*` and db imports (Vitest loads it
  directly).
- Category labels and `q` are user-controlled; keep rendering them as React
  text (no `dangerouslySetInnerHTML`). Page numbers come from the parsed
  integer, never the raw parameter.
- The Form's `key` is `${category}|${sort}`; do not add `page` to it, so
  paging does not reset the search box.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":7862,"specSha256":"a78d3ae848106ede8fc609493beec1ed45d9c9f7f878451a76e198f29ae7be64","branch":"refs/heads/feature/listing-pagination","head":"a19a7aa0c97a65ec676575efd4b0f2ca41e14b18","baseRef":"refs/heads/main","baseCommit":"a19a7aa0c97a65ec676575efd4b0f2ca41e14b18","sourceTree":"16cd1cdb45b2375477100d9178d9d38c882f1c29","absentOptional":[]} -->
