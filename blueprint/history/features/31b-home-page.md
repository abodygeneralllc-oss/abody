# Feature: Home Page

**From build-plan:** feature 31b
**Build attempt:** 1
**Branch:** feature/home-page
**Status:** verified

## Goal

Restyle the storefront home page (`/en`, `/ar`) to the Fiverr-inspired
marketplace look in `prototypes/redesign/index.html`: a full-bleed navy hero
with a pill search and category chips, a category icon row, marketplace product
cards in underline Featured tabs, a navy services band, numbered How it works
steps, and a blue CTA. This is a visual restyle only: no data, route, query, or
admin-setting change, and Arabic RTL keeps working.

## Design reference

- `prototypes/redesign/index.html` (home sections and their inline styles),
  `prototypes/redesign/mockup.css` (`.section`, `.section-alt`, `.card*`,
  `.chip-on-ink`, `.trust`, `.btn-light`), tokens already ported to
  `app/globals.css` by 31a.
- `prototypes/` is untracked reference only; the app never imports it.
- Mockup-only content is not ported: the hero "Ready to download / Order #1042"
  toast and the "Best seller" / "New" cover flags (no such data on the card),
  and the hard-coded "Popular" search terms (replaced by real categories).

## In scope

- `app/[lang]/page.tsx` layout: sections become full-bleed bands with an inner
  `max-w-site` container (same gutters as the 31a header, `px-4` then
  `min-[700px]:px-8`) instead of the current stack of rounded panels. Featured
  and How it works sit on the light `bg-surface` band; the rest are white.
- Hero (always shown, as today): `bg-ink` full-bleed band with the admin-editable
  eyebrow, title, and lead (`resolveHomeContent`, unchanged); a 56px pill GET
  search form to the localized `/products` with `name="q"` and
  `maxLength={SEARCH_MAX_LENGTH}` (same contract as the header search);
  a row of category chips; a trust row; and, at 960px and up, the existing
  `heroProduct` card on a white raised frame. The two hero buttons
  (Browse products, Explore services) are replaced by the search, as in the
  prototype.
- Hero chips: the first four entries of the existing `categories` list (product
  categories first, then services), each a `chip-on-ink` pill linking to the
  same `listingHref(...)` URL the category tiles use. Hidden when there are no
  categories. Shown regardless of `showCategories` because the hero always shows.
- Hero trust row: three icon + text items (lock, bolt, users) rendered only when
  `showValues` is on. It replaces the three "Why Abody" value panels, so the
  admin toggle keeps working and now controls this row.
- Category row (`showCategories`): flat tiles with a 1px border, 32px brand
  icon (download for products, users for services, as today), name, and count;
  hover darkens the border and adds `shadow-raised`. 2 / 3 / 5 columns as today.
- Marketplace product card (`components/catalog/ProductCard.tsx`, shared with
  listings, related products, and the admin preview): no outer panel border or
  padding; cover with rounded corners that gains `shadow-raised` on card hover;
  a muted meta row (type icon + category label); the name in regular weight,
  clamped to two lines, underlined on card hover; a muted facts row (bolt +
  "Instant download", or clock + "Starts after onboarding"); bold price. The
  short description is dropped from the card per the prototype. The stretched
  link, `dir="auto"`, `headingLevel`, `linked={false}` preview mode, and focus
  outline stay.
- Featured tabs (`components/home/FeaturedTabs.tsx`): section head (title,
  intro, and a "View all" link to the localized `/products`), then underline
  tabs below it (bold muted labels, 3px brand underline on the selected tab, a
  1px bottom rule, horizontal scroll if they overflow). WAI-ARIA behavior, RTL
  arrow mirroring, and the empty state are unchanged.
- Services band (`showServices`): one `bg-ink` rounded band, text column and
  two service cards on white frames (`1fr / 1.4fr` at 960px, stacked below;
  cards one column under 600px). Text column: eyebrow, `h2`, intro, three check
  ticks, and a light button to the localized `/services`. Empty services keep
  the existing empty message, in `text-ink-muted` inside the band.
- How it works (`showHowItWorks`): four steps with a 2px top rule (the first in
  the brand color), a bold `01`-`04` number (`aria-hidden`, the `ol` already
  numbers them), title, and muted body. 4 columns, 2 under 800px. Existing step
  text unchanged.
- CTA (`showCta`): `bg-primary-strong` rounded band with the admin-editable
  title, body, and action, and a large light button with the mirrored arrow.
- Dictionary changes in both `en.ts` and `ar.ts` (see Data / contracts) and the
  admin toggle label for `showValues`.
- One browser test for the hero search and a chip link.

## Out of scope

- Listing pages, detail pages, `ProductCover` shape (stays 4:3; 31c may change
  it), cart, account, and admin restyles (31c-31e).
- Any change to `lib/home.ts` selection, limits (3 featured, 2 services), the
  best-seller ranking, `SiteContent` fields, or `resolveHomeContent`.
- New product data, badges, ratings, saved/heart buttons, or fake activity.
- Searching services from the hero (it targets `/products`, like the header).

## Build loop

`workflow.stepReview` is `feature`: build all steps, running the step checks as
you go, then present one review packet at the end. `checkpointCommits` is
`disabled`: no commits during implementation; `/complete` makes the feature
commit.

## Build steps

- [x] **1. Dictionaries, section frame, and hero.** Update `en.ts` and `ar.ts`
  per Data / contracts (keep both shapes identical). Rework `page.tsx` into
  full-bleed bands with inner containers. Build the hero: eyebrow, `h1`, lead,
  pill search form, category chips, trust row gated by `showValues`, and the
  desktop hero card on a white `shadow-float` frame. Remove the value panels and
  the `ValuePanel` helper, and update the `showValues` label in
  `components/admin/SiteContentForm.tsx`.
  **Done when:** `/en` and `/ar` render the navy hero with search, chips, and
  trust row; submitting the hero search lands on `/<lang>/products?q=...`;
  turning off "Why Abody" in `/admin/content` hides only the trust row; at
  phone width the hero stacks with no horizontal scroll and the card is hidden;
  `pnpm test` passes (dictionary parity tests included).

- [x] **2. Category row, marketplace card, and Featured tabs.** Restyle the
  category tiles, `ProductCard`, and `FeaturedTabs` as in scope, and add the
  Featured "View all" link. Before dropping the card's short description,
  search `e2e/` and unit tests for assertions on card description text and
  update them only if they assert card markup rather than behavior.
  **Done when:** home cards, listing cards, related products, and the admin
  store card preview all render the new card with a working stretched link
  (none for the preview); tabs show the underline style and still switch by
  click and arrow keys in both directions; `pnpm test` and `pnpm lint` pass.

- [x] **3. Services band, How it works, and CTA.** Restyle the three sections
  as in scope, using `home.services.points` for the ticks.
  **Done when:** each section matches the prototype layout in both languages,
  each still hides with its admin toggle, the services empty message is legible
  on navy, and the step numbers are hidden from assistive tech.

- [x] **4. Browser test and final checks.** Add a test to `e2e/home.spec.ts`:
  on `/en`, fill the hero searchbox (by its accessible name
  `home.hero.search.label`) with "guide" and submit, expect
  `/en/products?q=guide`; back on `/en`, click the first hero chip and expect a
  listing URL with `category=`. Run `pnpm lint`, `pnpm test`, `pnpm build`, and
  `pnpm test:browser`.
  **Done when:** all four commands pass, including the existing home tabs,
  smoke, and storefront header-search tests.

## Files / areas

- `app/[lang]/page.tsx` - layout and every home section
- `components/catalog/ProductCard.tsx` - marketplace card
- `components/home/FeaturedTabs.tsx` - underline tabs and head layout
- `components/admin/SiteContentForm.tsx` - `showValues` label only
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts`
- `lib/i18n/dictionaries.test.ts` - only if it references removed keys
- `e2e/home.spec.ts` - new hero test
- Reused unchanged: `components/icons.tsx` (`SearchIcon`, `CheckIcon`,
  `LockIcon`, `BoltIcon`, `UsersIcon`, `DownloadIcon`, `ClockIcon`,
  `ArrowIcon`), `lib/listing.ts` (`listingHref`, `SEARCH_MAX_LENGTH`),
  `lib/home.ts`, `lib/site-content-rules.ts`, `ProductCover`

## Data / contracts

No schema, route, query parameter, or `SiteContent` change. Hero search is a
plain `GET` to `localizedPath(locale, "/products")` with `q`; the listing
already parses and limits it. Chip and tile links use the existing
`listingHref(path, { category, q: null, sort: "newest" })`.

Dictionary changes (both languages, same shape):

- `home.hero`: remove `browseProducts`, `exploreServices`; add
  `search: { label, placeholder, submit }` and `browse` (chip row label).
  - en: label "Find a digital product", placeholder "What are you looking
    for?", submit "Search", browse "Browse:"
  - ar: label "ابحث عن منتج رقمي", placeholder "عمّ تبحث؟", submit "بحث",
    browse "تصفح:"
- `home.values`: removed. The hero trust row reads the existing
  `header.trust.payment`, `.download`, and `.tracking` strings directly.
  (Implementation correction: `header.trust` is not unused; the customer email
  footer in `lib/email-layout.ts` reads it, so it stays where it is. The
  visible text is the same as approved.) `home.why` stays as the trust list's
  `aria-label`.
- `home.services`: remove `title`, `viewAll`, `promoBody`; keep
  `promoEyebrow`, `promoTitle` (the band `h2`), `intro` (band paragraph),
  `promoAction` (button); add `points` (three strings restating existing
  claims):
  - en: "A clear scope and a fixed price", "A short brief after checkout,
    then we get started", "Status updates in your account"
  - ar: "نطاق واضح وسعر ثابت", "نموذج قصير بعد الدفع ثم نبدأ العمل",
    "تحديثات الحالة في حسابك"
- Admin label (English only): `showValues` becomes "Why Abody (the trust points
  in the hero)".

## Testing

- `pnpm test`: existing dictionary parity, `lib/home`, and
  `site-content-rules` tests must pass; no new unit tests, because this feature
  adds no logic beyond `categories.slice(0, 4)`.
- `pnpm test:browser`: the new hero search and chip test, plus the existing
  home tabs (English and RTL), smoke, and storefront tests.
- `pnpm lint` and `pnpm build`.
- Visual checks at 1280px, 960px, and 390px in English and Arabic are manual
  (`/check`); do not claim them from tests.

## Notes for the AI

- Read the Next.js 16 docs in `node_modules/next/dist/docs/` before touching
  anything framework-specific; this feature should need only server components
  plus the existing client `FeaturedTabs`.
- Use the 31a tokens (`bg-ink`, `text-ink-text`, `text-ink-muted`,
  `bg-surface`, `border-border`, `border-border-strong`, `rounded-card`,
  `rounded-panel`, `rounded-full`, `shadow-raised`, `shadow-float`,
  `bg-tint-*`). Add no new tokens unless the prototype needs a value 31a did
  not port; then add it to `app/globals.css`.
- Logical properties only (`ms-`, `ps-`, `start-`, `border-s`); arrows keep
  `rtl:-scale-x-100`. Stored text keeps `dir="auto"`.
- Hero search: give it its own `id` (not `header-search`), a visible-to-AT
  `<label>`, `type="search"`, `dir="auto"`, and a focus ring on the pill via
  `focus-within` (white outline on navy). Its accessible name must differ from
  the header search's.
- Focus-visible outlines on navy use `outline-white`; elsewhere
  `outline-primary-strong`, matching existing code.
- Keep the hero card's `headingLevel="h2"`.
- The admin store card preview passes `linked={false}`; check it still looks
  right in `/admin/products/[id]`.



<!-- blueprint:completion {"schemaVersion":1,"specBytes":11983,"specSha256":"bbe1aafb7d639637a607eb89f681155be34ae7832058d132f2471a0f06f16fd9","branch":"refs/heads/feature/home-page","head":"3b596fb06e52644fcd138a66da5791eafff902bc","baseRef":"refs/heads/main","baseCommit":"3b596fb06e52644fcd138a66da5791eafff902bc","sourceTree":"b78379f0be80e2e08d8eb2b365edd1849c413e8b","absentOptional":[]} -->
