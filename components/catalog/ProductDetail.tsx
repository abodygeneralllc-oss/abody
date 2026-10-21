import Link from "next/link";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductCover } from "@/components/catalog/ProductCover";
import { RelatedProducts } from "@/components/catalog/RelatedProducts";
import {
  BoltIcon,
  ChartIcon,
  CheckIcon,
  ChevronIcon,
  ClockIcon,
  DownloadIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/icons";
import {
  checklistLines,
  formatDurationDays,
  type PublicProduct,
} from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatPriceCents } from "@/lib/money";

const CONTAINER = "mx-auto w-full max-w-site px-4 min-[700px]:px-8";
const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";
const BLOCK = "border-b border-border py-6 last:border-b-0";
const BLOCK_HEADING = "mb-4 text-xl font-bold";
// How many included lines the purchase box repeats.
const BUY_LIST_LIMIT = 3;

interface ProductDetailProps {
  product: PublicProduct;
}

function Checklist({ lines, columns }: { lines: string[]; columns?: boolean }) {
  return (
    <ul
      className={`grid gap-x-5 gap-y-3 ${columns ? "min-[600px]:grid-cols-2" : ""}`}
    >
      {lines.map((line, index) => (
        <li key={index} className="flex gap-3">
          <CheckIcon className="mt-1 size-4 shrink-0 text-success" />
          <span dir="auto" className="min-w-0 break-words">
            {line}
          </span>
        </li>
      ))}
    </ul>
  );
}

// A field with no Arabic content falls back to English, so stored content
// carries dir="auto" to keep its own alignment and punctuation on Arabic pages.
export async function ProductDetail({ product }: ProductDetailProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { product: text, cart } = dictionary;
  const isService = product.type === ProductType.SERVICE;
  const included = checklistLines(product.included.join("\n"));
  const requirements = isService ? checklistLines(product.requirements) : [];
  const duration =
    isService && product.durationDays && product.durationDays > 0
      ? formatDurationDays(product.durationDays, locale)
      : null;
  const listing = isService
    ? { path: "/services", label: dictionary.header.services }
    : { path: "/products", label: dictionary.header.products };
  const delivery = isService
    ? (duration ?? text.startsAfterOnboarding)
    : text.instantDownload;
  const [refundBefore, refundAfter] = text.questions.items[2].answer.split("{link}");

  return (
    <main className="flex-1 font-sans">
      <div
        className={`${CONTAINER} grid items-start gap-x-10 pt-6 pb-10 min-[960px]:grid-cols-[minmax(0,1fr)_380px] min-[960px]:grid-rows-[auto_1fr]`}
      >
        <div className="min-w-0">
          <nav aria-label={cart.breadcrumb}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link
                  href={localizedPath(locale, "/")}
                  className={`rounded-control hover:text-primary-strong ${FOCUS}`}
                >
                  {dictionary.header.home}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
              </li>
              <li>
                <Link
                  href={localizedPath(locale, listing.path)}
                  className={`rounded-control hover:text-primary-strong ${FOCUS}`}
                >
                  {listing.label}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
              </li>
              <li
                aria-current="page"
                dir="auto"
                className="min-w-0 break-words text-foreground"
              >
                {product.name}
              </li>
            </ol>
          </nav>
          <h1
            dir="auto"
            className="mt-3 max-w-[22ch] text-3xl font-bold tracking-tight break-words rtl:tracking-normal"
          >
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="inline-flex h-6 items-center rounded-control bg-primary-soft px-2 text-xs font-bold text-primary-strong">
              {text.typeLabels[product.type]}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-border-strong" />
            <span dir="auto" className="min-w-0 break-words">
              {product.categoryLabel}
            </span>
            <span aria-hidden="true" className="h-4 w-px bg-border-strong" />
            <span>{delivery}</span>
          </div>
          <div className="mt-5">
            <ProductCover
              product={product}
              locale={locale}
              index={0}
              alt={product.name}
              variant="hero"
            />
          </div>
        </div>

        <aside
          aria-label={text.purchase}
          className="mt-8 min-[960px]:sticky min-[960px]:top-6 min-[960px]:row-span-2 min-[960px]:mt-0"
        >
          <div className="overflow-hidden rounded-panel border border-border">
            <div className="border-b border-border">
              <span className="-mb-px inline-block border-b-3 border-primary px-5 py-4 font-bold">
                {text.typeLabels[product.type]}
              </span>
            </div>
            <div className="grid gap-4 p-5">
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-muted">{text.price}</span>
                <span>
                  <strong className="text-2xl font-bold tracking-tight">
                    {formatPriceCents(product.priceCents)}
                  </strong>
                  {duration && (
                    <small className="ms-1 text-sm font-medium text-muted">
                      / {duration}
                    </small>
                  )}
                </span>
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
                {isService ? (
                  <>
                    {duration && (
                      <span className="inline-flex items-center gap-2">
                        <ClockIcon className="size-4" />
                        {duration}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2">
                      <ChartIcon className="size-4" />
                      {text.statusUpdates}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <BoltIcon className="size-4" />
                      {text.instantDownload}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <DownloadIcon className="size-4" />
                      {text.keptInAccount}
                    </span>
                  </>
                )}
              </div>
              {included.length > 0 && (
                <ul className="grid gap-2 text-sm text-muted">
                  {included.slice(0, BUY_LIST_LIMIT).map((line, index) => (
                    <li key={index} className="flex gap-2">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span dir="auto" className="min-w-0 break-words">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <AddToCartButton
                productId={product.id}
                cartHref={localizedPath(locale, "/cart")}
                text={{
                  addToCart: text.addToCart,
                  adding: text.adding,
                  added: text.added,
                  alreadyInCart: text.alreadyInCart,
                  maxQuantity: text.maxQuantity,
                  viewCart: text.viewCart,
                  errors: cart.errors,
                }}
              />
            </div>
            <div className="grid gap-2 border-t border-border bg-surface px-5 py-4 text-sm text-muted">
              <span className="flex items-center gap-2">
                <LockIcon className="size-4 shrink-0" />
                {text.securePayment}
              </span>
              <span className="flex items-center gap-2">
                <ShieldIcon className="size-4 shrink-0" />
                {text.fromAccount}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border px-5 py-4 text-sm">
            <span>{text.contact.prompt}</span>
            <Link
              href={localizedPath(locale, "/contact")}
              className={`inline-flex h-9 items-center rounded-full border border-border-strong px-4 font-semibold hover:border-foreground ${FOCUS}`}
            >
              {text.contact.action}
            </Link>
          </div>
        </aside>

        <div className="mt-4 min-w-0">
          <section aria-labelledby="about-heading" className={BLOCK}>
            <h2 id="about-heading" className={BLOCK_HEADING}>
              {text.about[product.type]}
            </h2>
            <div className="grid max-w-[68ch] gap-3 leading-7 text-muted">
              <p dir="auto" className="break-words">
                {product.shortDescription}
              </p>
              <p dir="auto" className="break-words whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </section>

          {included.length > 0 && (
            <section aria-labelledby="included-heading" className={BLOCK}>
              <h2 id="included-heading" className={BLOCK_HEADING}>
                {text.included}
              </h2>
              <Checklist lines={included} columns />
            </section>
          )}

          {requirements.length > 0 && (
            <section aria-labelledby="requirements-heading" className={BLOCK}>
              <h2 id="requirements-heading" className={BLOCK_HEADING}>
                {text.requirements}
              </h2>
              <Checklist lines={requirements} />
            </section>
          )}

          <section aria-labelledby="after-heading" className={BLOCK}>
            <h2 id="after-heading" className={BLOCK_HEADING}>
              {text.afterPurchase.title}
            </h2>
            <ol className="grid gap-4 min-[960px]:grid-cols-3">
              {text.afterPurchase.steps[product.type].map((step, index) => (
                <li key={step.title} className="rounded-card bg-surface p-4">
                  <span
                    aria-hidden="true"
                    className="mb-3 grid size-7 place-items-center rounded-full bg-ink text-sm font-bold text-ink-text"
                  >
                    {index + 1}
                  </span>
                  <strong className="mb-1 block">{step.title}</strong>
                  <p className="text-sm text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="questions-heading" className={BLOCK}>
            <h2 id="questions-heading" className={BLOCK_HEADING}>
              {text.questions.title}
            </h2>
            <div className="border-t border-border">
              {text.questions.items.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="group border-b border-border"
                >
                  <summary
                    className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-control py-4 font-bold [&::-webkit-details-marker]:hidden ${FOCUS}`}
                  >
                    {item.question}
                    <ChevronIcon className="size-4 shrink-0 rotate-90 text-muted transition-transform group-open:-rotate-90 motion-reduce:transition-none" />
                  </summary>
                  <p className="max-w-[68ch] pb-4 text-muted">
                    {index === 2 ? (
                      <>
                        {refundBefore}
                        <Link
                          href={localizedPath(locale, "/returns")}
                          className={`rounded-control font-semibold text-primary-strong underline hover:text-primary-hover ${FOCUS}`}
                        >
                          {text.questions.returnLink}
                        </Link>
                        {refundAfter}
                      </>
                    ) : (
                      item.answer
                    )}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <RelatedProducts product={product} />
    </main>
  );
}
