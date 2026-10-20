# Fix: Use Inter for English text

**Type:** Fix
**Status:** verified
**Branch:** fix/use-inter-for-english-text

## The problem

Feature 31a set the English font stack to `"Macan", "Helvetica Neue",
Helvetica, Arial, sans-serif` (`app/globals.css:80-83`). Macan has no license
and ships no files, so every visitor sees Helvetica or Arial. PPLX Sans was
considered and dropped: there is no license for it, and its local file has been
removed. The user chose Inter, which is openly licensed (SIL OFL) and served by
`next/font/google`. Macan is also written into
`blueprint/project-plan.md:564` and `blueprint/context/project-overview.md:110,297`,
so later 31 work would follow the wrong font.

## The fix

- Load Inter with `next/font/google` in both root layouts
  (`app/[lang]/layout.tsx`, `app/admin/layout.tsx`): `subsets: ["latin"]`,
  `variable: "--font-inter"`. It is a variable font, so no weight list is
  needed. Both layouts already load Tajawal this way, and they share
  `app/globals.css`.
- English stack: `var(--font-inter), var(--font-tajawal), "Helvetica Neue",
  Helvetica, Arial, sans-serif`. Remove `"Macan"` and its comment. Inter has no
  Arabic letters, so Tajawal second keeps Arabic text inside English pages (for
  example customer names in admin tables) in Tajawal, as before 31a.
- Arabic is unchanged: Tajawal first, with the existing `[lang="ar"]` and
  `:lang(ar)` rules.
- Plans: change the font sentence in `project-plan.md:564` and the two passages
  in `project-overview.md` to Inter (with Helvetica/Arial fallback, Arabic
  stays Tajawal). Then recompute the overview's `blueprint:source-hash` using
  `/overview`'s checkbox-normalized contract. Do not touch the archived 31a
  spec or the checked 31a line in `build-plan.md`; those are history.
- Out of scope: emails (`lib/email-layout.ts` keeps its own email-safe stack),
  the payment badge SVG text, and the prototypes.

Must not break: Arabic rendering and RTL, `pnpm build` (Google fonts are
fetched at build time), and existing tests.

## Build steps

- [x] 1. **Load Inter.** Add the `Inter` loader and its variable to both
  layouts, and update the `globals.css` English stack and comment.
  Done when: `pnpm build` and `pnpm lint` pass; the built CSS has an Inter
  `@font-face` and `--font-body` starts with the Inter variable for English;
  the Arabic rule still puts Tajawal first.

- [x] 2. **Update the plans.** Edit the project-plan and overview font
  wording, then recompute the overview hash.
  Done when: `Macan` no longer appears in `project-plan.md` or
  `project-overview.md`, and the hash matches the plan bytes.

## Verify

- `pnpm build`, `pnpm lint`, `pnpm test`, and `pnpm test:browser` pass.
- With `pnpm dev`, check that `/en` headings and body render in Inter (the
  DevTools "Rendered Fonts" panel names it) and `/ar` still renders in Tajawal.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":2862,"specSha256":"f3fcd53a23022f9966c1cdfde135c90e11264a44e1da3dab6ddbc07107d9b6d7","branch":"refs/heads/fix/use-inter-for-english-text","head":"a15cc39969e9eb95275b2f4161df30a67ef7485e","baseRef":"refs/heads/main","baseCommit":"a15cc39969e9eb95275b2f4161df30a67ef7485e","sourceTree":"9800cf586903c110e7c4d0597052b56da132da10","absentOptional":[]} -->
