import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ListingSearchInput } from "@/components/catalog/ListingSearchInput";
import { ListingSortSelect } from "@/components/catalog/ListingSortSelect";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ChevronIcon, SearchIcon } from "@/components/icons";
import { listPublishedProducts } from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatItemCount } from "@/lib/i18n/plural";
import {
  filterByCategory,
  LISTING_PAGE_SIZE,
  listingHref,
  type ListingSort,
  paginate,
  sortProducts,
  summarizeCategories,
} from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";

const CONTAINER = "mx-auto w-full max-w-site px-4 min-[700px]:px-8";
const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";
const BUTTON = `h-9 shrink-0 rounded-full bg-primary-strong px-4 text-sm font-semibold text-white hover:bg-primary-hover ${FOCUS}`;
const OUTLINE_BUTTON = `inline-flex h-10 items-center rounded-full border border-border-strong px-5 text-sm font-semibold hover:border-foreground ${FOCUS}`;
const CHIP = `inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-panel px-4 text-sm font-medium whitespace-nowrap hover:border-foreground aria-[current=true]:border-foreground aria-[current=true]:bg-foreground aria-[current=true]:text-background ${FOCUS}`;
const PAGE_BASE =
  "flex h-10 min-w-10 items-center justify-center gap-2 px-3 font-semibold";
const PAGE_NUMBER = `${PAGE_BASE} rounded-full hover:bg-well ${FOCUS}`;
const PAGE_CURRENT = `${PAGE_BASE} rounded-full bg-foreground text-background`;
const PAGE_STEP = `${PAGE_BASE} rounded-full border border-border-strong hover:border-foreground ${FOCUS}`;
const PAGE_STEP_DISABLED = `${PAGE_BASE} rounded-full border border-border-strong opacity-40`;
const LISTING_PATHS: Record<ProductType, string> = {
  [ProductType.DIGITAL_PRODUCT]: "/products",
  [ProductType.SERVICE]: "/services",
};

export async function listingMetadata(type: ProductType): Promise<Metadata> {
  const { listing, meta } = await getDictionary();
  const text = listing.types[type];
  // ?category=, ?q=, ?sort=, and ?page= all canonicalize to the unfiltered
  // listing.
  return pageMetadata({
    locale: await getLocale(),
    path: LISTING_PATHS[type],
    title: text.title,
    description: text.intro,
    siteName: meta.title,
  });
}

interface StoreListingProps {
  type: ProductType;
  // The parsed `category` query value; null means All.
  category: string | null;
  // The parsed `q` query value; null means no search.
  q: string | null;
  sort: ListingSort;
  // The parsed `page` query value; past-the-end pages clamp to the last.
  page: number;
}

export async function StoreListing({
  type,
  category,
  q,
  sort,
  page,
}: StoreListingProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { listing } = dictionary;
  const text = listing.types[type];
  const basePath = localizedPath(locale, LISTING_PATHS[type]);

  // The catalog is small, so one query feeds the counts and the filter.
  // Counts follow the search, so each link shows what it leads to.
  const products = await listPublishedProducts({ type, locale, query: q });
  const categories = summarizeCategories(products);
  const shown = sortProducts(filterByCategory(products, category), sort);
  const paged = paginate(shown, page);
  const view =
    q !== null && shown.length === 0
      ? "search-empty"
      : products.length === 0
        ? "empty"
        : shown.length === 0
          ? "category-empty"
          : "results";
  const firstShown = (paged.page - 1) * LISTING_PAGE_SIZE + 1;
  const showing = listing.showing
    .replace("{from}", String(firstShown))
    .replace("{to}", String(firstShown + paged.items.length - 1));
  // Only the number is bold; some Arabic forms spell it out, so those stay
  // plain.
  const count = String(shown.length);
  const countFull = formatItemCount(locale, shown.length, text.count);
  const countAt = countFull.indexOf(count);
  const countText =
    countAt === -1
      ? [countFull]
      : [
          countFull.slice(0, countAt),
          count,
          countFull.slice(countAt + count.length),
        ];
  // Without a page, a link lands on page 1.
  const href = (
    state: { category: string | null; q: string | null },
    pageNumber?: number,
  ) => listingHref(basePath, { ...state, sort, page: pageNumber });
  const pageLabel = (pageNumber: number) =>
    listing.pagination.page.replace("{page}", String(pageNumber));
  const sortOptions: { value: ListingSort; label: string }[] = [
    { value: "newest", label: listing.sort.newest },
    { value: "price-asc", label: listing.sort.priceAsc },
    { value: "price-desc", label: listing.sort.priceDesc },
  ];

  const filterLinks = [
    { key: "all", label: text.all, count: products.length, value: null },
    ...categories.map((item) => ({
      key: `category-${item.category}`,
      label: item.label,
      count: item.count,
      value: item.category,
    })),
  ];

  return (
    <main className="flex-1 font-sans">
      <div className={`${CONTAINER} pt-6 pb-5`}>
        <nav aria-label={dictionary.cart.breadcrumb}>
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
            <li aria-current="page" className="text-foreground">
              {text.title}
            </li>
          </ol>
        </nav>
        <h1 className="mt-3 text-3xl font-bold tracking-tight rtl:tracking-normal">
          {text.title}
        </h1>
        <p className="mt-2 max-w-[60ch] text-muted">{text.intro}</p>
        <nav
          aria-label={listing.catalogType}
          className="mt-5 inline-flex rounded-full bg-well p-1"
        >
          {[ProductType.DIGITAL_PRODUCT, ProductType.SERVICE].map((tabType) => (
            <Link
              key={tabType}
              href={localizedPath(locale, LISTING_PATHS[tabType])}
              aria-current={tabType === type ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-5 text-sm font-bold text-muted hover:text-foreground aria-[current=page]:bg-panel aria-[current=page]:text-foreground aria-[current=page]:shadow-[0_1px_2px_oklch(22%_0.05_256/0.12)] ${FOCUS}`}
            >
              {listing.types[tabType].tab}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div
          className={`${CONTAINER} grid gap-3 py-3 min-[800px]:flex min-[800px]:items-center min-[800px]:gap-8`}
        >
          <nav aria-label={listing.categories} className="min-w-0 flex-1">
            {/* Padding keeps the focus outline inside the scroll box. */}
            <ul className="-m-1 flex gap-2 overflow-x-auto p-1 [scrollbar-width:none]">
              {filterLinks.map((link) => (
                <li key={link.key} className="shrink-0">
                  <Link
                    href={href({ category: link.value, q })}
                    aria-current={link.value === category ? "true" : undefined}
                    className={CHIP}
                  >
                    <span dir="auto">{link.label}</span>
                    <span className="text-xs opacity-70">{link.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Keyed so a category or sort change resets the fields; the
              search box follows `q` itself so typing keeps focus. */}
          <Form
            key={`${category}|${sort}`}
            action={basePath}
            scroll={false}
            className="flex items-center justify-between gap-3"
          >
            {category !== null && (
              <input type="hidden" name="category" value={category} />
            )}
            <div className="flex min-w-0 flex-1 gap-2 min-[800px]:w-60 min-[800px]:flex-none">
              <ListingSearchInput
                basePath={basePath}
                category={category}
                q={q}
                sort={sort}
                text={{
                  label: text.searchLabel,
                  clear: listing.clearSearch,
                }}
              />
              <noscript>
                <button type="submit" className={BUTTON}>
                  {listing.searchButton}
                </button>
              </noscript>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm text-muted">
              <span className="sr-only shrink-0 min-[600px]:not-sr-only">
                {listing.sortBy}
              </span>
              <ListingSortSelect
                value={sort}
                options={sortOptions}
                className={`field-sizing-content h-9 min-w-0 cursor-pointer rounded-full border border-border-strong bg-panel ps-4 pe-2 font-bold text-foreground hover:border-foreground ${FOCUS}`}
              />
            </label>
          </Form>
        </div>
      </div>

      <section aria-label={text.title} className={`${CONTAINER} pb-16`}>
        {/* One status line that stays mounted, so screen readers hear
            each change as results update while the customer types. */}
        <div
          className={
            view === "results"
              ? "flex flex-wrap items-center justify-between gap-2 py-5 text-sm text-muted"
              : "mt-6 grid justify-items-center gap-4 rounded-panel border border-border px-5 py-12 text-center"
          }
        >
          {view !== "results" && (
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-full bg-well text-muted"
            >
              <SearchIcon className="size-6" />
            </span>
          )}
          <p
            role="status"
            className={view === "results" ? undefined : "text-lg font-semibold"}
          >
            {view === "search-empty" ? (
              <>
                {listing.searchEmpty}{" "}
                <q dir="auto" className="break-words">
                  {q}
                </q>
              </>
            ) : view === "empty" ? (
              text.empty
            ) : view === "category-empty" ? (
              listing.categoryEmpty
            ) : (
              countText.map((part, i) =>
                i === 1 ? (
                  <strong key={i} className="font-bold text-foreground">
                    {part}
                  </strong>
                ) : (
                  part
                ),
              )
            )}
          </p>
          {view === "results" && paged.pageCount > 1 && <p>{showing}</p>}
          {view === "search-empty" ? (
            <Link href={href({ category, q: null })} className={OUTLINE_BUTTON}>
              {listing.clearSearch}
            </Link>
          ) : view === "category-empty" ? (
            <Link href={href({ category: null, q })} className={OUTLINE_BUTTON}>
              {text.all}
            </Link>
          ) : null}
        </div>

        {view === "results" && (
          <>
            <ul className="grid gap-5 min-[600px]:grid-cols-2 min-[960px]:grid-cols-3 min-[960px]:gap-6">
              {paged.items.map((item, index) => (
                <li key={item.id}>
                  <ProductCard
                    product={item}
                    locale={locale}
                    index={index}
                    text={dictionary.product}
                    headingLevel="h2"
                  />
                </li>
              ))}
            </ul>
            {paged.pageCount > 1 && (
              <nav aria-label={listing.pagination.label} className="mt-12">
                <ul className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <li>
                    {paged.page > 1 ? (
                      <Link
                        href={href({ category, q }, paged.page - 1)}
                        className={PAGE_STEP}
                      >
                        <ChevronIcon className="h-4 w-4 -scale-x-100 rtl:scale-x-100" />
                        {listing.pagination.previous}
                      </Link>
                    ) : (
                      <span aria-disabled="true" className={PAGE_STEP_DISABLED}>
                        <ChevronIcon className="h-4 w-4 -scale-x-100 rtl:scale-x-100" />
                        {listing.pagination.previous}
                      </span>
                    )}
                  </li>
                  {Array.from({ length: paged.pageCount }, (_, i) => i + 1).map(
                    (number) => (
                      <li key={number}>
                        {number === paged.page ? (
                          <span
                            aria-current="page"
                            aria-label={pageLabel(number)}
                            className={PAGE_CURRENT}
                          >
                            {number}
                          </span>
                        ) : (
                          <Link
                            href={href({ category, q }, number)}
                            aria-label={pageLabel(number)}
                            className={PAGE_NUMBER}
                          >
                            {number}
                          </Link>
                        )}
                      </li>
                    ),
                  )}
                  <li>
                    {paged.page < paged.pageCount ? (
                      <Link
                        href={href({ category, q }, paged.page + 1)}
                        className={PAGE_STEP}
                      >
                        {listing.pagination.next}
                        <ChevronIcon className="h-4 w-4 rtl:-scale-x-100" />
                      </Link>
                    ) : (
                      <span aria-disabled="true" className={PAGE_STEP_DISABLED}>
                        {listing.pagination.next}
                        <ChevronIcon className="h-4 w-4 rtl:-scale-x-100" />
                      </span>
                    )}
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
