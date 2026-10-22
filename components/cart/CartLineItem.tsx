import Link from "next/link";
import {
  CartQuantityForm,
  type CartQuantityText,
} from "@/components/cart/CartQuantityForm";
import {
  RemoveFromCartButton,
  type RemoveFromCartText,
} from "@/components/cart/RemoveFromCartButton";
import { ProductImage } from "@/components/catalog/ProductImage";
import { BoltIcon, ClockIcon } from "@/components/icons";
import type { CartLine } from "@/lib/cart";
import { formatDurationDays, productPath } from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { formatPriceCents } from "@/lib/money";

export interface CartLineText extends CartQuantityText, RemoveFromCartText {
  quantity: string;
  instantDownload: string;
  onboardingAfterPayment: string;
  typeLabel: string;
}

interface CartLineItemProps {
  line: CartLine;
  locale: Locale;
  text: CartLineText;
}

const FACT = "inline-flex items-center gap-1";

export function CartLineItem({ line, locale, text }: CartLineItemProps) {
  const { product, quantity, lineTotalCents } = line;
  const isService = product.type === ProductType.SERVICE;
  const durationDays =
    isService && product.durationDays && product.durationDays > 0
      ? product.durationDays
      : null;
  // Client components get only plain text: the cart dictionary also holds
  // functions, which cannot cross to the client.
  const quantityText: CartQuantityText = {
    decrease: text.decrease,
    increase: text.increase,
    errors: text.errors,
  };
  const removeText: RemoveFromCartText = { remove: text.remove, errors: text.errors };

  return (
    <li className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-border py-5 min-[600px]:grid-cols-[120px_minmax(0,1fr)_auto] min-[600px]:gap-x-5">
      <div className="self-start overflow-hidden rounded-card">
        <ProductImage image={product.image} alt="" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.06em] text-primary-strong uppercase rtl:tracking-normal">
          {text.typeLabel}
        </p>
        <h2 className="mt-1 text-base leading-snug font-bold tracking-normal">
          <Link
            href={localizedPath(locale, productPath(product))}
            dir="auto"
            className="rounded-control break-words outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary-strong"
          >
            {product.name}
          </Link>
        </h2>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span dir="auto">{product.categoryLabel}</span>
          {isService ? (
            <>
              {durationDays && (
                <span className={FACT}>
                  <ClockIcon className="h-4 w-4" />
                  {formatDurationDays(durationDays, locale)}
                </span>
              )}
              <span>{text.onboardingAfterPayment}</span>
            </>
          ) : (
            <span className={FACT}>
              <BoltIcon className="h-4 w-4" />
              {text.instantDownload}
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {isService ? (
            <p className="text-sm text-muted">
              {text.quantity}: {quantity}
            </p>
          ) : (
            <CartQuantityForm
              productId={product.id}
              productName={product.name}
              quantity={quantity}
              text={quantityText}
            />
          )}
          <RemoveFromCartButton
            productId={product.id}
            productName={product.name}
            text={removeText}
          />
        </div>
      </div>

      {/* Below 600px the price moves under the details in the same column. */}
      <p className="col-start-2 text-md font-bold tabular-nums min-[600px]:col-start-3 min-[600px]:row-start-1 min-[600px]:text-end">
        {formatPriceCents(lineTotalCents)}
      </p>
    </li>
  );
}
