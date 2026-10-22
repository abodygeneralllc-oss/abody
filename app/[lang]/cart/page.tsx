import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponForm, type SavedCoupon } from "@/components/cart/CouponForm";
import { ArrowIcon, CartIcon, ChevronIcon } from "@/components/icons";
import { PaymentCards } from "@/components/layout/PaymentCards";
import {
  buildCartView,
  CART_COOKIE,
  CART_HEADING_ID,
  parseCart,
} from "@/lib/cart";
import { ProductCard } from "@/components/catalog/ProductCard";
import { checkCartCoupon } from "@/lib/cart-coupon";
import { listCartSuggestions, listPublishedProductsByIds } from "@/lib/catalog";
import { COUPON_COOKIE } from "@/lib/coupons";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatItemCount } from "@/lib/i18n/plural";

const CONTAINER = "mx-auto w-full max-w-site px-4 min-[700px]:px-8";
const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

export async function generateMetadata(): Promise<Metadata> {
  const { cart } = await getDictionary();
  // Each visitor's cart is personal, so it stays out of search results.
  return { title: cart.title, robots: { index: false, follow: true } };
}

export default async function CartPage({
  searchParams,
}: PageProps<"/[lang]/cart">) {
  const locale = await getLocale();
  const {
    cart: text,
    header: headerText,
    product: productText,
    footer: footerText,
  } = await getDictionary();
  const cookieStore = await cookies();
  const entries = parseCart(cookieStore.get(CART_COOKIE)?.value);
  const products = await listPublishedProductsByIds(
    entries.map((entry) => entry.productId),
    locale,
  );
  const view = buildCartView(entries, products);
  const isEmpty = view.lines.length === 0;
  // The saved code is checked against this exact cart on every render.
  const savedCode = cookieStore.get(COUPON_COOKIE)?.value;
  const cartCoupon =
    savedCode && !isEmpty ? await checkCartCoupon(savedCode, view) : null;
  const applied = cartCoupon?.evaluation.ok ? cartCoupon.evaluation : null;
  const savedCoupon: SavedCoupon = cartCoupon
    ? cartCoupon.evaluation.ok
      ? { code: cartCoupon.code, ok: true }
      : { code: cartCoupon.code, ok: false, reason: cartCoupon.evaluation.reason }
    : null;
  // Suggestions only sit beside a cart that has something in it.
  const suggestions = isEmpty
    ? []
    : await listCartSuggestions(
        view.lines.map((line) => line.product.id),
        locale,
      );
  const itemCountLabel = formatItemCount(locale, view.itemCount, text.itemCount);
  // Stripe's cancel_url; any other value is ignored.
  const cancelled = !isEmpty && (await searchParams).checkout === "cancelled";

  return (
    <main className="flex-1 font-sans">
      <div className={`${CONTAINER} grid gap-5 pt-6 pb-16`}>
        <nav aria-label={text.breadcrumb}>
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <li>
              <Link
                href={localizedPath(locale, "/")}
                className={`rounded-control hover:text-primary-strong ${FOCUS}`}
              >
                {text.home}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
            </li>
            <li aria-current="page" className="text-foreground">
              {headerText.cart}
            </li>
          </ol>
        </nav>

        {cancelled && (
          <p
            role="status"
            className="rounded-card bg-primary-soft px-4 py-3 text-sm text-primary-strong"
          >
            {text.checkoutCancelled}
          </p>
        )}

        {view.removedCount > 0 && (
          <p className="rounded-card bg-warning-soft px-4 py-3 text-sm text-warning">
            {text.itemsRemoved}
          </p>
        )}

        {/* Both states share one tree shape so the heading element survives the
            last removal and keeps the focus RemoveFromCartButton gives it. */}
        <div
          className={
            isEmpty
              ? undefined
              : "grid items-start gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_380px] min-[960px]:gap-10"
          }
        >
          <section
            aria-labelledby={CART_HEADING_ID}
            className={
              isEmpty
                ? "grid justify-items-center gap-3 rounded-panel border border-border px-5 py-16 text-center"
                : "min-w-0"
            }
          >
            <div className={isEmpty ? "contents" : "mb-6 grid gap-2"}>
              {isEmpty && (
                <span className="mb-1 grid size-14 place-items-center rounded-full bg-well text-muted">
                  <CartIcon className="h-6 w-6" />
                </span>
              )}
              <h1
                id={CART_HEADING_ID}
                tabIndex={-1}
                className={`font-bold tracking-tight outline-none rtl:tracking-normal ${
                  isEmpty ? "text-lg" : "text-3xl"
                }`}
              >
                {isEmpty ? text.emptyTitle : text.title}
              </h1>
              {!isEmpty && <p className="text-muted">{itemCountLabel}</p>}
            </div>
            {isEmpty ? (
              <>
                <p className="mb-2 max-w-[44ch] text-muted">{text.emptyBody}</p>
                <Link
                  href={localizedPath(locale, "/products")}
                  className={`inline-flex h-11 items-center rounded-full bg-primary-strong px-6 font-semibold text-white hover:bg-primary-hover ${FOCUS}`}
                >
                  {text.browseStore}
                </Link>
              </>
            ) : (
              <ul className="border-t border-border">
                {view.lines.map((line) => (
                  <CartLineItem
                    key={line.product.id}
                    line={line}
                    locale={locale}
                    text={{
                      ...text,
                      typeLabel: productText.typeLabels[line.product.type],
                    }}
                  />
                ))}
              </ul>
            )}
          </section>
          {!isEmpty && (
            <div className="grid gap-4 min-[960px]:sticky min-[960px]:top-6">
              <CartSummary
                subtotalCents={view.subtotalCents}
                totalCents={applied ? applied.totalCents : view.totalCents}
                discount={
                  applied ? { code: applied.code, cents: applied.discountCents } : null
                }
                itemCountLabel={itemCountLabel}
                locale={locale}
                coupon={
                  <CouponForm
                    saved={savedCoupon}
                    text={{
                      ...text.coupon,
                      appliedNote: applied
                        ? text.coupon.appliedNote(applied.percentOff)
                        : null,
                    }}
                  />
                }
                paymentCards={<PaymentCards label={footerText.acceptedCards} />}
                text={{
                  ...text,
                  discount: text.coupon.discount,
                  errors: text.checkoutErrors,
                }}
              />
              <p className="text-center text-sm">
                <Link
                  href={localizedPath(locale, "/products")}
                  className={`inline-flex items-center gap-1 rounded-control font-bold text-primary-strong hover:text-primary-hover ${FOCUS}`}
                >
                  {text.continueShopping}
                  <ArrowIcon className="h-4 w-4 rtl:-scale-x-100" />
                </Link>
              </p>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <section aria-labelledby="more-heading" className="pt-8">
            <h2 id="more-heading" className="mb-5 text-xl font-bold">
              {productText.related}
            </h2>
            <ul className="grid gap-5 min-[600px]:grid-cols-2 min-[960px]:grid-cols-4">
              {suggestions.map((item, index) => (
                <li key={item.id}>
                  <ProductCard
                    product={item}
                    locale={locale}
                    index={index}
                    text={productText}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
