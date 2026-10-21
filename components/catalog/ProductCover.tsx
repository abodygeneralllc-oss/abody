import { ChartIcon } from "@/components/icons";
import {
  formatDurationDays,
  publicImageSrc,
  type PublicProduct,
} from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import type { Locale } from "@/lib/i18n/config";

// Placeholder covers cycle through the mockup tints by position.
const PRODUCT_TINTS = ["bg-tint-1", "bg-tint-2", "bg-tint-3", "bg-tint-4"];

interface ProductCoverProps {
  product: PublicProduct;
  locale: Locale;
  index: number;
  // Empty when a nearby heading already names the item.
  alt: string;
  // "hero" is the wide detail-page cover; its meta row shows the duration.
  variant?: "card" | "hero";
}

// The 4:3 store card cover, or the 16:9 detail-page cover.
export function ProductCover({
  product,
  locale,
  index,
  alt,
  variant = "card",
}: ProductCoverProps) {
  const isHero = variant === "hero";
  const isService = product.type === ProductType.SERVICE;
  const src = publicImageSrc(product.image);
  const durationDays =
    !isHero && isService && product.durationDays && product.durationDays > 0
      ? product.durationDays
      : null;
  const coverColor = isService
    ? "bg-ink"
    : PRODUCT_TINTS[index % PRODUCT_TINTS.length];

  return (
    <div
      className={`relative isolate grid place-items-center overflow-hidden ${isHero ? "aspect-video rounded-panel" : "aspect-[4/3] rounded-card"} ${coverColor}`}
    >
      {src ? (
        // Same reason as ProductImage: image hosts are not configured yet.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : isService ? (
        <span
          aria-hidden="true"
          className={`grid aspect-square place-items-center ${isHero ? "w-[18%]" : "w-[30%]"} rounded-full bg-primary-strong text-white`}
        >
          <ChartIcon className="size-1/2" />
        </span>
      ) : (
        // Two stacked sheets: a front page with document lines and a sheet
        // behind it that fans out when the store card is hovered.
        <span
          aria-hidden="true"
          className={`relative grid aspect-[3/4] ${isHero ? "h-[62%]" : "h-[72%]"} content-start gap-[7%] rounded-control bg-panel px-[10%] py-[11%] shadow-[0_14px_28px_-14px_oklch(22%_0.05_256/0.4)]`}
        >
          <span className="absolute inset-0 -z-10 translate-x-[16%] translate-y-[3%] rotate-[7deg] rounded-control bg-panel/60 shadow-[0_10px_22px_-14px_oklch(22%_0.05_256/0.35)] transition-[translate,rotate] duration-300 group-hover/card:translate-x-[22%] group-hover/card:translate-y-[2%] group-hover/card:rotate-[11deg] motion-reduce:transition-none rtl:-translate-x-[16%] rtl:-rotate-[7deg] rtl:group-hover/card:-translate-x-[22%] rtl:group-hover/card:-rotate-[11deg]" />
          <span className="block h-1.75 w-[60%] rounded-full bg-primary" />
          <span className="block h-1.25 rounded-full bg-border" />
          <span className="block h-1.25 w-[85%] rounded-full bg-border" />
          <span className="block h-1.25 w-[70%] rounded-full bg-border" />
        </span>
      )}
      {durationDays && (
        <span className="absolute start-3 top-3 rounded-full bg-panel px-3 py-1 text-xs font-semibold whitespace-nowrap text-muted">
          {formatDurationDays(durationDays, locale)}
        </span>
      )}
    </div>
  );
}
