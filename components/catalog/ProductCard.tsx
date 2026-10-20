import Link from "next/link";
import { ProductCover } from "@/components/catalog/ProductCover";
import { BoltIcon, ClockIcon } from "@/components/icons";
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
  // False on the navy services band and the hero, where the card has no frame line.
  bordered?: boolean;
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
  bordered = true,
}: ProductCardProps) {
  const isService = product.type === ProductType.SERVICE;

  // Framed card: on hover it lifts, the border turns light blue, and the title
  // turns blue. The cover's back sheet fans out (ProductCover).
  return (
    <article
      className={`group/card relative flex h-full flex-col gap-3 rounded-panel border bg-panel p-3 pb-4 text-foreground ${
        bordered ? "border-border" : "border-transparent"
      } ${
        linked
          ? "transition-[border-color,box-shadow,translate] duration-200 hover:shadow-raised focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary-strong motion-safe:hover:-translate-y-[3px] motion-reduce:transition-none"
          : ""
      } ${linked && bordered ? "hover:border-primary-line" : ""}`}
    >
      {/* The title names the card, so the cover image is decorative. */}
      <ProductCover product={product} locale={locale} index={index} alt="" />
      <div className="flex flex-1 flex-col gap-2 px-2 pt-2">
        <p
          dir="auto"
          className="text-xs font-semibold tracking-[0.08em] break-words text-primary-strong uppercase [&:lang(ar)]:tracking-normal"
        >
          {product.categoryLabel}
        </p>
        <Heading
          dir="auto"
          className={`line-clamp-2 text-md leading-[1.35] font-semibold tracking-[-0.01em] break-words ${
            linked ? "transition-colors duration-150 group-hover/card:text-primary-strong" : ""
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
        <p dir="auto" className="line-clamp-2 text-sm break-words text-muted">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <p className="text-lg font-bold tracking-[-0.01em] tabular-nums">
            {formatPriceCents(product.priceCents)}
          </p>
          <p
            className={`inline-flex h-6.5 items-center gap-1 rounded-full px-2.5 text-xs font-bold whitespace-nowrap ${
              isService ? "bg-primary-soft text-primary-strong" : "bg-success-soft text-success"
            }`}
          >
            {isService ? (
              <ClockIcon className="size-3.5 shrink-0" />
            ) : (
              <BoltIcon className="size-3.5 shrink-0" />
            )}
            {isService ? text.startsAfterOnboarding : text.instantDownload}
          </p>
        </div>
      </div>
    </article>
  );
}
