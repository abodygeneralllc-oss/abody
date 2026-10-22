# Feature: Bot Protection

**From build-plan:** feature 32
**Build attempt:** 1
**Branch:** feature/bot-protection
**Status:** verified

## Goal

Stop scripted bots from creating customer accounts and opening Stripe checkout
pages. The live store gets many fake accounts with random-letter names that
the per-IP registration limit (5/hour) does not stop, because the bots rotate
IP addresses. Add a Cloudflare Turnstile check that the server verifies before
it creates an account or opens a Stripe checkout session.

## In scope

- A Turnstile widget on `/<lang>/register` (register mode of the auth form
  only) and in the cart summary above the checkout button.
- Server-side verification of the Turnstile token in `register` and
  `startCheckout`, before the account is created or the Stripe session is
  opened.
- A new error, `bot_check_failed`, for both actions, with English and Arabic
  text. Register keeps the typed name and email, as its other errors do. The
  passwords are cleared, also as today.
- The widget resets after every failed submit, so the next try gets a fresh
  token (tokens work once).
- On/off by environment: the check runs only when both `TURNSTILE_SITE_KEY`
  and `TURNSTILE_SECRET_KEY` are set. With neither set (local development,
  browser tests) the forms work as today. In production, missing or partial
  keys log one error per request naming the missing variable (never a value),
  and the forms keep working (approved Option A).
- `.env.example`, the README deploy notes, and the Playwright app env updated.

## Out of scope

- Sign-in, forgot password, coupon entry, and other forms.
- Removing or flagging the existing bot accounts.
- Email verification.
- Privacy page text about Cloudflare (legal copy is already a draft for Abody to
  review; flagged in the handoff).
- A rate limit on starting checkout.
- Any new npm dependency. The widget is a small client component that loads
  Cloudflare's script.

## Build loop

`workflow.stepReview` is `feature`: build all steps, run the checks after each
step, then present one review packet at the end. `workflow.checkpointCommits`
is `disabled`: no commits between steps. `/complete` creates the feature
commit.

## Build steps

- [x] **1. Server verifier.** Add `lib/turnstile.ts` (`server-only`):
  - `turnstileConfig()` reads and trims `TURNSTILE_SITE_KEY` and
    `TURNSTILE_SECRET_KEY`. Both set returns `{ siteKey, secretKey }`. Neither
    set returns `null`. Only one set returns `null` and logs an error naming
    the missing variable.
  - `turnstileSiteKey()` returns the site key, or `null` when the check is off.
    Pages use it to decide whether to render the widget.
  - `verifyTurnstile(token, client)` returns `"ok" | "failed" | "off"`:
    - Config `null` returns `"off"`. In production it also logs
      `Turnstile is off: keys are not set`.
    - A missing, non-string, empty, or over-2048-character token returns
      `"failed"` without a network call.
    - Otherwise it POSTs form data (`secret`, `response`, plus `remoteip` when
      `client` is not `"unknown"`) to
      `https://challenges.cloudflare.com/turnstile/v0/siteverify` with a
      5-second `AbortSignal.timeout`. `success === true` returns `"ok"`.
      Anything else returns `"failed"`: `success: false`, a non-2xx status,
      bad JSON, a network error, or a timeout. Log the Cloudflare
      `error-codes` or the error name only, never the token or secret.
  - **Done when:** `lib/turnstile.test.ts` covers off, partial config, empty
    token, success, a Cloudflare failure, a non-2xx status, a network error,
    and the `remoteip` rule (mocked `fetch`), and `pnpm test` passes.

- [x] **2. Widget and register.**
  - Add `components/security/TurnstileWidget.tsx` (client). Load
    `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`
    once. Render explicitly into a div with `sitekey`, `language` (`en` or
    `ar`), and `response-field-name` `cf-turnstile-response`, so the token is
    posted with the form. Expose a `resetKey` prop: when it changes, call
    `turnstile.reset(widgetId)`. Remove the widget on unmount. Before writing
    the script loading, read the `next/script` guide in
    `node_modules/next/dist/docs/` (AGENTS.md rule).
  - `app/[lang]/register/page.tsx` passes `turnstileSiteKey()` through
    `AuthPanel` to `AuthForm`. `AuthForm` renders the widget above the submit
    button in register mode, only when a site key is given. It passes the
    action `state` object as `resetKey`.
  - `actions/auth.ts` `register`: after field validation succeeds and before
    `reserveRateLimit`, call `verifyTurnstile(formData.get("cf-turnstile-response"),
    clientKey(await headers()))`. `"failed"` returns
    `{ success: false, error: "bot_check_failed", values: { name, email } }`
    without touching the limiter or the database. `"ok"` and `"off"` continue.
    The check runs before the limiter so bot attempts don't use up a shared
    IP's registration allowance.
  - Add `bot_check_failed` to `AuthActionError` and to `auth.errors` in
    `en.ts` and `ar.ts`:
    - EN: "We couldn't confirm you're not a bot. Please try again."
    - AR: "تعذّر التحقق من أنك لست روبوتًا. يُرجى المحاولة مرة أخرى."
    
    The type also covers sign-in, which never returns this error.
  - **Done when:** `actions/auth.test.ts` (with `@/lib/turnstile` mocked)
    proves a failed check returns `bot_check_failed` with the typed values and
    never calls the limiter or `db.user.create`, and that `"ok"` and `"off"`
    register as before. `pnpm test`, `pnpm lint`, and `pnpm build` pass.

- [x] **3. Checkout.**
  - `app/[lang]/cart/page.tsx` passes `turnstileSiteKey()` through
    `CartSummary` to `CheckoutButton`. `CheckoutButton` renders the widget
    inside its form, above the button, only when a site key is given, and
    resets it with `state` as `resetKey`.
  - `actions/checkout.ts` `startCheckout`: after the language check and before
    reading the cart, call `verifyTurnstile`. `"failed"` returns
    `{ success: false, error: "bot_check_failed" }`, with no Stripe call and
    no `CHECKOUT_STARTED` event.
  - Add `bot_check_failed` to `CheckoutActionError` and to
    `cart.checkoutErrors` in `en.ts` and `ar.ts` (same text as register).
  - **Done when:** `actions/checkout.test.ts` proves a failed check returns
    `bot_check_failed` before any Stripe session or event, and the existing
    cases still pass with the check `"ok"`. `pnpm test`, `pnpm lint`, and
    `pnpm build` pass.

- [x] **4. Configuration and docs.**
  - `.env.example`: a Turnstile section with both keys. Live: from Cloudflare
    → Turnstile, a widget for `abody.net`. Local: leave unset.
  - `playwright.config.ts` `APP_ENV`: set both keys to `""`. Process env wins
    over `.env`, so browser tests stay off even when a developer's `.env` has
    keys.
  - README Deploy on Vercel section: add both keys to the env list.
  - **Done when:** the files read correctly, and `pnpm test`, `pnpm lint`, and
    `pnpm build` pass. If time allows, `pnpm test:browser` passes unchanged
    (the check is off there).

- [x] **5. Wait for the token (repairs F-50).** `TurnstileWidget` gets an
  `onTokenChange(ready: boolean)` prop wired to Turnstile's `callback` (true),
  `expired-callback`, `error-callback`, and `timeout-callback` (false), and is
  called with false on every reset. `CheckoutButton` and `AuthForm` (register)
  keep the submit disabled until a token is ready, only when the widget is
  shown. If Cloudflare's script fails to load, the submit is enabled again so
  the server's fail-closed check answers with `bot_check_failed` instead of
  leaving a dead button.
  - **Done when:** with no keys, both buttons behave exactly as before; the
    code path keeps them disabled until the widget reports a token; and
    `pnpm test`, `pnpm lint`, and `pnpm build` pass.

## Files / areas

- New: `lib/turnstile.ts`, `lib/turnstile.test.ts`,
  `components/security/TurnstileWidget.tsx`
- `actions/auth.ts`, `actions/auth.test.ts`
- `actions/checkout.ts`, `actions/checkout.test.ts`
- `app/[lang]/register/page.tsx`, `components/auth/AuthPanel.tsx`,
  `components/auth/AuthForm.tsx`
- `app/[lang]/cart/page.tsx`, `components/cart/CartSummary.tsx`,
  `components/cart/CheckoutButton.tsx`
- `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/ar.ts`
- `.env.example`, `playwright.config.ts`, `README.md`

## Data / contracts

- No database change.
- Environment variables: `TURNSTILE_SITE_KEY` (public, rendered into the
  page) and `TURNSTILE_SECRET_KEY` (server only, never logged or sent to the
  client). They are read at request time, not `NEXT_PUBLIC_`, so changing them
  on Vercel needs no code change. A redeploy picks them up.
- Form field: `cf-turnstile-response` (string, at most 2048 characters),
  treated as untrusted input.
- Siteverify: `POST application/x-www-form-urlencoded` with `secret`,
  `response`, optional `remoteip`. Only `success` (boolean) and `error-codes`
  (string array, for logs) are read.
- New action error codes: `AuthActionError` and `CheckoutActionError` each
  gain `"bot_check_failed"`.

## Testing

- Vitest unit tests for `lib/turnstile.ts` with mocked `fetch` and env
  (step 1).
- Action tests for register and checkout with `@/lib/turnstile` mocked
  (steps 2 and 3).
- `pnpm lint` and `pnpm build` after each step.
- Browser tests stay keyless (check off), so they prove the off path keeps
  today's flows. No live Cloudflare call runs in any automated test.
- Live evidence needs real keys. Cloudflare's always-pass test keys (site key
  `1x00000000000000000000AA`, secret key
  `1x0000000000000000000000000000000AA`) can be put in a local `.env` for a
  manual `/check`.

## Notes for the AI

- A verification error (network, timeout, Cloudflare outage) fails closed: the
  visitor sees `bot_check_failed` and can retry. Only missing configuration
  fails open (Option A).
- No CSP exists (24c), so the Cloudflare script and iframe need no header
  change. `X-Frame-Options: DENY` only stops other sites framing ours, so it
  doesn't affect Cloudflare's iframe.
- The widget's `language` must follow the page locale. Turnstile handles its
  own RTL layout.
- Keep the alert and focus behavior in `AuthForm`: a `bot_check_failed` error
  has no field, so focus moves to the alert, as for `rate_limited`.
- Do not log tokens, secrets, IPs, or emails.
- Never import `lib/turnstile.ts` into a client component; pass only the site
  key string down as a prop.


<!-- blueprint:completion {"schemaVersion":1,"specBytes":10576,"specSha256":"12d7deec811914644fb265dc3b2691d5ff1c0f983d279817eb8f7a359010eea1","branch":"refs/heads/feature/bot-protection","head":"0ff179fe8dfb9044a861425bde6d527ca0a3c7e6","baseRef":"refs/heads/main","baseCommit":"5298a7fd7526e4c558f8eef7c87b67b51227a108","sourceTree":"5eccba9d92ae825f3c4693cead8e876fc40f234c","absentOptional":[]} -->

## Independent review

**Status:** passed
**Target commit:** 0ff179fe8dfb9044a861425bde6d527ca0a3c7e6
**Base commit:** 5298a7fd7526e4c558f8eef7c87b67b51227a108
**Base ref:** main
**Spec hash:** 12d7deec811914644fb265dc3b2691d5ff1c0f983d279817eb8f7a359010eea1
**Prepared by:** claude
**Builder model:** claude-opus-5-5
**Requested reviewer:** claude
**Requested model:** claude-opus-5-5
**Requested execution:** automatic
**Requested at:** 2026-10-22T19:08:50Z
**Workflow:** regular
**Check required:** no
**Reviewer adapter:** claude
**Reviewer model:** claude-opus-5-5
**Reviewer context:** fresh subagent
**Actual execution:** automatic
**Reviewed at:** 2026-10-22T19:24:00Z
**Scope:** current
**Lenses:** quality, security, performance, tests
**Verdict:** passed
**Check result:** not-required

## Handoff

Review the active spec and the complete `5298a7fd7526e4c558f8eef7c87b67b51227a108..0ff179fe8dfb9044a861425bde6d527ca0a3c7e6` delta in a fresh
session or isolated subagent without the builder conversation. Run all Audit lenses from scratch.
Run Check when required above. Do not edit product code, accept findings, or
reuse the existing findings as the review scope.

## Commands

- `git rev-parse HEAD`: pass (equals Target commit)
- `git merge-base main HEAD`: pass (equals Base commit)
- SHA-256 of `blueprint/context/current-feature.md` raw bytes: pass (equals Spec hash)
- `git status --short --untracked-files=all`: pass (only `blueprint/context/review.md` differed before the review; unchanged after build)
- `pnpm test`: pass (79 files, 1404 tests)
- `pnpm lint`: pass
- `pnpm build`: pass (includes type-check)

## Evidence

- Full delta reviewed (23 files): `lib/turnstile.ts`, `lib/turnstile.test.ts`, `components/security/TurnstileWidget.tsx`, `actions/auth.ts`, `actions/auth.test.ts`, `actions/checkout.ts`, `actions/checkout.test.ts`, register and cart pages, `AuthPanel`, `AuthForm`, `CartSummary`, `CheckoutButton`, `en.ts`/`ar.ts`, `.env.example`, `README.md`, and the Blueprint plan/spec/overview docs.
- Security: `lib/turnstile.ts` imports `server-only`; only the site key string crosses to client components. The secret and token are never logged (tests assert this). Token is untrusted input: non-string, empty, or over 2048 chars fails without a network call. Verification errors fail closed; only missing config fails open (approved Option A). `remoteip` is omitted for the `unknown` client.
- Register runs the check after field validation and before `reserveRateLimit`/`db.user.create`; checkout runs it after the language check and before the cart, Stripe session, and `CHECKOUT_STARTED` event. These are the only `db.user.create` and `checkout.sessions.create` call sites in app code.
- `playwright.config.ts` already sets both Turnstile keys to `""` at Base, so browser tests stay keyless.
- F-50 re-reviewed: readiness callbacks, reset-to-false, submit gating (`CheckoutButton.tsx:29`, `AuthForm.tsx:78`), and script-load-failure re-enable all hold; no-key behavior unchanged. `next/script` re-fires `onError` on remount from its cached rejected promise (checked in `node_modules/next/dist/client/script.js`).
- Performance: one Cloudflare call per register/checkout submit with a 5-second timeout; no repeated or unbounded work.
- Tests: off, partial config, invalid tokens (missing, empty, File, too long), success with body/URL/method/signal, remoteip rule, Cloudflare rejection, non-2xx, bad JSON, timeout; register and checkout failed/ok/off paths with the limiter, DB, Stripe, and event asserted untouched on failure.

## Findings

- F-50 closed (repair verified)
- F-51 [P3] unverified (new lead, non-blocking)

## Remaining risk

- `pnpm test:browser` not run (per review instructions); it exercises only the keyless path anyway.
- No live Cloudflare widget or real-key run: token readiness, reset, Arabic `language`, and the F-51 persistent-error path are verified by code reading only. The client widget has no automated test.
- Back-forward cache: returning from Stripe with the browser Back button may restore a page holding an already-used token marked ready; the first resubmit would show `bot_check_failed` and then reset. Unverified.
- With partial keys, a register or checkout request logs two errors (the missing variable, then "keys are not set" in production), not exactly one as the spec's scope line says; harmless to behavior.

## Findings

### 32/F-50 [P3] closed - Checkout and register can be submitted before the Turnstile widget has a token, so a quick real customer gets "We couldn't confirm you're not a bot"

**File:** components/cart/CheckoutButton.tsx:40
**Found:** 2026-10-22 by /audit independent (scope: current; lens: quality)
**Why it matters:** With keys set, `TurnstileWidget` renders the challenge after Cloudflare's script loads, and the hidden `cf-turnstile-response` field stays empty until the challenge finishes (usually a second or two, longer if Cloudflare asks for an interactive click). Neither form waits for it: the Checkout button (and the register submit at `components/auth/AuthForm.tsx:236`) is only disabled while `pending`. A customer who opens the cart and presses Checkout straight away posts an empty token, `verifyTurnstile` returns `"failed"` without calling Cloudflare (`lib/turnstile.ts:81`), and they see the bot error. The widget then resets and they have to wait and retry. The same happens right after a failed submit, because the reset clears the token again. Register is less exposed because typing four fields takes longer than the challenge. Nothing is let through, so the bot protection itself is correct; this is a false rejection of real buyers on the checkout path. The spec does not ask for submit gating, and this was found by reading the code path, not in a browser with real keys.
**Suggested fix:** User decision. Smallest option: give `TurnstileWidget` an `onTokenChange` prop wired to Turnstile's `callback`, `expired-callback`, and `error-callback` render options, and have `CheckoutButton` and `AuthForm` keep the submit disabled (or show a short "Checking your browser…" note) until a token is present. Alternatively, accept the current behavior and note it in the spec. Requirement lost: None.
**Resolution:** Fixed 2026-10-22 in feature 32 step 5: `TurnstileWidget` reports token readiness through `onTokenChange` (callback, expired, error, timeout, and reset), and `CheckoutButton` and register `AuthForm` keep the submit disabled until a token is ready. If Cloudflare's script fails to load, the submit is re-enabled so the server answers. Awaiting `/audit` re-review to close.
Closed 2026-10-22 by /audit independent (scope: current; all lenses) against 0ff179f: `components/security/TurnstileWidget.tsx` wires `callback` to `onTokenChange(true)` and `expired-callback`, `error-callback`, `timeout-callback` to false, and calls false after every `resetKey` reset (`TurnstileWidget.tsx:87-92`); `CheckoutButton.tsx:29` and `AuthForm.tsx:78` (register only) add `waiting` to the submit's `disabled`, so an empty-token submit is no longer reachable while the widget is shown; `next/script` `onError` (`TurnstileWidget.tsx:96`) re-enables the submit when the script fails, and `next/script` re-fires `onError` on remount from its cached rejected promise. With no site key, `waiting` is false and both buttons are unchanged. The residual persistent-widget-error path is tracked separately as F-51.
