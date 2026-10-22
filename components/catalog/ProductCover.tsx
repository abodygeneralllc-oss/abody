import { CoverImage } from "@/components/catalog/CoverImage";
import {
  formatDurationDays,
  publicImageSrc,
  type PublicProduct,
} from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import type { Locale } from "@/lib/i18n/config";

// Placeholder covers cycle through the mockup tints by position.
const TINTS = ["bg-tint-1", "bg-tint-2", "bg-tint-3", "bg-tint-4", "bg-tint-5"];

interface ProductCoverProps {
  product: Pick<PublicProduct, "type" | "image" | "durationDays">;
  locale: Locale;
  index: number;
  // Empty when a nearby heading already names the item.
  alt: string;
  // "card" is the 16:10 store card cover, "hero" the wide detail-page cover,
  // and "thumb" a small list thumbnail with no art.
  variant?: "card" | "hero" | "thumb";
  // A service card's duration badge; off where the duration is listed nearby.
  showDuration?: boolean;
}

const FRAME: Record<NonNullable<ProductCoverProps["variant"]>, string> = {
  card: "aspect-16/10 rounded-card",
  hero: "aspect-video rounded-panel",
  thumb: "aspect-16/10 w-14 shrink-0 rounded-control",
};

export function ProductCover({
  product,
  locale,
  index,
  alt,
  variant = "card",
  showDuration = true,
}: ProductCoverProps) {
  const src = publicImageSrc(product.image);
  const durationDays =
    variant === "card" &&
    showDuration &&
    product.type === ProductType.SERVICE &&
    product.durationDays &&
    product.durationDays > 0
      ? product.durationDays
      : null;

  return (
    <div
      className={`relative isolate grid place-items-center overflow-hidden ${FRAME[variant]} ${TINTS[index % TINTS.length]}`}
    >
      {variant !== "thumb" && (
        // Two stacked sheets: a front page with document lines and a sheet
        // behind it that fans out when the store card is hovered. It stays
        // under the photo, so a broken photo falls back to it.
        <span
          aria-hidden="true"
          className={`relative grid aspect-[3/4] ${variant === "hero" ? "h-[62%]" : "h-[72%]"} content-start gap-[7%] rounded-card bg-panel px-[10%] py-[11%] shadow-[0_14px_28px_-14px_oklch(22%_0.05_256/0.4)]`}
        >
          <span className="absolute inset-0 -z-10 translate-x-[16%] translate-y-[3%] rotate-[7deg] rounded-card bg-panel/60 shadow-[0_10px_22px_-14px_oklch(22%_0.05_256/0.35)] transition-[translate,rotate] duration-300 group-hover/card:translate-x-[22%] group-hover/card:translate-y-[2%] group-hover/card:rotate-[11deg] motion-reduce:transition-none rtl:-translate-x-[16%] rtl:-rotate-[7deg] rtl:group-hover/card:-translate-x-[22%] rtl:group-hover/card:-rotate-[11deg]" />
          <span className="block h-1.75 w-[60%] rounded-full bg-primary" />
          <span className="block h-1.25 rounded-full bg-border" />
          <span className="block h-1.25 w-[85%] rounded-full bg-border" />
          <span className="block h-1.25 w-[70%] rounded-full bg-border" />
        </span>
      )}
      {src && <CoverImage src={src} alt={alt} />}
      {durationDays && (
        <span className="absolute start-3 top-3 rounded-full bg-panel px-3 py-1 text-xs font-semibold whitespace-nowrap text-muted">
          {formatDurationDays(durationDays, locale)}
        </span>
      )}
    </div>
  );
}
