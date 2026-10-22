# Feature: Cart and Customer Account

**From build-plan:** feature 31d
**Build attempt:** 1
**Branch:** feature/cart-and-customer-account
**Status:** verified

## Goal

Restyle the cart (`/<lang>/cart`) and every customer account page
(`/<lang>/account`, `/orders`, `/downloads`, `/services`, `/services/[itemId]`,
`/settings`) to the marketplace look in `prototypes/redesign/`. The cart gets a
plain page head, ruled line items with pill quantity controls, and a sticky order
summary. The account gets a bordered profile and nav sidebar, plain page heads,
bordered panels, badge statuses, and a horizontal service progress track. This is
a visual restyle. It changes no data, routes, queries, Server Actions, cookies,
or auth checks, and Arabic RTL keeps working.

## Design reference

- `prototypes/redesign/cart.html`, inline `<style>`: `.cart-head`, `.cart`,
  `.lines`, `.line`, `.qty`, `.remove`, `.price`, `.summary`, `.coupon`,
  `.coupon-ok`, `.rows`, `.total`, `.note`, `.empty`.
- `prototypes/redesign/account.html`, inline `<style>`: `.acct`, `.profile`,
  `.acct-nav`, `.greet`, `.stats`, `.svc`, `.track` (including the RTL
  gradient), `.update`, `.dl`, `.icon-btn`.
- `prototypes/redesign/mockup.css`: `.panel`, `.panel-head`, `.table`,
  `.table-wrap`, `.badge` and its tones, `.btn-*`, `.link-arrow`, `.pay-icons`.
- Tokens were ported to `app/globals.css` in 31a. Map the prototype's
  `--accent*` to `primary*`, `--surface-2` to `surface`, `--surface-3` to
  `well`, and `--radius-lg` to `rounded-panel`.
- `prototypes/` is untracked reference only. The app never imports it.
- Mockup content that is not ported:
  - the account nav counts (see Notes)
  - the overview's "Active service" panel and "Latest update from Abody" note
    (no customer-facing update field exists; admin notes are internal)
  - the two-column Recent orders / Downloads row (see Notes)
  - file type and size on downloads, and download thumbnails (no such data)
  - the Apple Pay and Google Pay claims (31c removed them too)

## In scope

### Cart (`app/[lang]/cart/page.tsx`, `components/cart/*`)

- **Page frame.** Remove the `PANEL` wrappers. On the white canvas in the
  `max-w-site` container (`px-4`, then `min-[700px]:px-8`, as in 31c):
  - a plain breadcrumb (`text-sm text-muted`, mirrored chevron), same links and
    `aria-current` as today
  - **Head.** The `h1` (`text-3xl`, keeps `id={CART_HEADING_ID}`,
    `tabIndex={-1}`, and the focus target role) and the muted item count under it.
- **Notices.** `checkoutCancelled` (keeps `role="status"`) and `itemsRemoved`
  become `rounded-card` soft boxes (`bg-primary-soft` / `bg-warning-soft`) with
  no panel padding.
- **Layout.** At 960px and up, `grid-cols-[minmax(0,1fr)_380px]`, `gap-10`,
  `items-start`. Below 960px it stacks with the summary after the lines.
- **Line items (`CartLineItem`).** The `ul` has a top rule; each `li` has a bottom
  rule and `py-5`, with no card background.
  - Grid: `[120px_minmax(0,1fr)_auto]` at 600px and up; below 600px,
    `[88px_minmax(0,1fr)]` with the price moving under the details in column 2,
    aligned to the start.
  - Thumbnail: the existing `ProductImage` in a `rounded-card overflow-hidden`
    wrapper of that width.
  - Name: bold `text-base` link (`dir="auto"`), underline on hover.
  - Facts row (`text-sm text-muted`, icons inline): the category label
    (`dir="auto"`), then `BoltIcon` + `instantDownload` for products, or
    `ClockIcon` + duration (when set) and `onboardingAfterPayment` for services.
    The type label stays as the uppercase eyebrow above the name.
  - Actions row under the facts: the quantity control (or the services'
    `Quantity: 1` text), then Remove.
  - Price: bold `text-md`, tabular numbers, at the end.
- **Quantity (`CartQuantityForm`).** A 36px pill (`rounded-full border
  border-border-strong`) with round 36px step buttons (hover `bg-well`) and a bold
  tabular `output`. The submit values, disabled rules, sr-only names, and the
  `role="alert"` error are unchanged.
- **Remove (`RemoveFromCartButton`).** A text button: `TrashIcon` + visible
  `text.remove`, `text-sm text-muted`, hover `text-danger` underline. The
  sr-only `": {name}"` stays, so the accessible name is still
  `Remove: {name}`. The refocus behavior and error are unchanged.
- **Summary (`CartSummary`).** Keeps `section aria-labelledby` (the region tests
  find it by name).
  - `rounded-panel border border-border bg-panel p-5 grid gap-4`, sticky at
    `top-6` from 960px. No primary border and no shadow.
  - `h2` at `text-lg`.
  - The coupon block (`CouponForm`) sits before the rows, as in the mockup. Its
    field and Apply button are 40px, and the button is an outline pill. The
    applied/not-applied box keeps its tones as `rounded-card`. Labels, ids,
    `role="status"`/`alert`, and focus behavior are unchanged.
  - Rows (`text-sm`, tabular): subtotal with the item count, and the discount in
    `text-success`. The total row has a top rule, with a bold `text-2xl` amount.
    The `dl`/`dt`/`dd` structure stays.
  - **`CheckoutButton`.** Full-width 52px `rounded-full bg-primary-strong`, with
    `LockIcon` before the text instead of the trailing arrow. Pending text and
    error are unchanged.
  - `secureNote` as a centered `text-xs text-muted` line with no lock icon,
    then the existing `PaymentCards` (label `footer.acceptedCards`), centered.
  - Under the panel: a centered "Continue shopping" link to the localized
    `/products` (new `cart.continueShopping` key).
- **Empty state.** A centered bordered box (`rounded-panel border border-border`,
  `py-16`) with a 56px `bg-well` circle holding `CartIcon`, the `h1`
  (`emptyTitle`, `text-lg`), `emptyBody`, and `browseStore` as a primary pill
  button. It keeps the shared tree shape so the heading survives the last
  removal.
- **Suggestions.** Drop the panel: a plain section with the `h2` (`text-xl`) and
  a 4/2/1-column `ProductCard` grid, as in 31c's related products. Data and the
  `more-heading` id are unchanged.

### Account shell (`app/[lang]/account/layout.tsx`, `components/account/AccountNav.tsx`)

- Plain breadcrumb (no panel), same content.
- Grid: `grid-cols-[260px_minmax(0,1fr)]` at 960px, `gap-6`.
- **Sidebar.** `aside` as `rounded-panel border border-border bg-panel`.
  - Profile, centered, `p-5`: a 72px `bg-ink text-ink-text` round initials
    badge (`aria-hidden`), the bold name (`dir="auto"`), and the muted email
    (`dir="ltr"`, break-all).
  - Nav under a top rule, `p-2`. The links are muted and `rounded-card`, hover
    `bg-surface text-foreground`. The active link is
    `bg-primary-soft text-primary-strong font-bold` with `aria-current="page"`.
    Below 960px the row stays horizontally scrollable, as today.
  - Sign out: the same form and button, styled as the last nav row (mirrored
    `LogoutIcon`).

### Shared account parts (`components/account/AccountParts.tsx`)

- `ACCOUNT_PANEL`: `rounded-panel border border-border bg-panel`, with no shadow.
  Padding stays on the panel.
- `PageHead`: `h1` `text-2xl` with the muted intro, unchanged in content.
- `StatusChip` and `ServiceStatusChip` become prototype badges
  (`rounded-control px-2 py-0.5 text-xs font-bold`). Order tones:
  - `PAID` and `COMPLETED`: success
  - `PROCESSING`: primary
  - `PENDING`: warning
  - `REFUNDED` and `CANCELLED`: neutral (`bg-well text-muted`)

  Service tones are unchanged.
- **Tables.** A shared `TABLE` class string for the overview's recent orders:
  - header row `bg-surface`, `text-xs` uppercase muted bold (no tracking in
    Arabic, as today)
  - cells `px-5 py-3`, ruled rows, hover `bg-surface`
  - totals `text-end` with tabular numbers

  The table sits flush in its panel (the panel has no padding around it, and
  the head row has `px-5 py-4` and a bottom rule, as `.panel-head`).
- `SectionHead`: `text-md` bold `h2`. The link becomes a `link-arrow` style with
  a mirrored `ArrowIcon`.
- `EmptyState`: muted text, with the action as an outline pill button.
- `DownloadList`: ruled rows (`px-5 py-3`), with the name bold and the meta
  `text-xs text-muted`. The download link becomes an outline pill
  (`DownloadIcon` + visible `text.download`, sr-only `": {name}"`), so its
  accessible name is unchanged.

### Account pages

- **Overview (`account/page.tsx`).**
  - A plain greeting (`h1` + intro, no panel).
  - Three stat panels (bordered, `p-5`), each with a 44px `bg-primary-soft`
    `rounded-card` icon tile, the label, and the bold `text-xl` value. One
    column below 600px, three from 600px.
  - Recent orders and Recent downloads as bordered panels with a head row
    (title + link), stacked full width. The table keeps all five columns.
- **Orders (`account/orders/page.tsx`).** Each `article` is a bordered panel:
  - a head row with the order number `h2`, the date, and the badge
  - ruled item rows (`px-5`)
  - the discount row and the bold total row

  Accessible names and content are unchanged.
- **Downloads (`account/downloads/page.tsx`).** One bordered panel holding the
  restyled `DownloadList` flush, or the empty state.
- **Services (`account/services/page.tsx`).** One bordered panel of ruled rows:
  the name link, the purchase meta, `OnboardingStatus` unchanged, and the badge.
- **Settings (`account/settings/page.tsx`, `components/account/SettingsForms.tsx`).**
  - The three sections become bordered panels with a `text-md` `h2`.
  - In `SettingsForms`, only the `SUBMIT` and `SECONDARY` class strings change:
    a primary pill and an outline pill, both `h-11 rounded-full`.
  - The inputs come from `components/auth/AuthForm` and stay unchanged (shared
    with the sign-in pages, which no 31 item covers).

### Service page and progress (`account/services/[itemId]/page.tsx`, `components/account/ServiceProgress.tsx`)

- **Head.** The back link as a `link-arrow`, the `h1` with the badge, and the
  meta line, unchanged in content.
- **Progress panel.**
  - `messages[status]` sits in a `bg-surface rounded-card p-4` box, with
    `lastUpdated` under it.
  - The onboarding action link becomes a primary pill when shown.
- **`ServiceProgress`.** Below 600px it keeps today's vertical list, restyled.
  From 600px it is a horizontal track: the `ol` is a row of equal-width `li`
  (`flex-1`), one per step, so 3–5 steps fit.
  - Each `li` has a 3px connector across its top (`before:`, `inset-x-0`) and a
    17px round marker at its inline start.
  - **Done:** `bg-primary` marker and connector, with the `CheckIcon` kept
    inside the marker at 600px and up (the marker grows to 20px).
  - **Current:** a `bg-panel` marker with a `border-primary` ring, and a
    `ring-4 ring-primary-soft` halo. Its connector is half `primary`, half
    `border` (`bg-linear-to-r` with stops at 50%, using `rtl:bg-linear-to-l`).
  - **Upcoming:** a `border-border` marker and connector, with muted text.
  - **Cancelled:** keeps the `bg-danger` marker with `MinusIcon`.
  - The label and date sit under the marker (`pt-6 text-sm`).
  - `aria-current="step"`, the sr-only state words, and the dates are unchanged.
- **Details panel.** A bordered panel. `OnboardingAnswers` is unchanged.

## Out of scope

- Any change to `lib/cart.ts`, `lib/cart-coupon.ts`, `lib/account.ts`,
  `lib/service-progress.ts`, `lib/onboarding.ts`, `actions/*`, cookies,
  checkout, or auth and redirect logic.
- New account data: nav counts, an active-service panel, admin updates, file
  sizes, and thumbnails.
- `/login`, `/register`, `/forgot-password`, `/reset-password`, the onboarding
  form, `/success` and `/checkout/return`, and the `AuthForm` inputs.
- The admin restyle (31e). `components/admin/*` is untouched.
- Making the site header sticky.

## Build loop

`workflow.stepReview` is `feature`: build all steps, running each step's check as
you go, then present one review packet at the end. `checkpointCommits` is
`disabled`: no commits during implementation. `/complete` makes the feature
commit.

## Build steps

- [x] **1. Cart restyle.**
  - Add `cart.continueShopping` to `en.ts` and `ar.ts`.
  - Rework `cart/page.tsx`, `CartLineItem`, `CartQuantityForm`,
    `RemoveFromCartButton`, `CartSummary`, `CheckoutButton`, and `CouponForm`
    (classes and layout only) as in scope.
  - **Done when:**
    - `/en/cart` and `/ar/cart` with a product and a service show the plain
      head, ruled lines, the pill quantity control, the visible Remove, and the
      summary sticky beside the lines at 1280px and under them at 390px, with
      no sideways scroll.
    - Applying and removing a code, changing quantity, removing the last item
      (focus lands on the empty-state heading), and checkout all still work.
    - `pnpm test` (dictionary parity) and `pnpm lint` pass.

- [x] **2. Account shell and shared parts.**
  - Rework `account/layout.tsx`, `AccountNav`, and `AccountParts` as in scope.
  - **Done when:**
    - Every account page shows the bordered sidebar with the centered profile.
    - The active nav link is highlighted, and the row scrolls sideways below
      960px.
    - Sign out still works.
    - `pnpm lint` passes.

- [x] **3. Account pages.**
  - Rework the overview, orders, downloads, services list, and settings pages,
    plus the `SettingsForms` button classes.
  - **Done when:**
    - A signed-in customer with a paid product order and a service sees each
      page in English and Arabic: bordered panels, badge statuses, the flush
      recent-orders table, the download pill, and empty states for a new
      account.
    - Downloads still download.
    - The settings forms still save, show errors, and move focus as before.
    - `pnpm lint` passes.

- [x] **4. Service page and progress track.**
  - Rework `account/services/[itemId]/page.tsx` and `ServiceProgress.tsx`.
  - **Done when:**
    - A service with no details (current on Details), one `IN_PROGRESS`, and
      one `CANCELLED` each show the right markers.
    - The track is horizontal at 1280px and vertical at 390px.
    - The connectors and the current half-fill mirror in Arabic.
    - The onboarding link appears only when action is needed.
    - `pnpm lint` passes.

- [x] **5. Tests and final checks.**
  - In `e2e/storefront.spec.ts`, add a desktop-only cart layout test: with a
    product in the cart at 1280px, the `en.cart.summary` region's left edge is
    to the right of the first line item's right edge, and the
    `${en.cart.remove}: ${SEED.template.name}` button shows the visible text
    `en.cart.remove`.
  - In `e2e/service.spec.ts`, after the existing visit to the Arabic service
    page:
    - the progress list has exactly one `li[aria-current="step"]`
    - on the desktop project, the first two steps share a top edge within 4px
  - Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`.
  - **Done when:** all four pass, including the existing cart, checkout,
    account, service, auth, access, and phone-width tests. Change those tests
    only where they assert removed markup, not behavior.

## Files / areas

- `app/[lang]/cart/page.tsx`
- `components/cart/CartLineItem.tsx`, `CartQuantityForm.tsx`,
  `RemoveFromCartButton.tsx`, `CartSummary.tsx`, `CheckoutButton.tsx`,
  `CouponForm.tsx`
- `app/[lang]/account/layout.tsx`, `page.tsx`, `orders/page.tsx`,
  `downloads/page.tsx`, `services/page.tsx`, `services/[itemId]/page.tsx`,
  `settings/page.tsx`
- `components/account/AccountNav.tsx`, `AccountParts.tsx`,
  `ServiceProgress.tsx`, `SettingsForms.tsx` (two class strings)
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts`
- `e2e/storefront.spec.ts`, `e2e/service.spec.ts`
- Reused unchanged:
  - `ProductImage`, `ProductCard`
  - `PaymentCards`
  - `OnboardingStatus`, `OnboardingAnswers`
  - the icons in `components/icons.tsx`
  - `lib/cart.ts`, `lib/account.ts`, `lib/service-progress.ts`

## Data / contracts

There is no schema, route, query-parameter, Server Action, cookie, or API change.
Every link keeps its current `localizedPath` target. The new continue-shopping
link is `localizedPath(locale, "/products")`.

Accessible names that tests and screen readers rely on stay exactly as they are:

- the cart summary region (`cart.summary`)
- `cart.increase` / `cart.decrease` / `cart.remove` + `": {name}"`
- `cart.checkout`
- the order `article` names (`{orderLabel} #{number}`)
- `account.download` + `": {name}"`
- `account.signOut`
- the account nav label and `aria-current`
- `aria-current="step"`

Dictionary change (both languages, same shape):

- `cart.continueShopping`: en "Continue shopping", ar "متابعة التسوق"

User-entered text (names, emails, product names, coupon codes) keeps rendering
as React text with its current `dir` attributes. None is ever set as HTML.

## Testing

- `pnpm test`: dictionary parity covers the new key. No logic changes, so there
  are no new unit tests.
- `pnpm test:browser`: the two additions in step 5, plus the existing suite, run
  on desktop and the phone-width project.
- Visual fidelity against the mockups is checked by eye during `/check`. No
  screenshot tests.

## Notes for the AI

- Read the relevant guide in `node_modules/next/dist/docs/` before touching
  route files. These edits are JSX and class changes only.
- Follow 31c's conventions for pills, the plain breadcrumb, container padding,
  and mirrored icons (`rtl:-scale-x-100`). Reuse the class strings 31c added
  where they already exist, rather than inventing new ones.
- **Nav counts are omitted** because the account layout does not re-render on
  navigation, so counts there would go stale after a purchase. The overview
  stats already show them.
- **Recent orders and downloads stack full width** instead of the mockup's
  1.5fr/1fr row. The real table has five columns, including Items, which would
  be cramped or scroll at 960–1280px.
- **Order badge tones follow the mockup** (Paid green, Processing blue,
  Refunded neutral). Cancelled joins Refunded as neutral because both are ended
  states, not errors.
- The cart `h1` must stay the same element across the filled and empty states.
  `RemoveFromCartButton` focuses it by id after the last removal.
- Keep client components receiving only plain strings, as they do today.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":18223,"specSha256":"f32632b94e8931fbae46223a5b94d817b3e4a152926a3ed18a3016a3b7931307","branch":"refs/heads/feature/cart-and-customer-account","head":"d6b2cad100deee7c0e12f2c51f6e8a9897ac3d64","baseRef":"refs/heads/main","baseCommit":"d6b2cad100deee7c0e12f2c51f6e8a9897ac3d64","sourceTree":"bccff5f431db9de5648abbbebc9cabb55c340a60","absentOptional":[]} -->
