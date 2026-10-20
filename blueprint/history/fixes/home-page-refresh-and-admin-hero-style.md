# Fix: Home page refresh and admin hero style

**Type:** Fix
**Status:** verified
**Branch:** fix/home-page-refresh-and-admin-hero-style

## The problem

The home page from 31b no longer matches the approved redesign in
`prototypes/redesign/index.html`, and the hero background is fixed to navy.

| Area | Today | Wanted |
| --- | --- | --- |
| English font | Inter (`app/[lang]/layout.tsx`, `app/admin/layout.tsx`) | Geist Sans; Arabic stays Tajawal |
| Featured tabs | 3 cards per tab (`FEATURED_LIMIT = 3` in `lib/home.ts`, 3-column grid) | 4 cards, 4 columns at desktop, 2 at tablet, 1 on phones |
| Product card | Frameless, regular-weight title that underlines on hover (`components/catalog/ProductCard.tsx`) | Framed card from the prototype (details below) |
| "View all" | Bold text link that underlines on hover (`SectionHead` in `app/[lang]/page.tsx`) | Outlined pill with an arrow bubble that fills and nudges on hover |
| Link hover | `hover:underline` in 11 storefront files | Colour change instead of underline; every link keeps the pointer cursor |
| How it works | Numbered columns with a top rule | Centred head with eyebrow and intro; four step cards with an icon tile, number badge, dashed connectors (desktop), and a footer tag |
| Hero | Always navy | Admin picks Light, Photo, or Navy on Site content; Photo picks one of three bundled photos |

## The fix

### Font

- Load Geist with `next/font/google` in both layouts in place of Inter and point
  the existing font token in `app/globals.css` at it. Tajawal and the Arabic
  switch are unchanged.

### Product card (shared)

`ProductCard` is used by the home page, listings, related products, and the
admin store preview, so all of them change together:

- White card, 1px border, large radius, inner padding; on hover it lifts 3px,
  the border turns light blue, and the shadow appears (no movement under
  `prefers-reduced-motion`). The whole card stays one stretched link with the
  same focus outline.
- Cover keeps `ProductCover` (real image, or the tinted placeholder). The
  placeholder becomes the prototype's two stacked sheets, and the back sheet fans
  out on hover. The sheet tilts the other way in Arabic.
- Body: uppercase category eyebrow (no letter-spacing in Arabic), semibold
  title clamped to 2 lines that turns blue on hover, `shortDescription` clamped
  to 2 lines, then a footer with the price on one side and a pill on the other
  (green "Instant download" for products, blue "Starts after onboarding" for
  services, using the existing dictionary text).
- Inside the navy services band the card has no border, as in the prototype.

### Home sections

- `FEATURED_LIMIT` back to 4 and the panel grid to `min-[600px]:grid-cols-2
  min-[1060px]:grid-cols-4`; update the `lib/home.test.ts` cases that assume 3.
- `SectionHead` link becomes the "View all" pill.
- Replace `hover:underline` with a colour change in the 11 files that use it
  (footer, account parts, card, coupon form, cart line, contact page, auth panel
  and form, home, related products, listing).
- How it works: new `home.howItWorksEyebrow`, `home.howItWorksIntro`, and a
  `tag` on each `home.steps` item in both dictionaries. The icons are search,
  lock, download, and chart, and the last step's icon tile is filled blue. The
  `ol` keeps numbering for assistive tech, so badges and icons stay
  `aria-hidden`.

### Hero style setting

- **Schema:** add `enum HeroStyle { NAVY LIGHT PHOTO }` and
  `enum HeroPhoto { BROWSING TEAM LAPTOP }` and two columns on `SiteContent`:
  `heroStyle HeroStyle @default(NAVY)` and `heroPhoto HeroPhoto @default(BROWSING)`.
  New migration via `pnpm db:migrate`. Existing rows and a missing row resolve
  to Navy, so nothing changes until an admin saves.
- **Rules (`lib/site-content-rules.ts`):** the form values, parser, and
  `resolveHomeContent` carry `heroStyle` and `heroPhoto`. A value outside the
  enum is rejected as a field error (the radios make that a tampered request
  only). `resolveHomeContent` returns `hero.style` and `hero.photo`, with Navy
  and Browsing as defaults. Add `site-content-rules.test.ts` cases for the
  defaults, a valid save, and a rejected value. `lib/site-content.ts` selects
  the two new columns.
- **Admin (`SiteContentForm`, Hero section):** a "Background" radio group with
  three labelled options (Navy, Light, Photo), and a "Photo" radio group with
  the three thumbnails and short names. The photo choice is saved whatever the
  style; it is used only when the style is Photo. The action
  (`actions/admin-site-content.ts`) saves both columns with the rest. The
  existing admin role check and its error handling stay as they are.
- **Photos:** copy `prototypes/redesign/img/hero-{browsing,team,laptop}.jpg` to
  `public/home/`, with their Unsplash IDs noted beside the map that names them
  (Unsplash License). They are decorative (`alt=""`), rendered with
  `next/image` `fill`, `priority`, and `sizes="100vw"`, plus a per-photo
  `object-position`.
- **Home hero (`app/[lang]/page.tsx`):**
  - *Navy*: today's hero.
  - *Light*: brand-tinted gradient with a faint dot grid fading out, dark text,
    bordered search with a soft shadow, outlined white chips, trust icons in
    blue, and a top border on the next section.
  - *Photo*: the chosen photo under a navy fade from the text side (mirrored in
    Arabic) so the white text keeps AA contrast; chips get a translucent navy
    fill.
  - All three: the admin eyebrow renders as a small pill above the title, and
    the hero product card sits on the end side as today. A small floating note
    names the first service, with its category, when one exists. The
    prototype's "Ready to download, Order #1042" toast is left out: it shows a
    made-up order.

### Must not break

- Featured tab order rules (best sellers by units sold, newest first, templates
  match), the empty states, and tab keyboard behaviour.
- Admin-edited hero and CTA text, section switches, and the announcement bar.
- RTL layout and Tajawal on `/ar`. The admin stays English-only.
- The listing pages and admin store preview still render cards (they inherit the
  new design; their layout is otherwise unchanged).
- `getSiteContent` still never throws for the store, and `readSiteContent`
  still throws for the admin editors.

## Build steps

1. [x] **Geist font** - swap Inter for Geist in both layouts and the theme token.
   Done when: `/en` and `/admin` render English in Geist (computed font family),
   `/ar` still renders Tajawal, and `pnpm build` passes.
2. [x] **Card, featured four, View all, link hovers** - new `ProductCard`,
   `FEATURED_LIMIT = 4` with the 4-column grid and updated `lib/home.test.ts`,
   the "View all" pill, and no hover underlines in the 11 files.
   Done when: `pnpm test` passes. On `/en` at 1440px each featured tab shows up
   to four framed cards in one row. Hovering a card lifts it and turns the title
   blue without an underline. "View all" shows the pill hover. A listing page
   shows the same cards.
3. [x] **How it works** - dictionary keys (en and ar) and the step-card section.
   Done when: `/en` and `/ar` show the centred head and four step cards with
   connectors at desktop, and two then one column at tablet and phone widths.
4. [x] **Hero style setting** - schema and migration, rules with tests, select,
   action, admin radios, bundled photos, and the three hero styles.
   Done when: `pnpm test` passes with the new site content cases and `prisma
   migrate status` is clean. Saving Light, Photo (each photo), and Navy on
   `/admin/content` changes the `/en` and `/ar` hero to match, and a fresh
   database shows Navy.

## Verify

- `pnpm test`, `pnpm lint`, and `pnpm build` pass; `pnpm exec prisma migrate
  status` reports the database in sync.
- `pnpm dev`, then on `/en` and `/ar` at 1440px, 900px, and 390px:
  - Featured tabs show up to four cards. Card hover lifts the card with no
    underline, and the tab switching and keyboard arrows still work.
  - "View all" pill, How it works cards, and footer links change colour on hover
    rather than underlining.
- `/admin/content`: pick each Background option (and each photo under Photo),
  save, and reload `/en` and `/ar`. The hero matches the choice. The white text
  on Photo stays readable, and the fade sits behind the text in both directions.
- `pnpm test:browser` home specs still pass.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":8399,"specSha256":"65b71a1de0ce46a00326d6f64db09f519f705bdc5e021f870e1ead7d2aec2823","branch":"refs/heads/fix/home-page-refresh-and-admin-hero-style","head":"d194a8d07fe0015c9ae88e0141c012a8bd1e5b55","baseRef":"refs/heads/main","baseCommit":"6b3f154cddf4cd06de00a084c550d1fa92e3e506","sourceTree":"1e3feca8968c211dcad3ba44951e0d0dd4710ed1","absentOptional":[]} -->

## Independent review

**Status:** passed
**Target commit:** d194a8d07fe0015c9ae88e0141c012a8bd1e5b55
**Base commit:** 6b3f154cddf4cd06de00a084c550d1fa92e3e506
**Base ref:** main
**Spec hash:** 65b71a1de0ce46a00326d6f64db09f519f705bdc5e021f870e1ead7d2aec2823
**Prepared by:** claude
**Builder model:** claude-opus-5-5
**Requested reviewer:** claude
**Requested model:** claude-opus-5-5
**Requested execution:** automatic
**Requested at:** 2026-10-20T23:17:34+04:00
**Workflow:** regular
**Check required:** no
**Reviewer adapter:** claude
**Reviewer model:** claude-opus-5-5
**Reviewer context:** fresh subagent
**Actual execution:** automatic
**Reviewed at:** 2026-10-20T23:31:03+04:00
**Scope:** current
**Lenses:** quality, security, performance, tests
**Verdict:** passed
**Check result:** not-required

### Handoff

Review the active spec and the complete `6b3f154cddf4cd06de00a084c550d1fa92e3e506..d194a8d07fe0015c9ae88e0141c012a8bd1e5b55` delta in a fresh
session or isolated subagent without the builder conversation. Run all Audit lenses from scratch.
Run Check when required above. Do not edit product code, accept findings, or
reuse the existing findings as the review scope.

### Commands

- `git rev-parse HEAD`, `git merge-base main HEAD`, `git status --porcelain --untracked-files=all`, `sha256sum blueprint/context/current-feature.md`: pass (HEAD, merge base, and spec hash match the request; only `blueprint/context/review.md` differed; spec is tracked, so no snapshot applies)
- `pnpm test`: pass (78 files, 1378 tests)
- `pnpm lint`: pass (no output)
- `pnpm build`: pass (compiled and type-checked; route table printed)
- `pnpm test:browser`: unavailable (not run by reviewer instruction; writes to the database)
- `pnpm exec prisma migrate status`: unavailable (not run; needs the database)

### Evidence

- Reviewed all 30 changed paths in the delta (diff of 6b3f154..d194a8d), plus `actions/admin-site-content.ts`, the full `app/[lang]/page.tsx` and `components/admin/SiteContentForm.tsx`, `app/globals.css` tokens, and `e2e/home.spec.ts` for selector assumptions.
- Security: `saveSiteContent` still calls `requireAdmin()` before parsing; `parseSiteContentForm` accepts only listed `HeroStyle`/`HeroPhoto` values (`enumValue`) and returns `invalid_choice` otherwise; no new public input, secret, or data exposure.
- Data: migration adds both enums and NOT NULL columns with NAVY/BROWSING defaults matching `prisma/schema.prisma`; `resolveHomeContent` and `siteContentFormValues` default a missing row to Navy/Browsing; `getSiteContent`/`readSiteContent` behaviour unchanged.
- Spec match: Geist in both layouts and `--font-body`; `FEATURED_LIMIT = 4` with `min-[600px]:grid-cols-2 min-[1060px]:grid-cols-4`; no `hover:underline` remains under `app/` or `components/`; How it works keys and tags in both dictionaries with `aria-hidden` badges/icons inside the `ol`; three hero styles, photo fade mirrored with `rtl:bg-linear-to-l`, decorative `alt=""` photos with Unsplash IDs beside `HERO_PHOTOS`; made-up order toast left out.
- Tests: new `site-content-rules.test.ts` cases cover defaults, a valid save, a rejected value, and a missing value; the action test asserts both columns reach the upsert; `lib/home.test.ts` updated to four.
- Performance: hero photos are 1920x1280 progressive JPEGs served through `next/image` with `sizes="100vw"`; only the selected photo renders, and only for Photo style.

### Findings

- F-49 [P3] open - New Photo hero uses the deprecated `priority` image prop (spec-directed and matching two existing uses)
- No P0 or P1 findings. Existing ledger entries were not used as scope; the delta touches `components/cart/CouponForm.tsx` (F-35) and `components/auth/AuthForm.tsx` (F-13) only in link class strings, which leaves those findings unchanged.

### Remaining risk

- `pnpm test:browser` not run: the home specs (hero chips, featured tabs) were checked by reading `e2e/home.spec.ts` only; the hero product card and note follow the chips in DOM order, so the first hero link is still a chip.
- `pnpm exec prisma migrate status` not run: migration sync with the dev database is unverified by this reviewer.
- Visual and contrast behaviour (card hover, Light and Photo heroes at 1440/900/390px, AA contrast of muted text over the Photo fade near the column edge, RTL mirroring) was reviewed from code only; Check was not required and not run.
- `lib/site-content.ts` builds its select with an `as Record<...>` cast and has no test, so dropping `heroStyle`/`heroPhoto` from the select would not fail a check (the admin form would then show Navy and a re-save would overwrite the saved choice). Same pre-existing pattern as the other site content fields.
