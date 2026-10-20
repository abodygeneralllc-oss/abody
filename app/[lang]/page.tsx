import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  ArrowIcon,
  BoltIcon,
  CheckIcon,
  DownloadIcon,
  LockIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/icons";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { listHomeProducts, listUnitsSold } from "@/lib/catalog";
import { ProductType } from "@/lib/generated/prisma/enums";
import { selectHomeSections } from "@/lib/home";
import { localeDirection, localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatItemCount } from "@/lib/i18n/plural";
import { listingHref, SEARCH_MAX_LENGTH } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/site-content";
import { resolveHomeContent } from "@/lib/site-content-rules";

// Full-bleed bands hold a container with the header's gutters.
const CONTAINER = "mx-auto w-full max-w-site px-4 min-[700px]:px-8";
const SECTION = "py-12 min-[700px]:py-16";
const LISTING_PATHS: Record<ProductType, string> = {
  [ProductType.DIGITAL_PRODUCT]: "/products",
  [ProductType.SERVICE]: "/services",
};
const HERO_CHIP_LIMIT = 4;
// White buttons on the navy services band and the blue call to action.
const LIGHT_BUTTON =
  "inline-flex items-center gap-2 rounded-card bg-panel font-semibold text-foreground outline-offset-2 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-white";
const ARROW = "size-[1.1em] rtl:-scale-x-100";

interface SectionHeadProps {
  id: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
}

function SectionHead({ id, title, intro, link }: SectionHeadProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-bold min-[700px]:text-2xl">
          {title}
        </h2>
        {intro ? <p className="mt-2 text-muted">{intro}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1 rounded-control font-bold text-primary-strong outline-offset-2 hover:underline hover:underline-offset-3 focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          {link.label}
          <ArrowIcon className={ARROW} />
        </Link>
      ) : null}
    </div>
  );
}

function TrustItem({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <li className="inline-flex items-center gap-2">
      <span className="text-ink-text">{icon}</span>
      {children}
    </li>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return pageMetadata({
    locale: await getLocale(),
    path: "/",
    title: meta.title,
    description: meta.description,
    siteName: meta.title,
    absoluteTitle: true,
  });
}

export default async function Home() {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { home, listing, header } = dictionary;
  const productsPath = localizedPath(locale, "/products");
  const servicesPath = localizedPath(locale, "/services");

  // The catalog is small, so one product query feeds every section.
  const [items, unitsSold] = await Promise.all([
    listHomeProducts(locale),
    listUnitsSold(),
  ]);
  const { heroProduct, featuredTabs, services, categories } =
    selectHomeSections(items, unitsSold);
  const categoryHref = (type: ProductType, category: string) =>
    listingHref(localizedPath(locale, LISTING_PATHS[type]), {
      category,
      q: null,
      sort: "newest",
    });
  const tabText = home.featured.tabs;
  const featuredTabList = [
    { id: "best-sellers", label: tabText.bestSellers, products: featuredTabs.bestSellers },
    { id: "new", label: tabText.new, products: featuredTabs.newest },
    { id: "templates", label: tabText.templates, products: featuredTabs.templates },
  ].filter(({ products }) => products.length > 0);
  // Admin-edited text and section switches (feature 21b).
  const { hero, cta, show } = resolveHomeContent(
    await getSiteContent(),
    locale,
    home,
  );
  const heroChips = categories.slice(0, HERO_CHIP_LIMIT);

  return (
    <div className="flex-1 font-sans">
      <main>
        <section className="overflow-hidden bg-ink text-ink-text">
          <div
            className={`${CONTAINER} grid items-center gap-12 py-12 min-[960px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[960px]:pt-24 min-[960px]:pb-16`}
          >
            <div>
              <p className="text-sm font-bold text-ink-muted">{hero.eyebrow}</p>
              <h1 className="mt-3 max-w-[18ch] text-3xl font-bold tracking-tight min-[960px]:text-4xl">
                {hero.title}
              </h1>
              <p className="mt-4 max-w-[46ch] text-md text-ink-muted">
                {hero.lead}
              </p>
              {/* A plain GET form, like the header: the listing parses q itself. */}
              <form
                role="search"
                action={productsPath}
                className="mt-6 flex h-14 max-w-150 overflow-hidden rounded-card bg-panel focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white"
              >
                <label htmlFor="hero-search" className="sr-only">
                  {home.hero.search.label}
                </label>
                <input
                  id="hero-search"
                  type="search"
                  name="q"
                  dir="auto"
                  maxLength={SEARCH_MAX_LENGTH}
                  placeholder={home.hero.search.placeholder}
                  className="min-w-0 flex-1 bg-transparent px-5 text-md text-foreground outline-none placeholder:text-faint"
                />
                <button
                  type="submit"
                  aria-label={home.hero.search.submit}
                  className="m-1.5 grid w-12 shrink-0 cursor-pointer place-items-center rounded-control bg-primary-strong text-white hover:bg-primary-hover"
                >
                  <SearchIcon className="size-5" />
                </button>
              </form>
              {heroChips.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="me-1 text-sm text-ink-muted">
                    {home.hero.browse}
                  </span>
                  {heroChips.map(({ type, category, label }) => (
                    <Link
                      key={`${type}-${category}`}
                      href={categoryHref(type, category)}
                      dir="auto"
                      className="inline-flex h-9 items-center rounded-full border border-white/35 px-4 text-sm font-medium whitespace-nowrap text-ink-text outline-offset-2 hover:border-ink-text hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-white"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
              {show.showValues ? (
                <ul
                  aria-label={home.why}
                  className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-muted"
                >
                  <TrustItem icon={<LockIcon className="size-5" />}>
                    {header.trust.payment}
                  </TrustItem>
                  <TrustItem icon={<BoltIcon className="size-5" />}>
                    {header.trust.download}
                  </TrustItem>
                  <TrustItem icon={<UsersIcon className="size-5" />}>
                    {header.trust.tracking}
                  </TrustItem>
                </ul>
              ) : null}
            </div>
            {heroProduct ? (
              <div className="hidden w-full max-w-[420px] justify-self-end rounded-panel bg-panel p-3 text-foreground shadow-float min-[960px]:block">
                <ProductCard
                  product={heroProduct}
                  locale={locale}
                  index={0}
                  text={dictionary.product}
                  headingLevel="h2"
                />
              </div>
            ) : null}
          </div>
        </section>

        {show.showCategories && categories.length > 0 ? (
          <section aria-labelledby="categories-heading" className={SECTION}>
            <div className={CONTAINER}>
              <SectionHead
                id="categories-heading"
                title={home.categories}
                link={{ href: productsPath, label: home.viewAll }}
              />
              <ul className="grid grid-cols-2 gap-4 min-[600px]:grid-cols-3 min-[960px]:grid-cols-5">
                {categories.map(({ type, category, label, count }) => (
                  <li key={`${type}-${category}`}>
                    <Link
                      href={categoryHref(type, category)}
                      className="flex h-full flex-col gap-4 rounded-panel border border-border p-5 outline-offset-2 transition-[box-shadow,border-color] duration-150 hover:border-foreground hover:shadow-raised focus-visible:outline-2 focus-visible:outline-primary-strong"
                    >
                      <span className="text-primary">
                        {type === ProductType.SERVICE ? (
                          <UsersIcon className="size-8" />
                        ) : (
                          <DownloadIcon className="size-8" />
                        )}
                      </span>
                      <span className="grid gap-1">
                        <strong
                          dir="auto"
                          className="leading-[1.3] font-bold break-words"
                        >
                          {label}
                        </strong>
                        <span className="text-sm text-muted">
                          {formatItemCount(
                            locale,
                            count,
                            listing.types[type].count,
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {show.showFeatured ? (
          <section
            aria-labelledby="featured-heading"
            className={`${SECTION} bg-surface`}
          >
            <div className={CONTAINER}>
              {featuredTabs.newest.length === 0 ? (
                <>
                  <SectionHead
                    id="featured-heading"
                    title={home.featured.title}
                    intro={home.featured.intro}
                  />
                  <p className="text-muted">
                    {listing.types.DIGITAL_PRODUCT.empty}
                  </p>
                </>
              ) : (
                <FeaturedTabs
                  head={
                    <SectionHead
                      id="featured-heading"
                      title={home.featured.title}
                      intro={home.featured.intro}
                      link={{ href: productsPath, label: home.viewAll }}
                    />
                  }
                  label={home.featured.title}
                  dir={localeDirection(locale)}
                  tabs={featuredTabList.map(({ id, label, products }) => ({
                    id,
                    label,
                    panel: (
                      <ul className="grid gap-x-5 gap-y-8 min-[600px]:grid-cols-2 min-[960px]:grid-cols-3">
                        {products.map((item, index) => (
                          <li key={item.id}>
                            <ProductCard
                              product={item}
                              locale={locale}
                              index={index}
                              text={dictionary.product}
                            />
                          </li>
                        ))}
                      </ul>
                    ),
                  }))}
                />
              )}
            </div>
          </section>
        ) : null}

        {show.showServices ? (
          <section aria-labelledby="services-heading" className={SECTION}>
            <div className={CONTAINER}>
              <div className="grid gap-10 rounded-panel bg-ink px-5 py-8 text-ink-text min-[960px]:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] min-[960px]:px-12 min-[960px]:py-16">
                <div>
                  <p className="text-sm font-bold text-ink-muted">
                    {home.services.promoEyebrow}
                  </p>
                  <h2
                    id="services-heading"
                    className="mt-3 text-xl font-bold min-[700px]:text-2xl"
                  >
                    {home.services.promoTitle}
                  </h2>
                  <p className="mt-3 text-ink-muted">{home.services.intro}</p>
                  <ul className="my-6 grid gap-3">
                    {home.services.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckIcon className="mt-0.5 size-5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link href={servicesPath} className={`${LIGHT_BUTTON} h-11 px-5`}>
                    {home.services.promoAction}
                  </Link>
                </div>
                {services.length === 0 ? (
                  <p className="self-center text-ink-muted">
                    {listing.types.SERVICE.empty}
                  </p>
                ) : (
                  <ul className="grid content-center gap-4 min-[600px]:grid-cols-2">
                    {services.map((item, index) => (
                      <li
                        key={item.id}
                        className="rounded-card bg-panel p-3 text-foreground"
                      >
                        <ProductCard
                          product={item}
                          locale={locale}
                          index={index}
                          text={dictionary.product}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {show.showHowItWorks ? (
          <section
            aria-labelledby="how-heading"
            className={`${SECTION} bg-surface`}
          >
            <div className={CONTAINER}>
              <SectionHead id="how-heading" title={home.howItWorks} />
              <ol className="grid grid-cols-2 gap-5 min-[800px]:grid-cols-4">
                {home.steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="border-t-2 border-border pt-5 first:border-primary"
                  >
                    {/* The ol already numbers the steps for assistive tech. */}
                    <span
                      aria-hidden="true"
                      className="text-sm font-bold text-primary-strong tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="my-2 text-lg font-bold">{step.title}</h3>
                    <p className="text-sm text-muted">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {show.showCta ? (
          <section className={SECTION}>
            <div className={CONTAINER}>
              <div className="flex flex-wrap items-center justify-between gap-5 rounded-panel bg-primary-strong p-6 text-white min-[700px]:p-10">
                <div>
                  <h2 className="text-xl font-bold min-[700px]:text-2xl">
                    {cta.title}
                  </h2>
                  <p className="mt-2 opacity-90">{cta.body}</p>
                </div>
                <Link href={productsPath} className={`${LIGHT_BUTTON} h-13 px-6 text-md`}>
                  {cta.action}
                  <ArrowIcon className={ARROW} />
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
