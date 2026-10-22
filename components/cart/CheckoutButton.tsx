"use client";

import { useActionState, useState } from "react";
import { startCheckout, type CheckoutActionError } from "@/actions/checkout";
import { LockIcon } from "@/components/icons";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import type { Locale } from "@/lib/i18n/config";

export interface CheckoutButtonText {
  checkout: string;
  redirecting: string;
  errors: Record<Exclude<CheckoutActionError, "invalid_input">, string>;
}

interface CheckoutButtonProps {
  locale: Locale;
  text: CheckoutButtonText;
  // null when the bot check is off.
  turnstileSiteKey: string | null;
}

const ERROR_ID = "checkout-error";

export function CheckoutButton({ locale, text, turnstileSiteKey }: CheckoutButtonProps) {
  const [state, action, pending] = useActionState(startCheckout, null);
  const [tokenReady, setTokenReady] = useState(false);
  const [checkUnavailable, setCheckUnavailable] = useState(false);
  // An empty token always fails, so wait for the bot check (finding F-50).
  const waiting = Boolean(turnstileSiteKey) && !tokenReady && !checkUnavailable;
  // The language is the only other input, so a rejected one is unexpected.
  const error =
    !pending && state?.success === false
      ? text.errors[state.error === "invalid_input" ? "unexpected" : state.error]
      : null;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="lang" value={locale} />
      {turnstileSiteKey && (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          locale={locale}
          resetKey={state}
          onTokenChange={setTokenReady}
          onUnavailable={() => setCheckUnavailable(true)}
        />
      )}
      <button
        type="submit"
        disabled={pending || waiting}
        aria-describedby={error ? ERROR_ID : undefined}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-card bg-primary-strong px-6 text-md font-semibold text-white outline-offset-2 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong disabled:cursor-wait disabled:opacity-60"
      >
        {!pending && <LockIcon className="h-5 w-5" />}
        {pending ? text.redirecting : text.checkout}
      </button>
      <p
        id={ERROR_ID}
        role="alert"
        className="-mt-1 text-center text-sm text-danger empty:hidden"
      >
        {error}
      </p>
    </form>
  );
}
