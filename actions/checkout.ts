"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordEvent } from "@/lib/analytics";
import { buildCartView, CART_COOKIE, parseCart } from "@/lib/cart";
import { checkCartCoupon } from "@/lib/cart-coupon";
import { listPublishedProductsByIds } from "@/lib/catalog";
import {
  checkoutCustomer,
  checkoutDiscountMetadata,
  checkoutLineItems,
  checkoutReturnUrls,
  stripeCheckoutLocale,
} from "@/lib/checkout";
import { type AppliedCoupon, COUPON_COOKIE } from "@/lib/coupons";
import { isLocale } from "@/lib/i18n/config";
import { clientKey } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/turnstile";

export type CheckoutActionError =
  | "invalid_input"
  | "empty_cart"
  | "coupon_invalid"
  | "bot_check_failed"
  | "unexpected";

// Success never returns: the action redirects to Stripe.
export type CheckoutActionResult =
  | { success: false; error: CheckoutActionError }
  | null;

export async function startCheckout(
  _previous: CheckoutActionResult,
  formData: FormData,
): Promise<CheckoutActionResult> {
  const locale = formData.get("lang");
  if (typeof locale !== "string" || !isLocale(locale)) {
    return { success: false, error: "invalid_input" };
  }

  let url: string | null;
  try {
    const client = clientKey(await headers());
    if ((await verifyTurnstile(formData.get(TURNSTILE_FIELD), client)) === "failed") {
      return { success: false, error: "bot_check_failed" };
    }

    // The cookie is untrusted: lines, names, and prices come from the current
    // published products, exactly as the cart page shows them.
    const store = await cookies();
    const entries = parseCart(store.get(CART_COOKIE)?.value);
    const products = await listPublishedProductsByIds(
      entries.map((entry) => entry.productId),
      locale,
    );
    const view = buildCartView(entries, products);
    if (view.lines.length === 0) return { success: false, error: "empty_cart" };

    // A saved discount code must still apply to this exact cart; otherwise the
    // customer would pay a total the cart page did not show.
    const savedCode = store.get(COUPON_COOKIE)?.value;
    let discount: AppliedCoupon | null = null;
    if (savedCode) {
      const { evaluation } = await checkCartCoupon(savedCode, view);
      if (!evaluation.ok) return { success: false, error: "coupon_invalid" };
      discount = evaluation;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: checkoutLineItems(view, discount ?? undefined),
      ...checkoutReturnUrls(locale),
      locale: stripeCheckoutLocale(locale),
      metadata: { locale, ...checkoutDiscountMetadata(discount) },
      ...checkoutCustomer(await getCurrentUser()),
    });
    url = session.url;
  } catch (error) {
    console.error("startCheckout failed", error);
    return { success: false, error: "unexpected" };
  }

  if (!url) {
    console.error("startCheckout failed: the session has no url");
    return { success: false, error: "unexpected" };
  }
  // recordEvent never throws, so a lost count cannot block the redirect.
  await recordEvent("CHECKOUT_STARTED");
  // Outside the try block, so the redirect is not caught as an error.
  redirect(url);
}
