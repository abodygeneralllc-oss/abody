import type { ReactNode } from "react";
import {
  CheckoutButton,
  type CheckoutButtonText,
} from "@/components/cart/CheckoutButton";
import type { Locale } from "@/lib/i18n/config";
import { formatPriceCents } from "@/lib/money";

interface CartSummaryProps {
  subtotalCents: number;
  totalCents: number;
  // Only when a discount code applies.
  discount: { code: string; cents: number } | null;
  // Already pluralized, for example "3 items".
  itemCountLabel: string;
  locale: Locale;
  // The discount code field, above the totals.
  coupon: ReactNode;
  // The accepted card marks, under the secure note.
  paymentCards: ReactNode;
  text: {
    summary: string;
    subtotal: string;
    total: string;
    discount: string;
    secureNote: string;
  } & CheckoutButtonText;
}

export function CartSummary({
  subtotalCents,
  totalCents,
  discount,
  itemCountLabel,
  locale,
  coupon,
  paymentCards,
  text,
}: CartSummaryProps) {
  return (
    <section
      aria-labelledby="cart-summary-heading"
      className="grid gap-4 rounded-panel border border-border bg-panel p-5"
    >
      <h2 id="cart-summary-heading" className="text-lg font-bold tracking-normal">
        {text.summary}
      </h2>
      {coupon}
      <dl className="grid gap-2 text-sm tabular-nums">
        <div className="flex justify-between gap-3">
          <dt>
            {text.subtotal} ({itemCountLabel})
          </dt>
          <dd>{formatPriceCents(subtotalCents)}</dd>
        </div>
        {discount && (
          <div className="flex justify-between gap-3 text-success">
            <dt>
              {text.discount} (
              <span dir="ltr" className="font-mono">
                {discount.code}
              </span>
              )
            </dt>
            <dd dir="ltr">−{formatPriceCents(discount.cents)}</dd>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-border pt-4 font-bold">
          <dt className="text-base">{text.total}</dt>
          <dd className="text-2xl tracking-tight">{formatPriceCents(totalCents)}</dd>
        </div>
      </dl>
      {/* Only plain strings cross to the client component. */}
      <CheckoutButton
        locale={locale}
        text={{ checkout: text.checkout, redirecting: text.redirecting, errors: text.errors }}
      />
      <p className="text-center text-xs text-muted">{text.secureNote}</p>
      <div className="flex justify-center">{paymentCards}</div>
    </section>
  );
}
