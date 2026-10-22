# Feature: Admin Restyle

**From build-plan:** feature 31e
**Build attempt:** 1
**Branch:** feature/admin-restyle
**Status:** verified

## Goal

Restyle the admin area (`/admin/*`) to the marketplace look in
`prototypes/redesign/`, using the theme tokens 31a ported into
`app/globals.css`. The shell gets a navy sidebar with grouped navigation, a
white top bar, and a light gray work area. Pages get flat, bordered white panels,
the redesign table, square badges, and the redesign buttons and inputs. This is a
visual restyle. It changes no data, queries, routes, Server Actions, route
handlers, cookies, or `requireAdmin()` checks. The admin stays English-only.

## Design reference

- `prototypes/redesign/admin.css`: `.admin`, `.side` (brand, `h2`, links,
  `[aria-current]` inset bar, `.foot`), `.topbar`, `.content`, `.page-title`,
  `.seg`, the 900px breakpoint.
- `prototypes/redesign/admin.html`, inline `<style>`: `.kpis`, `.stat .ic`,
  `.cust`, the Recent orders table.
- `prototypes/redesign/admin-products.html`, inline `<style>`: `.prod`, `.feat`,
  `.confirm`, `.btn-danger`.
- `prototypes/redesign/mockup.css`: `.panel`, `.panel-head`, `.table`,
  `.table-wrap`, `.stat`, `.badge` and its tones, `.btn`, `.btn-primary`,
  `.btn-outline`, `.btn-sm`, `.input`, `.label`, `.link-arrow`, `.avatar`.
- Token mapping, as in 31d: `--accent*` is `primary*`, `--surface-2` is
  `surface`, `--surface-3` is `well`, `--radius` is `rounded-control`,
  `--radius-sm` is `rounded-[4px]`, and `--radius-lg` is `rounded-panel`.
- `prototypes/` is untracked reference only. The app never imports it.
- Mockup content that is **not** ported, because no data or behavior exists for
  it:
  - the top-bar search, the notifications bell, and the top-bar avatar
  - nav count pills
  - KPI deltas ("↑ 12% vs previous 14 days"), the dashboard range switch, the
    "needs attention" cards, the Daily revenue chart, and Recent activity
  - customer emails in the dashboard's Recent orders (the query returns only a
    label)
  - the products toolbar (status chips with counts, search), product
    thumbnails, Arabic names under product names, and per-row Edit / More
    buttons (the product name stays the link)
  - in-page breadcrumbs (the top bar already shows "Admin › page")
  - the success toast

## In scope

### Shell (`app/admin/layout.tsx`, `SidebarShell.tsx`, `SideNav.tsx`)

- **Navigation groups.** Regroup the admin links in `NAV_SECTIONS` as in the
  mockup, keeping every href, label, and icon:
  - **Overview:** Dashboard
  - **Sales:** Orders, Service orders, Customers, Coupons
  - **Catalog:** Products, Services
  - **Site:** Site content, Analytics, Settings
  - **Storefront** (external) stays last, unchanged.
  - `SidebarShell`'s `pages` prop becomes the flattened admin links, not
    `NAV_SECTIONS[0].links`, so the top-bar crumb still names every admin page.
- **Sidebar (`aside`).** `bg-ink text-ink-muted` with no end border, in the
  desktop column, the rail, and the phone drawer alike.
  - Brand: the `Logo-0.jpg` image on a white chip (`rounded-[4px] bg-panel px-1.5
    py-1`) and an "Admin" tag (`rounded-[4px] bg-ink-raised text-ink-muted
    text-xs`). The rail keeps the round mark only.
  - Section headings: `text-xs font-bold uppercase tracking-[.08em]
    text-ink-muted`, at full opacity (the mockup's 0.7 opacity fails contrast).
  - Links: `h-10 rounded-control text-sm font-medium`. Hover is
    `bg-ink-raised text-ink-text`. The current page is `bg-ink-raised
    text-ink-text` with a 3px `primary` bar on the start edge (keep the existing
    `before:` bar, recolored). External markers are `text-ink-muted`.
  - Focus on the navy: `focus-visible:outline-ink-text`, not `primary-strong`.
  - The rail's section dividers use `border-ink-line`. The rail tooltip keeps its
    light panel look.
  - Footer: a top rule in `border-ink-line`; the avatar is `bg-primary-strong`
    as today; the name is `text-ink-text` and the email is `text-ink-muted`. Sign out
    is `text-ink-muted` with `hover:bg-ink-raised hover:text-ink-text`.
- **Top bar.** Solid `bg-panel`, `h-16`, bottom border, no blur. The menu and
  collapse buttons, the crumb, and View store keep their behavior. The buttons
  stay `rounded-control` with a border.
- **Work area.** The admin `body` and `main` sit on `bg-surface`. `main` keeps
  its max width with `px-4 pt-6 pb-16`, then `min-[600px]:px-6`, and a
  `gap-5` grid.
- Unchanged: the collapse cookie, the rail at 960px and up, the drawer below
  960px (focus, Escape, overlay, close on link), and the neutral-wording rule
  for `SideNav` and `SidebarShell` (see Notes).

### Shared admin parts

- **`components/ui/table.tsx`** (used only by the admin): header cells are
  `bg-surface text-xs font-bold uppercase tracking-[.05em] text-muted` with a
  bottom border, `px-5 py-3`. Body cells are `px-5 py-3`. Rows have a bottom
  border (none on the last), hover `bg-surface`, and no top border.
- **Panels.** Every admin card or section box becomes `rounded-panel border
  border-border bg-panel`, with no shadow. A panel head is `flex items-center
  justify-between gap-3 border-b border-border px-5 py-4`, with an `h2` in
  `text-md font-semibold`. This covers the local `CARD` constants in the forms
  and the inline panel classes in pages.
- **Badges.** Admin status chips use the square badge (`h-5.5 rounded-[4px] px-2
  text-xs font-bold`):
  - order status: `StatusChip` with `badge` (from 31d)
  - service status: the `badge` variant of `ServiceStatusChip`, or
    `ServiceStatus.tsx` restyled to the same tones
  - `ProductStatusChip`: Published is `bg-success-soft text-success`, Unpublished
    is `bg-well text-muted`
  - `CouponStatusChip`: the same tone pattern, keeping its current wording
- **Buttons.**
  - Primary: `h-11 rounded-control bg-primary-strong px-5 font-semibold
    text-white hover:bg-primary-hover`.
  - Outline: `border-border-strong bg-panel hover:border-foreground`.
  - Small: `h-9 px-4 text-sm`.
  - Danger: `bg-danger text-white`.
  - Apply these to every admin `SUBMIT`, `PRIMARY`, `SECONDARY`, `DANGER`, and
    link-button class. The `disabled` and pending styles keep working.
- **Inputs.** Admin fields keep `INPUT_BASE` from `AuthForm` (shared with the
  storefront and not edited). The admin-local `INPUT` and `TEXTAREA` add
  `border-border-strong bg-panel`, so fields read white on white panels. Labels
  are `text-sm font-semibold`. Hints and error text keep their ids,
  `aria-describedby`, and `aria-invalid` wiring.
- **Links in tables and panel heads.** These use `font-semibold
  text-primary-strong hover:text-primary-hover` (the `.link-arrow` look, with
  the existing chevron icon where the mockup shows an arrow).

### Pages

- **Dashboard (`app/admin/page.tsx`).**
  - Page head: the `h1` in `text-2xl` and the muted lead. The date pill stays.
  - Stats: all six stats stay. Each is a flat white `.stat` panel (`p-5`, no
    gradient on the first one), with the icon in `text-faint` at the top end, no
    tinted icon box, and the value in `text-2xl font-bold tabular-nums`. The
    grid is 1 column, 2 from 640px, and 3 from 1100px. It keeps the valid
    `dt`/`dd` structure.
  - Recent orders: a panel with a panel head ("Recent orders", the "View all
    orders" link). Columns are Order, Customer, Items, Date, Status, Total
    (`text-end`). The customer avatar is the 24px `bg-ink text-ink-text` circle.
    The empty state stays.
- **Analytics (`app/admin/analytics/page.tsx`).** The 7 / 30 / 90-day range links
  become the `.seg` control: a `bg-well rounded-control p-0.75` group, with the
  current link `bg-panel shadow-soft text-foreground`. They stay links with
  `aria-current`. The stat panels and tables get the shared panel and table
  styles.
- **Lists:** `products`, `services`, `orders`, `service-orders`, `customers`, and
  `coupons`. Each gets the page head (h1, lead, and the primary "New …" button
  where one exists today), the panel, the table, badges, and the existing empty
  state inside the panel.
  - Products and services: the Featured cell shows the rank in a 24px round
    `bg-primary-soft text-primary-strong text-xs font-bold` badge, and keeps the
    `—` plus sr-only "Not featured". The products File cell becomes
    `badge-neutral` "Attached" or `badge-warning` "Missing".
- **Detail and form pages:** `products/new`, `products/[id]`, `services/new`,
  `services/[id]`, `coupons/new`, `coupons/[id]`, `orders/[id]`,
  `service-orders/[itemId]`, `customers/[id]`, `content`, and `settings`. These
  get the page heads, panels, badges, buttons, and inputs above, through
  `ProductForm`, `ProductFileUpload`, `ProductActions`, `StoreCardPreview`,
  `CouponForm`, `OrderStatusControl`, `OrderRefund`, `ServiceWorkForm`,
  `SiteContentForm`, and `SiteSettingsForm`. Classes only.
  - The inline delete confirmation in `ProductActions` and the refund
    confirmation in `OrderRefund` get the `.confirm` look: a bordered panel with
    an `h2`/`h3` in `text-lg`, muted body text, and end-aligned outline and
    danger buttons. Their state, focus moves, and wording are unchanged.

## Out of scope

- Any change to `lib/admin.ts` or other queries, `actions/*`, `app/api/*`,
  `requireAdmin()`, `lib/sidebar.ts`, cookies, or validation.
- Everything in the "not ported" list above.
- `app/admin/error.tsx`, `not-found.tsx`, and `[...rest]` (the 404 non-admins
  get).
- `INPUT_BASE`, `AccountParts` tones, and any storefront file. Use only the
  existing `badge` prop.
- Translating the admin.
- Changing the English font. The admin keeps the storefront's fonts.

## Build loop

`workflow.stepReview` is `feature`: build all steps, running each step's check as
you go, then present one review packet at the end. `checkpointCommits` is
`disabled`: no commits during implementation. `/complete` makes the feature
commit.

## Build steps

- [x] **1. Shell.**
  - Regroup `NAV_SECTIONS` and pass the flattened admin links as `pages`.
  - Restyle `SideNav`, `SidebarShell`, and the layout's sidebar content and
    body as in scope.
  - **Done when:**
    - Signed in as an admin at 1280px, `/admin` shows the navy sidebar with the
      Overview, Sales, Catalog, Site, and Storefront groups.
    - On `/admin/orders`, Orders is current with the start-edge bar, and the
      crumb reads "Admin › Orders".
    - The rail collapses and expands and is remembered after a reload, with
      tooltips on hover and focus.
    - At 390px the drawer opens, takes focus, and closes on Escape and on a
      link.
    - Sign out works.
    - `pnpm lint` passes.

- [x] **2. Shared parts and dashboard.**
  - Restyle `components/ui/table.tsx`, the four status chip components, and
    `app/admin/page.tsx`.
  - **Done when:**
    - `/admin` shows six flat stat panels, then the Recent orders panel with
      badges and ink avatars (or its empty state on an empty database).
    - Tables on the other list pages already pick up the new header and rows.
    - `pnpm lint` passes.

- [x] **3. Analytics and list pages.**
  - Restyle `analytics`, `products`, `services`, `orders`, `service-orders`,
    `customers`, and `coupons`.
  - **Done when:**
    - Each list shows its page head, panel, table, and badges.
    - The analytics range switch shows the current range and still changes it.
    - Empty states render inside the panel.
    - At 390px, tables scroll inside their panel with no page-wide sideways
      scroll.
    - `pnpm lint` passes.

- [x] **4. Detail and form pages.**
  - Restyle the pages and form components listed in scope.
  - **Done when:**
    - Creating and editing a product (including the file upload), a service,
      and a coupon still save, show field errors with focus as before, and
      disable while pending.
    - Deleting an unsold product shows the restyled confirmation, and Cancel
      returns focus.
    - An order's status change and the refund confirmation still work.
    - A service order's status and notes save.
    - Site content and settings save.
    - `pnpm lint` passes.

- [x] **5. Tests and final checks.**
  - In `e2e/admin.spec.ts`, add one desktop-only test as the seeded admin:
    - on `/admin/orders`, the "Admin navigation" nav contains a "Sales"
      heading, and its "Orders" link has `aria-current="page"`
    - on `/admin` and `/admin/products` at the phone project's width,
      `document.documentElement.scrollWidth` is not greater than
      `window.innerWidth` (run under the phone project, or set the viewport in
      the test)
  - Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`.
  - **Done when:** all four pass, including the existing admin, access,
    service, and checkout tests. Change those tests only where they assert
    removed markup, not behavior.

## Files / areas

- `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/analytics/page.tsx`
- `app/admin/{products,services,orders,service-orders,customers,coupons}/page.tsx`
- `app/admin/{products,services,coupons}/{new,[id]}/page.tsx`,
  `app/admin/orders/[id]/page.tsx`, `app/admin/service-orders/[itemId]/page.tsx`,
  `app/admin/customers/[id]/page.tsx`, `app/admin/content/page.tsx`,
  `app/admin/settings/page.tsx`
- `components/admin/*` (all 15 files; class changes only, plus the
  `NAV_SECTIONS` regroup in the layout)
- `components/ui/table.tsx`
- `e2e/admin.spec.ts`

## Data / contracts

None. No schema, query, action, route, cookie, or response shape changes.
`NAV_SECTIONS` keeps the same hrefs. Only its grouping and section labels
change.

## Testing

- No logic changes, so no new unit tests. `pnpm test` must stay green,
  including `app/admin/access.test.ts`.
- Browser: the step 5 additions to `e2e/admin.spec.ts`, plus the existing suite.
  Existing admin selectors (order number links, the "Save status" and "Save"
  buttons, the status radios, the "Internal notes" label, `role="status"`) must
  keep working, so keep those accessible names and roles.
- Visual checks during `/check` at 1280px and 390px in Chromium. Nothing here
  claims visual evidence before that runs.

## Notes for the AI

- **Neutral client code.** `SideNav.tsx` and `SidebarShell.tsx` ship with every
  response from the admin layout, including the 404 that non-admins get. Keep
  admin wording (section labels, page names) in the server layout's
  `NAV_SECTIONS` and pass it in as props. Never hard-code it in those files.
- Every admin page keeps its own `await requireAdmin()` first line. The layout is
  not an auth boundary.
- React text only for admin-entered and customer data: no
  `dangerouslySetInnerHTML`. Keep `dir="auto"` on names, categories, and other
  user text.
- Keep the valid `dl` markup on the dashboard stats: a group holds only `dt` and
  `dd`, with the icon inside the `dt` (fix "valid markup for dashboard stat
  cards").
- Keep the visible focus outlines everywhere. Use `outline-ink-text` on the
  navy sidebar.
- The admin is LTR only. Logical properties (`ms-`, `ps-`, `start-`) are still
  preferred, to match the codebase.
- Reuse the token classes already in `app/globals.css`. Add a token only if a
  value has no existing match, and do not change existing token values (the
  storefront uses them).

## Open questions

None blocking. "Overview" as the heading of the Dashboard group is a naming
choice, because the mockup shows Dashboard with no heading. It is easy to
rename at review.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":15441,"specSha256":"4d355a39df32b88e92501371f008cfe057ba6dd850d40ac850ceb19b5f7d9652","branch":"refs/heads/feature/admin-restyle","head":"30317beaccfb8a3145277485aa77e59f66854de6","baseRef":"refs/heads/main","baseCommit":"30317beaccfb8a3145277485aa77e59f66854de6","sourceTree":"da50743909b600a9d27ede4b397b8207e4a6deaa","absentOptional":[]} -->
