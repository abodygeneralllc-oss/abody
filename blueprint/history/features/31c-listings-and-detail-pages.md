# Feature: Listings and Detail Pages

**From build-plan:** feature 31c
**Build attempt:** 1
**Branch:** feature/listings-and-detail-pages
**Status:** verified

## Goal

Restyle `/products`, `/services`, and the product and service detail pages
(`/<lang>/products/[slug]`, `/<lang>/services/[slug]`) to the marketplace look
in `prototypes/redesign/`. Listings get a page head, a sticky chip and filter
bar, a full-width card grid, and pill pagination. Detail pages get a gig-style
layout with a large cover, a sticky purchase box, what's included, after-purchase
steps, and general store questions. This is a visual restyle. It changes no data,
routes, or query parameters, and no search, sort, filter, pagination, or cart
behavior. Arabic RTL keeps working.

## Design reference

- `prototypes/redesign/products.html` and `product.html`: their inline `<style>`
  blocks (`.page-head`, `.type-switch`, `.filters`, `.chips`, `.filter-search`,
  `.sort`, `.result-bar`, `.pager`, `.empty`, `.detail`, `.by`, `.hero-cover`,
  `.block`, `.included`, `.after`, `details`/`summary`, `.buy*`,
  `.contact-card`) and `mockup.css` (`.chip`, `.chip.is-active`, `.badge`,
  `.crumbs`). The tokens were already ported to `app/globals.css` in 31a.
- `prototypes/` is untracked reference only. The app never imports it.
- Content in the mockup that is not ported:
  - the "Best seller" and "New" cover flags (the card has no such data)
  - the "Abody team" avatar byline
  - the "Weekly reports" fact
  - the Apple Pay and Google Pay payment claims
  - the hard-coded result numbers

## Decision recorded

The user chose **3 cards per row with a chip bar** over the prototype's 4 and
30a's 2. The category sidebar is removed. The grid uses 3 columns at 960px and
up, 2 from 600px, and 1 below. Cards are about 380px wide at the 1280px
container. A page of 12 fills 4 full rows. The project plan's Product Store
sentence and the 30a browser test change to match (step 1 and step 4).

## In scope

### Listings (`components/catalog/StoreListing.tsx`)

- **Page head.** Remove the panels. On a white canvas, in the `max-w-site`
  container (`px-4`, then `min-[700px]:px-8`, same as the 31a header):
  - plain breadcrumb (Home, then the mirrored chevron, then the current title),
    `text-sm text-muted`
  - `h1` and the intro (`max-w-[60ch]`)
  - the Products / Services type switch as a segmented pill:
    - `bg-well` track
    - the current item is `bg-panel` with a small shadow
    - keeps `aria-current="page"` and the `listing.catalogType` nav label
- **Filter bar.** A full-bleed band with a bottom border, `sticky top-0 z-10`
  on a white background (the site header is not sticky, so the bar sits at
  the very top). Inside the container, one wrapping row holds:
  - **Category chips.**
    - The chips are `All` + each category, in the existing `filterLinks` order.
    - Same `href(...)` and `aria-current="true"`.
    - The count stays in a muted span after the label, so the link name still
      starts with the category name.
    - The row is horizontally scrollable, with the scrollbar hidden.
    - Chip style: 36px pill, `border-border-strong`, hover darkens the border;
      the active chip is `bg-foreground text-background`.
    - The chips sit in a `<nav aria-label={listing.categories}>` with a `<ul>`.
  - **Search.** The existing `ListingSearchInput` inside the existing `Form`,
    restyled as a 36px pill:
    - 240px wide at 800px and up, full-width row below
    - debounce, clear button, IME handling, and the noscript submit button are
      unchanged
  - **Sort.** The existing `ListingSortSelect`: borderless, bold value,
    "Sort by" label kept as the accessible label.
- **Result bar.**
  - The mounted `role="status"` line keeps its current text and live
    behavior, styled `text-sm text-muted` with the count in bold.
  - When there is more than one page, a muted "Showing {from}–{to}" range is
    added (new string, computed from `paged`).
- **Grid.** The full-width card grid described in Decision recorded,
  `gap-5 min-[960px]:gap-6`, reusing `ProductCard` unchanged (restyled in 31b).
- **Pagination.**
  - Previous and Next are bordered pills (`border-border-strong`).
  - Page numbers are 40px circles; hover is `bg-well`.
  - The current page is `bg-foreground text-background`.
  - Disabled steps are at 40% opacity.
  - Links, labels, `aria-current`, the `aria-disabled` spans, and arrow
    mirroring are unchanged.
- **Empty states** (`search-empty`, `empty`, `category-empty`):
  - A centered bordered box (`rounded-panel border border-border`) with a 56px
    `bg-well` circle holding `SearchIcon`.
  - The `role="status"` text stays in the same mounted element.
  - The existing Clear search and All links become outline pill buttons.
  - No new copy.
- **Removed:** the sidebar, the `PANEL` wrapper sections, and the `categories`
  `h2` (its text becomes the chip nav label).

### Detail pages (`components/catalog/ProductDetail.tsx`)

- **Layout.**
  - At 960px and up: `grid-cols-[minmax(0,1fr)_380px]`, `gap-10`.
  - DOM order: head, purchase box, content. The head (breadcrumb, `h1`, meta
    row, cover) sits in column 1, row 1. The purchase `aside` sits in column 2
    across rows 1 and 2, `self-start sticky top-6`. Content blocks sit in
    column 1, row 2.
  - Below 960px everything stacks in DOM order, so Add to cart comes right
    after the cover on phones (not after the FAQ as in the mockup), and the
    aside is not sticky.
- **Head.**
  - plain breadcrumb (Home, the listing, the item name with `dir="auto"`)
  - `h1` (`dir="auto"`, `max-w-[22ch]`)
  - **Meta row.**
    - a type badge (`bg-primary-soft text-primary-strong`, `rounded-control`)
    - the category label (`dir="auto"`)
    - the delivery fact: the duration for services with `durationDays`,
      otherwise `startsAfterOnboarding`; `instantDownload` for products
    - 1px `border-border-strong` separators (`aria-hidden`)
- **Cover.** `ProductCover` with a new optional `variant: "card" | "hero"`
  (default `"card"`). `"hero"` uses `aspect-video` and `rounded-panel`. The
  product placeholder sheet scales to about 46% width, and there is no
  duration pill (the meta row shows it). The `alt` stays the product name.
- **Blocks.** Each block is `py-6 border-b border-border` with an `h2`
  (`text-xl`); the last block has no border.
  1. **About.**
     - Heading: `text.about[type]`.
     - Body: the short description, then the full description, in
       `text-muted`, `max-w-[68ch]`. Both keep `dir="auto"`, `break-words`,
       and `whitespace-pre-line` on the description.
  2. **What's included.**
     - Shows only when `included` has lines.
     - Two columns at 600px and up, with a `text-success` check icon.
  3. **What we need from you.**
     - Services only, and only when there are requirements.
     - Same checklist style as What's included, one column.
     - The prototype omits this block, but it is product data, so it stays.
  4. **What happens after you buy.**
     - Shown for both types.
     - Three numbered cards (`bg-surface rounded-card p-4`), each with:
       - a 28px `bg-ink` number circle (`aria-hidden`; the `ol` numbers them)
       - a bold title
       - a muted body from `text.afterPurchase.steps[type]`
     - Three columns at 960px and up.
     - Replaces the old After you buy checklist and the How it works panel.
  5. **Common questions.**
     - Three native `<details>`/`<summary>` items, the first `open`.
     - Each has a bold summary with a `ChevronIcon` turned to point down
       (`rotate-90`) that flips when open (`group-open:` rotate).
     - Rule lines sit between items.
     - The summary hides its default marker and has a visible focus outline.
     - Copy is in Data / contracts. The third answer links to the localized
       `/returns`.
- **Purchase box (`aside aria-label={text.purchase}`).**
  - Container: `rounded-panel border border-border overflow-hidden`.
  - **Tab strip.** The type label with a 3px `border-primary` underline, on a
    1px rule.
  - **Body** (`p-5 grid gap-4`):
    - **Price row.** Muted `text.price` at the start; the bold `text-2xl`
      price at the end, with `/ {duration}` for services.
    - **Facts row** (bold `text-sm`):
      - Products: `BoltIcon` + `instantDownload`, then `DownloadIcon` +
        `keptInAccount`.
      - Services: `ClockIcon` + the duration (when set), then `ChartIcon` +
        `statusUpdates`.
    - **Included list.** Up to the first 3 included lines (muted, check
      icons, `dir="auto"`). Omitted when there are none.
    - **Add to cart.** The existing `AddToCartButton`, full width, with its
      text props unchanged.
  - **Foot** (`bg-surface border-t`, `text-sm text-muted`):
    - `LockIcon` + `securePayment`
    - `ShieldIcon` + `fromAccount`
  - Below the box: a bordered **contact card** with "Have a question first?"
    and an outline pill link to the localized `/contact` ("Contact us").
- **Related products.** `components/catalog/RelatedProducts.tsx` drops its
  panel and becomes a plain section under the detail grid (`pt-0`), with the
  `h2` and the View all link in a row and a 4/2/1-column grid
  (`min-[960px]:grid-cols-4`, `min-[600px]:grid-cols-2`). Data and the
  `related-heading` id are unchanged.
- **Removed:** the `Fact` helper and its `dl`, the CHIP chips, the separate
  description and requirements panel, and the How it works panel.

### Plan

- In `blueprint/project-plan.md`, under Product Store, change the sentence
  "two cards per row beside the category filter, not three" to say three cards
  per row on desktop with a category chip bar. Wording is in Data / contracts.

## Out of scope

- Any change to `lib/listing.ts` (parsing, filter, sort, pagination, counts),
  `lib/catalog.ts` queries, `lib/product-page.ts`, metadata, JSON-LD, or
  `AddToCartButton` behavior.
- The `ProductCard` design (31b) and the home page.
- Cart, account, checkout, and admin restyles (31d, 31e). The admin card
  preview is unaffected because it uses `ProductCard`, not `ProductCover`'s
  hero variant.
- Ratings, sellers, badges, packages, tabs beyond the single type tab, or any
  new product field.
- Making the site header sticky.
- Regenerating the overview. Re-run `/overview` after `/complete` because the
  project plan changes.

## Build loop

`workflow.stepReview` is `feature`: build all steps, running each step's check
as you go, then present one review packet at the end. `checkpointCommits` is
`disabled`: no commits during implementation. `/complete` makes the feature
commit.

## Build steps

- [x] **1. Dictionaries and plan sentence.**
  - Apply the dictionary changes in Data / contracts to `en.ts` and `ar.ts`,
    keeping both shapes identical.
  - Update the project-plan sentence.
  - Before removing keys, grep `app`, `components`, `lib`, and `e2e` for each
    one. Today only `ProductDetail.tsx` reads the removed `product.*` keys.
  - **Done when:** `pnpm test` passes, including dictionary parity. The app
    still builds after the step 2 and 3 edits, which consume the new keys.

- [x] **2. Listing restyle.**
  - Rework `StoreListing.tsx` as in scope.
  - Restyle `ListingSearchInput` (classes only) and the sort select's class
    string.
  - Compute the "Showing" range from `paged.page` and the page size exported
    by `lib/listing.ts`. If `lib/listing.ts` does not export it, use
    `paged.items.length` and the page number.
  - **Done when:** `/en/products` and `/ar/services` show:
    - the page head, the type switch, and the sticky chip bar with search and
      sort
    - 3 cards per row at 1280px, 2 at 800px, and 1 at 390px, with no sideways
      scroll
    - chips filtering by category, with the active chip marked
    - search, sort, and pagination behaving exactly as before
    - each empty state as the centered box, with its status text and link

    `pnpm lint` passes.

- [x] **3. Detail restyle.**
  - Add the `variant` prop to `ProductCover`.
  - Rework `ProductDetail.tsx` and `RelatedProducts.tsx` as in scope.
  - **Done when:** a product and a service detail page in English and Arabic
    show:
    - the head with the meta row and the 16:9 cover
    - the purchase box sticky beside the content at 1280px, and right after
      the cover at 390px
    - About, What's included, What we need from you (services with
      requirements), the after-purchase steps, and the questions
    - the questions opening and closing by keyboard
    - Add to cart still adding the item, with its status and View cart link
    - related products in the new section
    - the chevrons and arrows mirrored in RTL

    `pnpm lint` passes.

- [x] **4. Tests and final checks.**
  - In `e2e/storefront.spec.ts`, replace "desktop listing shows two roomy
    cards per row" with a three-per-row test (desktop project only):
    - the first three cards share a top edge within 4px
    - each card is wider than 300px
    - this needs at least three seeded published products; check `SEED` and
      the seed script, and if there are fewer, assert the first two share a
      row and are under half the container width
  - Add a detail test:
    - on `/en/services/${SEED.ads.slug}`, the purchase region
      (`getByRole("complementary", { name: en.product.purchase })`) contains
      the price and the Add to cart button
    - clicking the second question's summary reveals its answer
    - the Return Policy link in the third answer goes to `/en/returns`
  - Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`.
  - **Done when:** all four commands pass, including the existing listing
    filter, search and sort, pagination, header search, detail, cart, and
    Arabic RTL tests. Change those tests only where they assert removed markup,
    not behavior.

- [x] **5. Repair: purchase box foot text (from `/check`).**
  - Restore `product.fromAccount` ("From your account" / "من حسابك") in both
    dictionaries; step 1 removed it although the spec keeps it.
  - The foot's second line shows `ShieldIcon` + `fromAccount` for both types,
    so it no longer repeats the facts row.
  - **Done when:** `pnpm lint`, `pnpm test`, and `pnpm build` pass, and the
    foot reads "Secure payment" then "From your account" on a product and a
    service.

## Files / areas

- `components/catalog/StoreListing.tsx`: listing layout, chips, result bar,
  pagination, empty states
- `components/catalog/ListingSearchInput.tsx`: class names only
- `components/catalog/ProductDetail.tsx`: detail layout, blocks, purchase box,
  questions
- `components/catalog/ProductCover.tsx`: the `variant` prop
- `components/catalog/RelatedProducts.tsx`: plain section
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts`
- `blueprint/project-plan.md`: the Product Store sentence
- `e2e/storefront.spec.ts`: the grid test replaced, the detail test added
- Reused unchanged:
  - `ListingSortSelect` (its class is passed in)
  - `ProductCard`, `AddToCartButton`, `ProductJsonLd`
  - `lib/listing.ts`, `lib/catalog.ts`, `lib/product-page.ts`
  - from `components/icons.tsx`: `SearchIcon`, `ChevronIcon`, `CheckIcon`,
    `BoltIcon`, `DownloadIcon`, `ClockIcon`, `ChartIcon`, `LockIcon`,
    `ShieldIcon`, `ArrowIcon`
  - the route files under `app/[lang]/products` and `app/[lang]/services`

## Data / contracts

There is no schema, route, query-parameter, or API change. Listing URLs keep
`category`, `q`, `sort`, and `page` exactly as `listingHref` builds them. The
FAQ return link is `localizedPath(locale, "/returns")`, and the contact card
link is `localizedPath(locale, "/contact")`.

Dictionary changes (both languages, same shape):

- **`listing`**
  - add `showing: "Showing {from}–{to}"` / `"عرض {from}–{to}"`
  - `categories` stays (now the chip nav label)
- **`product`, removed keys**
  - `description`, `howItWorks`, `steps`, `afterYouBuy`, `afterYouBuySteps`,
    `delivery`, `access`
  - `duration` stays only if still read; grep first, remove it if unused
- **`product`, added keys**
  - **`about`**
    - en: `{ DIGITAL_PRODUCT: "About this product", SERVICE: "About this service" }`
    - ar: `{ DIGITAL_PRODUCT: "عن هذا المنتج", SERVICE: "عن هذه الخدمة" }`
  - **`afterPurchase.title`**
    - en: "What happens after you buy"
    - ar: "ماذا يحدث بعد الشراء"
  - **`afterPurchase.steps.DIGITAL_PRODUCT`** (each a `{ title, body }`; these
    restate the removed After you buy lines)
    - en:
      - "Pay securely" / "Check out as a guest or signed in."
      - "Download right away" / "The download appears on your order
        confirmation page."
      - "Keep it handy" / "It stays under Downloads in your account, and a
        receipt arrives by email."
    - ar:
      - "ادفع بأمان" / "أكمل الشراء كضيف أو بعد تسجيل الدخول."
      - "حمّل فوراً" / "يظهر رابط التحميل في صفحة تأكيد طلبك."
      - "احتفظ به" / "يبقى في التنزيلات في حسابك، ويصلك إيصال بالبريد."
  - **`afterPurchase.steps.SERVICE`**
    - en:
      - "Send your brief" / "Answer a short form about your business after
        payment."
      - "We get to work" / "Your service moves to In progress and you get an
        email."
      - "Track and receive" / "Follow updates in your account until it's
        complete."
    - ar:
      - "أرسل متطلباتك" / "أجب عن نموذج قصير عن نشاطك بعد الدفع."
      - "نبدأ العمل" / "تنتقل خدمتك إلى «قيد التنفيذ» ويصلك بريد."
      - "تابع واستلم" / "تابع التحديثات في حسابك حتى الاكتمال."
  - **`questions.title`**
    - en: "Common questions"
    - ar: "أسئلة شائعة"
  - **`questions.items`** (three `{ question, answer }`, with no payment
    provider or wallet names)
    - en:
      - "How do I pay?" / "Payment is secure and handled at checkout. We never
        store your card details."
      - "Can I buy without an account?" / "Yes, you can check out as a guest.
        Sign in before you buy to keep your downloads and services in your
        account."
      - "What is the refund policy?" / answer `"See our {link} for when a
        refund applies."`, with `returnLink: "Return Policy"`
    - ar:
      - "كيف أدفع؟" / "الدفع آمن ويتم عند إتمام الطلب. لا نحفظ بيانات بطاقتك."
      - "هل يمكنني الشراء دون حساب؟" / "نعم، يمكنك الشراء كضيف. سجّل الدخول قبل
        الشراء لتبقى تنزيلاتك وخدماتك في حسابك."
      - "ما سياسة الاسترداد؟" / `"راجع {link} لمعرفة متى يمكن استرداد المبلغ."`,
        with `returnLink: "سياسة الإرجاع"`
    - Render `{link}` by splitting the string on the placeholder. Never inject
      HTML.
  - **`contact`**
    - en: `{ prompt: "Have a question first?", action: "Contact us" }`
    - ar: `{ prompt: "لديك سؤال قبل الشراء؟", action: "تواصل معنا" }`

New project-plan Product Store sentence: "The store listings show three cards
per row on desktop under a category chip bar, and split long results into
pages of 12 items, which work together with search, sort, and the category
filter."

## Testing

- `pnpm test`: dictionary parity and the existing `lib/listing` and
  `lib/catalog` tests. There are no new unit tests: the only new logic is the
  "Showing" range and the `{link}` split, which the browser test covers.
- `pnpm test:browser`: the new three-per-row and detail tests, plus the
  existing storefront, home, checkout, service, and access suites.
- `pnpm lint` and `pnpm build`.
- Visual checks at 1280px, 960px, 800px, and 390px in English and Arabic, and
  the sticky filter bar and purchase box while scrolling, are manual (`/check`).
  Do not claim them from tests.

## Notes for the AI

- Read the Next.js 16 docs in `node_modules/next/dist/docs/` before any
  framework-specific change. This feature should need only the existing server
  components plus the existing client `ListingSearchInput` and
  `ListingSortSelect`.
- Use the 31a tokens:
  - colors: `bg-well`, `bg-surface`, `border-border`, `border-border-strong`,
    `text-muted`, `text-faint`, `bg-ink`, `bg-foreground`, `text-background`,
    `bg-primary-soft`, `text-success`
  - radii: `rounded-control`, `rounded-card`, `rounded-panel`, `rounded-full`
  - shadows: `shadow-raised`
  - Add no tokens.
- Use logical properties only. Directional icons keep `rtl:-scale-x-100`.
  Stored text keeps `dir="auto"` and `break-words`.
- `position: sticky` needs no `overflow` ancestor that clips. Check that the
  `layout.tsx` and page wrappers don't set `overflow-hidden`. If one does,
  remove sticky for that element and note it rather than restructure the
  layout.
- Keep the search input's `id="listing-search"` and its label. Its accessible
  name must stay `text.searchLabel` so the existing test still finds it.
- Results stay in a `section` with `aria-label={text.title}`, because tests
  find cards by that region.
- Focus-visible outlines use `outline-primary-strong` with `outline-offset-2`,
  matching existing code. Hover-only colors need a focus-visible equivalent.
- `<summary>` is keyboard-operable natively. Do not add click handlers.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":21892,"specSha256":"580896997b6ad44a17b727d12157d2347941d795eb49791372d261d37e295431","branch":"refs/heads/feature/listings-and-detail-pages","head":"9eba83ba304ca02ba72aed0c7f5a5153d7e3a74b","baseRef":"refs/heads/main","baseCommit":"9eba83ba304ca02ba72aed0c7f5a5153d7e3a74b","sourceTree":"ecc98e26d7717783e320d8c679dc267c3d3b9e5a","absentOptional":[]} -->
