# Feature: Theme, Type, and Site Shell

**From build-plan:** feature 31a
**Build attempt:** 1
**Status:** verified
**Branch:** feature/theme-type-and-site-shell

## Goal

Start the Marketplace Redesign (31) by porting the redesign tokens and type into
the app and restyling the customer site shell: a flat white canvas, smaller
radii, navy ink, Macan (English, with Helvetica/Arial fallback) and Tajawal
(Arabic), a new header with a store search, a new footer, and no Stripe mentions
in customer-facing text. Visual and copy change only: no data, route, or
behavior change beyond the new header search form, which reuses the existing
`/products?q=` listing search.

## Design reference

- `prototypes/redesign/theme.css` - the token source (durable output of the
  prototype; this feature ports it).
- `prototypes/redesign/index.html` lines 85-113 (announcement, header, category
  strip) and 285-302 (footer); styles in `prototypes/redesign/mockup.css`
  lines 1-31 (base), 89-110 (announce, header, strip), 160-169 (footer).
- `prototypes/` is untracked and ignored; the app never imports from it. Copy
  values, not files.

## In scope

- **Tokens** (`app/globals.css` `@theme`): replace the current values with the
  redesign values, keeping existing Tailwind token names so every page picks up
  the new look without renaming classes across the app. Mapping:

  | Existing / new key | Theme source | Value |
  | --- | --- | --- |
  | `--color-background`, `--color-canvas`, `--color-panel` | `--bg`, `--surface` | `#ffffff` (flat white canvas) |
  | `--color-surface` | `--surface-2` | `oklch(97.6% 0.004 248)` |
  | new `--color-well` | `--surface-3` | `oklch(95.2% 0.006 248)` |
  | `--color-border` | `--border` | `oklch(91.5% 0.006 248)` |
  | new `--color-border-strong` | `--border-strong` | `oklch(83% 0.01 248)` |
  | `--color-foreground` | `--text` | `oklch(21% 0.015 255)` |
  | `--color-muted` / `--color-faint` | `--muted` / `--faint` | `oklch(43% 0.014 255)` / `oklch(56% 0.012 255)` |
  | `--color-ink`, `--color-ink-raised` | `--ink`, `--ink-raised` | `oklch(22% 0.05 256)`, `oklch(29% 0.065 256)` |
  | new `--color-ink-line` | `--ink-line` | `oklch(36% 0.06 256)` |
  | `--color-ink-text`, `--color-ink-muted` | same | `oklch(97% 0.008 248)`, `oklch(80% 0.025 248)` |
  | `--color-primary`, `--color-primary-strong` | `--accent`, `--accent-strong` | unchanged |
  | new `--color-primary-hover` | `--accent-hover` | `oklch(43% 0.13 248)` |
  | `--color-primary-soft` | `--accent-soft` | `oklch(95.5% 0.025 248)` |
  | status `success/warning/danger` (+ `-soft`) | status block | theme values |
  | `--color-tint-1..4`, new `--color-tint-5` | `--tint-1..5` | theme values |
  | `--radius-control` / `--radius-card` / `--radius-panel` | `--radius-sm` / `--radius` / `--radius-lg` | `4px` / `8px` / `12px` (pills use Tailwind's `rounded-full`) |
  | `--shadow-raised`, new `--shadow-float` | `--shadow-hover`, `--shadow-float` | theme values |
  | `--shadow-soft` | - | kept as is; later 31 items drop it per page |
  | `--container-site` | `--container` | `1280px` |
  | `--text-xs`..`--text-4xl`, new `--text-md` | type scale | 12/14/16/18/20/24/32/40/56 px in rem; line-height 1.55 for `xs`-`lg` (incl. `md`), 1.15 for `xl`-`4xl` |

- **Type**: English body stack `"Macan", "Helvetica Neue", Helvetica, Arial,
  sans-serif`; Arabic `var(--font-tajawal), "Helvetica Neue", Arial,
  sans-serif`; mono `ui-monospace, "SFMono-Regular", Consolas, monospace`.
  Body line-height 1.55. English `h1`-`h4` get `letter-spacing: -0.02em`
  (base layer); the existing unlayered Arabic rule resets letter-spacing to 0
  and line-height to 1.35, and now also covers `h4`. The `[lang="ar"]` rule
  for Arabic text in English pages keeps Tajawal first.
- **Fonts loading**: drop `Geist` and `Geist_Mono` from `app/[lang]/layout.tsx`
  and `app/admin/layout.tsx` (no longer referenced); keep `Tajawal` via
  `next/font/google` in both. No Macan font files are added (see Notes).
- **Announcement bar**: navy ink background (`bg-ink text-ink-text`), link
  bold and underlined, as in the prototype. Same data and rendering rules.
- **Header** (`components/layout/SiteHeader.tsx`, `MainNav.tsx`): full-width
  white bar with a bottom border, content inside a 1280px container with 32px
  gutters (16px below 700px), not sticky.
  - Top row: logo (`/Logo-0.jpg`, 30px tall), header search, then language
    switcher, Sign in / Account link, and cart link with a pill count badge.
  - Header search: a `role="search"` GET form to `localizedPath(locale,
    "/products")` with one `type="search"` input `name="q"`, `dir="auto"`,
    `maxLength={SEARCH_MAX_LENGTH}`, a visible placeholder, an accessible
    label, and a dark square submit button with the search icon and an
    accessible name. 44px tall, 8px radius, `border-strong` border, max width
    560px. From 900px up it sits inline in the top row; below 900px it moves to
    its own full-width row under the logo row so phones keep it.
  - Second row (strip): the existing nav items (Home, Products, Services,
    About, Contact) as a horizontally scrollable strip; current page shown with
    foreground text and a 3px primary underline (`aria-current="page"` kept).
  - Remove the light-blue trust strip from the header (not in the prototype).
    The `header.trust` dictionary keys stay: order emails still use them.
- **Footer** (`components/layout/SiteFooter.tsx`): flat, top border, the
  1280px container; columns `1.4fr repeat(3,1fr)` from 800px, two columns
  below with the brand block spanning both; headings `text-base` bold; links
  muted `text-sm`, underline on hover. Shop column gains a Cart link. Bottom
  row: rights text, secure-payment line, and `PaymentCards`, `faint` text.
  Logo 28px tall. Contact email behavior unchanged.
- **Stripe wording** in customer text (EN and AR dictionaries, 4 strings each):
  - About, How it works: "You pay securely by card at checkout. ..." (rest
    unchanged).
  - Terms, Orders and payment: "... Payment is taken at our secure checkout,
    and your order is confirmed once the payment is confirmed."
  - Privacy, Payments: "Payments are handled by our secure payment provider.
    Abody never receives or stores your card details."
  - Returns, If a refund is approved: "The full order amount is refunded to
    your original payment method."
  - Matching Arabic sentences in `ar.ts` with the same meaning.

## Out of scope

- Home page, listings, detail pages, cart, account, and admin page restyles
  (31b-31e). Their pages inherit the new tokens now and may look transitional.
- The prototype's category links in the header strip (needs category data per
  locale; the strip keeps the existing nav items).
- A combined products-and-services search page; services search stays on
  `/services`.
- Shipping Macan font files or `@font-face` rules.
- Admin chrome changes beyond the font import cleanup and the shared tokens.
- Stripe wording in admin screens, code comments, env docs, and server logic.
- Sticky header (would collide with the cart's sticky summary; revisit in 31d).

## Build loop

`workflow.stepReview` is `feature` and `workflow.checkpointCommits` is
`disabled`: build all steps, run the checks after each step, then present one
review packet for the whole feature. No step commits; `/complete` makes the
feature commit.

## Build steps

- [x] 1. **Tokens and type.** Port the token mapping above into
  `app/globals.css` (update its header comment to name
  `prototypes/redesign/theme.css`), set the font stacks, body line-height,
  heading tracking, and Arabic heading reset; remove Geist and Geist Mono from
  both root layouts' imports and `className`.
  Done when: `pnpm build` and `pnpm lint` pass; `/en` and `/ar` render on a
  white canvas with the new radii; English computed `font-family` starts with
  `Macan` and resolves to Helvetica/Arial when Macan is not installed; Arabic
  pages and the `Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©` switcher text use Tajawal; `/admin` still renders.

- [x] 2. **Announcement bar and header.** Restyle `AnnouncementBar`, rebuild
  `SiteHeader` (top row, header search, strip) and restyle `MainNav` for the
  strip; add `header.search` text in `en.ts` and `ar.ts`
  (`{ label, placeholder, submit }`; EN label "Search digital products",
  placeholder "Search templates and guides", submit "Find products" - not "Search", which the listing test requires to be absent; AR equivalents),
  typed through the existing dictionary type.
  Done when: submitting "guide" in the header on `/en/about` lands on
  `/en/products?q=guide` with matching results, and on `/ar` lands on
  `/ar/products?q=...`; the header search's accessible name differs from the
  listing search's ("Search products"); keyboard focus is visible on every
  header control; at 360px wide there is no sideways page scroll, the search is
  on its own row, and the strip scrolls; RTL mirrors; `pnpm build`, `pnpm lint`
  pass.

- [x] 3. **Footer.** Restyle `SiteFooter` per the prototype and add the Cart
  link to the Shop column.
  Done when: the footer shows four columns from 800px and two below with no
  sideways scroll at 360px, in EN and AR; the contact email line still appears
  only when saved; `pnpm build`, `pnpm lint` pass.

- [x] 4. **Remove Stripe from customer text and guard it.** Replace the 4 EN
  and 4 AR strings above. Add a unit test that walks the `en` and `ar`
  dictionaries' string leaves (function values are skipped) and fails if any
  contains `stripe` case-insensitively. Add a browser test in
  `e2e/storefront.spec.ts` for the header search submit to
  `/en/products?q=...`.
  Done when: `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm test:browser`
  pass; `/en/about`, `/en/terms`, `/en/privacy`, `/en/returns` and the `/ar`
  equivalents contain no "Stripe".

## Files / areas

- `app/globals.css`
- `app/[lang]/layout.tsx`, `app/admin/layout.tsx` (font imports only)
- `components/layout/AnnouncementBar.tsx`, `SiteHeader.tsx`, `MainNav.tsx`,
  `SiteFooter.tsx` (and `PaymentCards.tsx` only if its styling needs the new
  tokens)
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts` (+ the
  dictionary type if it is declared separately)
- `lib/listing.ts` (import `SEARCH_MAX_LENGTH` only)
- New unit test next to the dictionaries (e.g.
  `lib/i18n/dictionaries/no-stripe.test.ts`); `e2e/storefront.spec.ts`

## Data / contracts

- No schema, route, API, or persisted-data change.
- Header search: `GET /<lang>/products?q=<text>`; the listing already parses,
  trims, and length-limits `q` (`parseSearchParam`) and renders it as React
  text. An empty submit lands on the unfiltered listing.
- Dictionary: new `header.search: { label: string; placeholder: string;
  submit: string }` in both locales; `header.trust` kept for
  `lib/email-layout.ts`.

## Testing

- Unit (`pnpm test`): Stripe-free dictionary guard; existing
  `lib/email-layout.test.ts` must keep passing (trust keys unchanged).
- Browser (`pnpm test:browser`): header search submit on `/en`; existing
  `storefront.spec.ts` searchbox lookup by "Search products" must stay
  unambiguous.
- `pnpm build` (type-check) and `pnpm lint` after every step.
- Manual visual check in EN and AR at 360px and desktop widths; no visual
  regression tooling exists, so no screenshot evidence is claimed.

## Notes for the AI

- Read `node_modules/next/dist/docs/` for `next/font` before editing the
  layouts (Next.js 16).
- Keep existing token names; adding a few new ones is fine. Do not rename
  classes across pages in this feature.
- Use logical properties and Tailwind `ms-/me-/ps-/pe-/start-/end-` utilities
  so RTL mirrors; no `left`/`right`.
- Keep the app's focus pattern (`outline-2 outline-primary-strong`) rather than
  the prototype's box-shadow ring.
- Header search input `id` must not be `listing-search` (listing pages render
  both). Give it a unique id and its own `<label className="sr-only">`.
- Macan needs a webfont license before its files ship (project overview), so
  the stack names it first and falls back to Helvetica/Arial; visitors without
  Macan installed see Helvetica or Arial. This is intended.
- The build-plan and overview edits that introduced feature 31 are currently
  uncommitted on `main`; they travel with the working tree onto the branch.

## Open questions

None blocking. Defaults chosen (reversible, say if you want otherwise):

- Header search targets `/products` only; services keep their own listing
  search.
- Header is not sticky (avoids overlapping the cart's sticky summary).
- The header trust strip is removed to match the prototype.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":12638,"specSha256":"5153537cc71365a5572f53b8a53ef0e7896578912f31cc1b89595a3a8c40c592","branch":"refs/heads/feature/theme-type-and-site-shell","head":"a30665736760ef427d8424e45c6d7addfb90e5df","baseRef":"refs/heads/main","baseCommit":"a30665736760ef427d8424e45c6d7addfb90e5df","sourceTree":"59c507a49c582194065cba27f5e24349b980a53a","absentOptional":[]} -->
