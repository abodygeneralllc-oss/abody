import Link from "next/link";
import { ProductCover } from "@/components/catalog/ProductCover";
import {
  BoltIcon,
  ClockIcon,
  DownloadIcon,
  UsersIcon,
} from "@/components/icons";
import { productPath, type PublicProduct } from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { formatPriceCents } from "@/lib/money";

export interface ProductCardText {
  instantDownload: string;
  startsAfterOnboarding: string;
}

interface ProductCardProps {
  product: PublicProduct;
  locale: Locale;
  index: number;
  text: ProductCardText;
  headingLevel?: "h2" | "h3";
  // False for admin previews: unpublished items have no public page to open.
  linked?: boolean;
}

// Shared store card. Callers load the products; the card only renders one.
// Stored content carries dir="auto" because Arabic fields fall back to English.
export function ProductCard({
  product,
  locale,
  index,
  text,
  headingLevel: Heading = "h3",
  linked = true,
}: ProductCardProps) {
  const isService = product.type === ProductType.SERVICE;

  const TypeIcon = isService ? UsersIcon : DownloadIcon;

  // Marketplace card: no frame, the cover lifts and the title underlines on hover.
  return (
    <article
      className={`group relative flex h-full flex-col gap-3 rounded-card ${
        linked
          ? "focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary-strong"
          : ""
      }`}
    >
      {/* The title names the card, so the cover image is decorative. */}
      <div
        className={`rounded-card ${
          linked ? "transition-shadow duration-200 group-hover:shadow-raised" : ""
        }`}
      >
        <ProductCover product={product} locale={locale} index={index} alt="" />
      </div>
      <p dir="auto" className="flex items-center gap-2 text-sm text-muted">
        <TypeIcon className="size-[1.25em] shrink-0" />
        <span className="break-words">{product.categoryLabel}</span>
      </p>
      <Heading
        dir="auto"
        className={`line-clamp-2 text-base leading-[1.4] font-normal tracking-normal break-words ${
          linked ? "group-hover:underline group-hover:underline-offset-3" : ""
        }`}
      >
          {/* The stretched link makes the whole card clickable while its
              accessible name stays the item name. */}
          {linked ? (
            <Link
              href={localizedPath(locale, productPath(product))}
              className="outline-none after:absolute after:inset-0"
            >
              {product.name}
            </Link>
          ) : (
            product.name
          )}
      </Heading>
      <p className="flex items-center gap-1 text-sm text-muted">
        {isService ? (
          <ClockIcon className="size-[1.25em] shrink-0" />
        ) : (
          <BoltIcon className="size-[1.25em] shrink-0" />
        )}
        {isService ? text.startsAfterOnboarding : text.instantDownload}
      </p>
      <p className="mt-auto text-md font-bold">
        {formatPriceCents(product.priceCents)}
      </p>
    </article>
  );
}
