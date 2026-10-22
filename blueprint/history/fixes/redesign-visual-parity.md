# Fix: Redesign Visual Parity

**Type:** Fix
**Status:** verified
**Branch:** fix/redesign-visual-parity

## The problem

Feature 31 (Marketplace Redesign) shipped, but the pages still don't look like
the approved mockups in `prototypes/redesign/`. On 2026-10-22 each page was
compared with its mockup at 1440px wide, using the dev server and the dev
database:

| Page | Mockup | Gaps found |
| --- | --- | --- |
| Shell (all customer pages) | every page | Header puts Home/Products/Services/About/Contact in the second row. The mockup has Products and Services in the top bar and a second row of store categories ending in About and Contact. Signed-in users see "Account" with a person icon instead of an initials avatar and first name. |
| Every page | `theme.css` | `--color-surface` is light gray in `app/globals.css`, but `--surface` is white in the mockup. Controls built on `bg-surface` (auth inputs, auth tabs, chips) show a gray fill. Filled action buttons are pill-shaped (`rounded-full`); the mockup `.btn` uses the 8px radius. |
| Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`) | `auth.html` | The breadcrumb sits in an almost invisible card. The outer panel has no visible border. The left column is a photo, not the navy gradient with the green-dot "Your Abody account" eyebrow. Tabs are two separate pills, not a segmented control. Inputs are gray. The submit button has no arrow. There is no divider above "New to Abody?". |
| Home (`/`) | `index.html` | Service cards with broken images show a navy box with a broken-image icon. The category grid has 5 columns, so a 6th category wraps onto a row by itself. |
| Listings (`/products`, `/services`) | `products.html` | 3 cards per row, not 4. The listing card shows a description and an uppercase category, while the mockup's compact listing card has a category with an icon, the title, a delivery line with an icon, and the price. There's no "Showing 1–12" count beside the result total. |
| Detail (`/products/[slug]`, `/services/[slug]`) | `product.html` | Add to cart is a pill with a cart icon; the mockup is an 8px-radius button with a trailing arrow. Related items use the large home card instead of the compact listing card. |
| Cart | `cart.html` | Checkout and Apply are pills. Line items without an image show a gray placeholder icon instead of the tinted cover art. Broken service images in "You might also like". |
| Account | `account.html` | Header avatar as above. Empty states are plain text, not the mockup's icon, title, and text block. |
| Static pages (About, Contact, Terms, Privacy, Returns) | none (use the shared shell) | Breadcrumb, intro, and body sit in three near-invisible `bg-panel shadow-soft` cards left over from the old design. |
| 404 (customer) and admin 404 | none | The button is a pill, and there's no empty-state icon like the mockup's empty states. |
| Admin shell | `admin.html` | The sidebar is `overflow-hidden` at `h-dvh`, so at 900px tall the signed-in user block at the bottom is cut off. |
| Admin products (and admin services list) | `admin-products.html` | No cover thumbnail. The second line shows the slug instead of the Arabic name (or "No Arabic name yet · shows English"). No edit icon buttons on rows. |

Root causes: several design tokens were ported with old meanings (`surface`);
buttons are styled by hand in each component, many still `rounded-full`; and
some pages still use old-design wrappers (`rounded-panel bg-panel shadow-soft`).

## The fix

A visual-only pass that brings each page in line with its mockup, in English
and Arabic (RTL), with no change to stored data, routes, query parameters, or
server behavior. Agreed with the user on 2026-10-22:

- **Listing grid:** 4 cards per row on desktop (overrides the project plan's
  "three cards per row"; the plan line is updated in the last step).
- **Header:** follows the mockup. The top bar has Products, Services, language,
  Sign in/account, and cart. The second row lists the live store categories,
  then About and Contact. The logo links home.
- **Admin:** styling only. The mockup's revenue chart, activity feed, range
  switch, "needs attention" cards, admin search, notifications, and product
  status filters/search are **out of scope** and need their own build-plan
  items.

Must not break:

- Bilingual text through the dictionaries, with no hard-coded copy.
- RTL mirroring: logical properties, and `rtl:` flips on directional icons.
- `dir="auto"` on stored content.
- Phone width with no sideways scroll.
- Focus outlines and accessible names.
- `prefers-reduced-motion`.
- Every e2e selector that relies on roles and names.

Don't add a component library or a CSS framework. Don't add new
abstractions beyond shared class strings where a component already exports
them (such as `PRIMARY_PILL`).

## Build steps

- [x] **1. Tokens and buttons.**
  - In `app/globals.css`, set `--color-surface` to white to match the mockup
    `--surface`, and add `--color-surface-2` for the light gray.
  - Find every `bg-surface` use. Move gray bands, table heads, and wells to
    `bg-surface-2` or `bg-well`. Leave controls and cards on white.
  - Change filled and outline *action* buttons from `rounded-full` to
    `rounded-card` (8px), including `PRIMARY_PILL`, `CheckoutButton`,
    `AddToCartButton`, `SettingsForms`, the cart Apply button, the
    `StoreListing` button, both `error.tsx`, and both `not-found.tsx`.
  - Chips, the "View all" pill, segmented tabs, the cart badge, avatars, and
    step numbers stay round, as in the mockup.
  - Done when the auth inputs and tabs render white, gray bands (home Featured
    section, How it works, table heads) still render gray, no rectangular
    action button is pill-shaped, and `pnpm lint` and `pnpm build` pass.
- [x] **2. Header and account avatar.**
  - Restyle `SiteHeader` and `MainNav` to the mockup.
    - Top bar: logo, search, Products, Services, language, Sign in/account,
      cart.
    - Second row: one link per live category, then About and Contact.
  - Category links go to `/<lang>/products?category=<key>` for digital-product
    categories and `/<lang>/services?category=<key>` for service categories.
  - Reuse `lib/listing.ts` `summarizeCategories` over published products, with
    one query in the header, ordered as the listings order them.
  - Mark the current link with `aria-current` using the path and the
    `category` value. Keep the phone layout: the search drops to its own row,
    and the strip scrolls sideways.
  - A signed-in user's account link shows initials and first name.
    - Check whether that needs a session lookup. Today the header only checks
      the cookie.
    - If it does, read the user through the existing `lib/session` helper
      once per request, and fall back to the icon and "Account" when the
      lookup returns nothing.
  - Done when the strip lists the dev database's categories in English and
    Arabic, each link opens a filtered listing, the active category is
    underlined, and phone width has no sideways scroll.
- [x] **3. Auth, static pages, 404.**
  - `AuthShell` / `AuthPanel`:
    - Plain breadcrumb with no card.
    - One bordered panel.
    - Navy gradient art column with the green-dot eyebrow (new dictionary
      key in `en` and `ar`). Drop the photo, and delete
      `public/auth/shopping-online.jpg` only if nothing else references it.
    - Segmented-control tabs that stay links with `aria-current`.
    - White inputs.
    - Submit button with a trailing arrow that flips in RTL.
    - A divider above the switch link.
  - The forgot-password and reset-password pages pick these up through
    `AuthShell`.
  - `InfoPage`: plain breadcrumb, page title and intro, and body sections
    with no wrapping cards, at a readable width.
  - Customer and admin `not-found.tsx`: the mockup empty-state pattern (round
    icon well, title, text, 8px button).
  - Done when `/en/login`, `/ar/login`, `/en/register`, `/en/forgot-password`,
    `/en/about`, `/ar/terms`, and `/en/missing-page` match the mockup at 1440px
    and phone width.
- [x] **4. Listing card, listings, detail, cart, home.**
  - Add a compact `variant` to `ProductCard`, matching the mockup listing
    card: cover, category with icon, title, delivery line with icon, price.
    Use it on listings and on related items (detail page and cart
    suggestions).
  - Listing grid: 4 columns from 1060px, 2 columns from 600px, 1 column
    below. Add "Showing X–Y" beside the result count (new dictionary key in
    both languages; use the existing pagination values).
  - Home category grid: wrap without leaving a single orphan, as in the mockup
    (`auto-fill` columns).
  - When a product's image fails to load, fall back to the tinted cover art.
    Check how `ProductImage` and `ProductCover` render (next/image or plain
    img), and add the smallest client `onError` swap there.
  - Cart lines without an image show the tinted cover art.
  - Done when `/en/products` shows 4 cards per row at 1440px and 1 per row at
    390px, broken external images show cover art on the home page, the
    listings, and the cart, and the e2e test `desktop listing shows three
    roomy cards per row` is updated to prove 4 columns.
- [x] **5. Account and admin.**
  - Account empty states use the mockup's empty-state block.
  - Admin `SidebarShell`: the nav area scrolls (`overflow-y-auto`), so the
    user block stays reachable at 900px tall. Keep the collapsed state
    working.
  - Admin products and services lists:
    - 56px 16:10 cover thumbnail, using the same cover and image fallback.
    - Arabic name (`dir="auto"`) under the English name, or the existing
      "no Arabic" wording if a dictionary key exists. Otherwise add an
      English admin string.
    - An edit icon link per row with an accessible name.
  - Done when the admin dashboard, products, and services pages match the
    mockup's styling at 1440×900 with the sidebar user block visible.
- [x] **6. Plan, tests, verify.**
  - Update the project plan's Product Store line from three to four cards per
    row (approved), then re-run `/overview`.
  - Update unit tests that assert on changed markup.
  - Run `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm test:browser`.
  - Done when all four pass.

## Verify

- Side-by-side screenshots at 1440px and 390px, English and Arabic, of
  `prototypes/redesign/*.html` against home, a listing, a detail page, cart,
  login, register, account, admin dashboard, admin products, About, and a
  404. Differences should be limited to real content and the out-of-scope
  admin features above.
- Keyboard pass on the header strip, auth tabs, and listing cards: visible
  focus, logical order, and correct direction in RTL.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm test:browser` all pass.

## Build notes

- **Step 1, as built.** Almost every `bg-surface` use is meant to be gray
  (wells, table heads, bands, row hover). So the token stays light gray, and
  only the controls that should be white (auth inputs, the select trigger,
  auth tabs, art cards) moved to `bg-panel`. This matches the mockup with a
  much smaller diff than renaming the token.
- **Step 3, as built.** The mockup's sign-in art column uses the same photo,
  `public/auth/shopping-online.jpg`. It only looked plain navy during the
  comparison because the prototype server could not load files from
  `public/`. The photo stays, under the mockup's stronger navy gradient.
- The header strip's landmark is named "Store categories", so it doesn't
  share the listing filter's "Categories" name. The two e2e category clicks
  are scoped to the listing filter with `exact: true`, because Playwright
  matches accessible names as case-insensitive substrings by default.
- **Step 6, as built.** Verified 2026-10-22: `pnpm test` (1,381 passed),
  `pnpm lint` (clean), `pnpm build`, and `pnpm test:browser` (36 passed).
- Service covers without a working photo now use the same tinted sheet art
  as products, as in the mockup (it was a navy box with a chart icon).

## Notes for the AI

- Mockups: `prototypes/redesign/{index,products,product,cart,auth,account,admin,admin-products}.html`,
  `mockup.css`, `admin.css`, `theme.css`. `prototypes/` is git-ignored; never
  import from it.
- The mockups use Geist for English, and so does the app (`--font-geist` in
  `app/globals.css`). On 2026-10-22 the user chose Inter as the English
  fallback in place of Helvetica/Arial; it loads with `preload: false` in both
  root layouts. Make no other font changes.
- Prices keep the app's `formatPriceCents` format (`£49.00`). The mockups mix
  `£49` and `£49.00`.
- Dev evidence used a local test account, `design-check@example.test`,
  promoted to admin in the **dev** database only. Remove it when no longer
  needed.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":12830,"specSha256":"40fe8b58aaed8a57c0efbd64d4f028721f16d88877a4ec46dd46f9a6608b58ca","branch":"refs/heads/fix/redesign-visual-parity","head":"17ff960231e743b10b185ab17ba10af407dde0f3","baseRef":"refs/heads/main","baseCommit":"17ff960231e743b10b185ab17ba10af407dde0f3","sourceTree":"b682c3308ef7435f9a90551392df45d2489e186d","absentOptional":[]} -->
