import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  ArrowIcon,
  BoltIcon,
  ChartIcon,
  CheckIcon,
  DownloadIcon,
  GridIcon,
  LockIcon,
  MailIcon,
  MegaphoneIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
import { listHomeProducts, listUnitsSold, productPath } from "@/lib/catalog";
import { HeroStyle, ProductType } from "@/lib/generated/prisma/enums";
import { selectHomeSections } from "@/lib/home";
import { localeDirection, localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatItemCount } from "@/lib/i18n/plural";
import { listingHref, SEARCH_MAX_LENGTH } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/site-content";
import { HERO_PHOTOS, resolveHomeContent } from "@/lib/site-content-rules";

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
const EYEBROW =
  "text-xs font-semibold tracking-[0.08em] text-primary-strong uppercase [&:lang(ar)]:tracking-normal";
// How it works, in step order.
const STEP_ICONS = [SearchIcon, LockIcon, DownloadIcon, ChartIcon];
const STEP_TAG_ICONS = [GridIcon, ShieldIcon, BoltIcon, MailIcon];

// Classes per admin-chosen hero background. Navy and Photo keep white text;
// the photo's navy fade keeps it at AA contrast.
interface HeroTheme {
  section: string;
  eyebrow: string;
  muted: string;
  search: string;
  chip: string;
  trustIcon: string;
}

const DARK_HERO: HeroTheme = {
  section: "bg-ink text-ink-text",
  eyebrow: "border-white/25 text-ink-muted",
  muted: "text-ink-muted",
  search: "focus-within:outline-white",
  chip: "border-white/35 text-ink-text hover:border-ink-text hover:bg-white/8 focus-visible:outline-white",
  trustIcon: "text-ink-text",
};

const HERO_THEMES: Record<HeroStyle, HeroTheme> = {
  [HeroStyle.NAVY]: DARK_HERO,
  [HeroStyle.PHOTO]: {
    ...DARK_HERO,
    chip: `${DARK_HERO.chip} bg-ink/35 backdrop-blur-[6px]`,
  },
  [HeroStyle.LIGHT]: {
    section: "hero-light border-b border-border text-foreground",
    eyebrow: "border-primary-line bg-panel text-primary-strong",
    muted: "text-muted",
    search:
      "border border-border-strong shadow-[0_12px_32px_-18px_oklch(22%_0.05_256/0.35)] focus-within:outline-primary-strong",
    chip: "border-border-strong bg-white/70 text-foreground hover:border-primary-strong hover:bg-panel hover:text-primary-strong focus-visible:outline-primary-strong",
    trustIcon: "text-primary-strong",
  },
};

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
        // "View all" pill: the arrow bubble fills and nudges forward on hover.
        <Link
          href={link.href}
          className="group/view inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-panel ps-4 pe-1.5 text-sm font-semibold whitespace-nowrap text-foreground outline-offset-2 transition-[border-color,color,box-shadow] duration-150 hover:border-primary-strong hover:text-primary-strong hover:shadow-[0_4px_14px_-8px_oklch(48%_0.13_248/0.5)] focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          {link.label}
          <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-primary-strong transition-[background-color,color,translate] duration-200 group-hover/view:bg-primary-strong group-hover/view:text-white motion-safe:group-hover/view:translate-x-[3px] motion-safe:rtl:group-hover/view:-translate-x-[3px] motion-reduce:transition-none">
            <ArrowIcon className="size-4 rtl:-scale-x-100" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

function TrustItem({
  icon,
  iconClass,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  children: string;
}) {
  return (
    <li className="inline-flex items-center gap-2">
      <span className={iconClass}>{icon}</span>
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
  // Admin-edited text, hero background, and section switches (feature 21b).
  const { hero, cta, show } = resolveHomeContent(
    await getSiteContent(),
    locale,
    home,
  );
  const heroChips = categories.slice(0, HERO_CHIP_LIMIT);
  const heroTheme = HERO_THEMES[hero.style];
  const heroPhoto = hero.style === HeroStyle.PHOTO ? HERO_PHOTOS[hero.photo] : null;
  const heroService = services[0] ?? null;

  return (
    <div className="flex-1 font-sans">
      <main>
        <section className={`relative isolate overflow-hidden ${heroTheme.section}`}>
          {hero.style === HeroStyle.LIGHT ? (
            <span aria-hidden="true" className="hero-dots absolute inset-0 -z-10" />
          ) : null}
          {heroPhoto ? (
            <>
              {/* Decorative: the text beside it carries the message. */}
              <Image
                src={heroPhoto.src}
                alt=""
                fill
                priority
                sizes="100vw"
                className="-z-20 object-cover"
                style={{ objectPosition: heroPhoto.position }}
              />
              {/* Navy fade from the text side. On one column the text spans the
                  photo, so the shade is even there. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-ink/88 min-[960px]:bg-transparent min-[960px]:bg-linear-to-r min-[960px]:from-ink/96 min-[960px]:via-ink/82 min-[960px]:via-45% min-[960px]:to-ink/35 min-[960px]:rtl:bg-linear-to-l"
              />
            </>
          ) : null}
          <div
            className={`${CONTAINER} grid items-center gap-12 py-12 min-[960px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[960px]:pt-24 min-[960px]:pb-16`}
          >
            <div>
              <p
                className={`mb-4 inline-flex h-7.5 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${heroTheme.eyebrow}`}
              >
                <BoltIcon className="size-4 shrink-0" />
                {hero.eyebrow}
              </p>
              <h1 className="max-w-[18ch] text-3xl font-bold tracking-tight min-[960px]:text-4xl">
                {hero.title}
              </h1>
              <p className={`mt-4 max-w-[46ch] text-md ${heroTheme.muted}`}>
                {hero.lead}
              </p>
              {/* A plain GET form, like the header: the listing parses q itself. */}
              <form
                role="search"
                action={productsPath}
                className={`mt-6 flex h-14 max-w-150 overflow-hidden rounded-card bg-panel focus-within:outline-2 focus-within:outline-offset-2 ${heroTheme.search}`}
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
                  <span className={`me-1 text-sm ${heroTheme.muted}`}>
                    {home.hero.browse}
                  </span>
                  {heroChips.map(({ type, category, label }) => (
                    <Link
                      key={`${type}-${category}`}
                      href={categoryHref(type, category)}
                      dir="auto"
                      className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap outline-offset-2 transition-colors focus-visible:outline-2 ${heroTheme.chip}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
              {show.showValues ? (
                <ul
                  aria-label={home.why}
                  className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm ${heroTheme.muted}`}
                >
                  <TrustItem
                    icon={<LockIcon className="size-5" />}
                    iconClass={heroTheme.trustIcon}
                  >
                    {header.trust.payment}
                  </TrustItem>
                  <TrustItem
                    icon={<BoltIcon className="size-5" />}
                    iconClass={heroTheme.trustIcon}
                  >
                    {header.trust.download}
                  </TrustItem>
                  <TrustItem
                    icon={<UsersIcon className="size-5" />}
                    iconClass={heroTheme.trustIcon}
                  >
                    {header.trust.tracking}
                  </TrustItem>
                </ul>
              ) : null}
            </div>
            {heroProduct ? (
              <div className="relative hidden w-full max-w-[420px] justify-self-end rounded-panel shadow-float min-[960px]:block">
                <ProductCard
                  product={heroProduct}
                  locale={locale}
                  index={0}
                  text={dictionary.product}
                  headingLevel="h2"
                  bordered={false}
                />
                {heroService ? (
                  <Link
                    href={localizedPath(locale, productPath(heroService))}
                    className="absolute -end-6 top-7 z-10 flex max-w-60 items-center gap-3 rounded-card bg-panel px-4 py-3 text-sm text-foreground shadow-float outline-offset-2 transition-colors hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-control bg-primary-soft text-primary-strong"
                    >
                      <MegaphoneIcon className="size-5" />
                    </span>
                    <span className="grid min-w-0">
                      <strong dir="auto" className="truncate font-semibold">
                        {heroService.name}
                      </strong>
                      <span dir="auto" className="truncate text-muted">
                        {heroService.categoryLabel}
                      </span>
                    </span>
                  </Link>
                ) : null}
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
              <ul className="grid grid-cols-2 gap-4 min-[600px]:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
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
                      <ul className="grid gap-5 min-[600px]:grid-cols-2 min-[1060px]:grid-cols-4">
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
                      <li key={item.id}>
                        <ProductCard
                          product={item}
                          locale={locale}
                          index={index}
                          text={dictionary.product}
                          bordered={false}
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
              <div className="mx-auto mb-8 max-w-[52ch] text-center">
                <p className={EYEBROW}>{home.howItWorksEyebrow}</p>
                <h2
                  id="how-heading"
                  className="mt-2 text-xl font-bold min-[700px]:text-2xl"
                >
                  {home.howItWorks}
                </h2>
                <p className="mt-2 text-muted">{home.howItWorksIntro}</p>
              </div>
              {/* The ol already numbers the steps for assistive tech, so the
                  badges and icons are decorative. Dashed connectors join the
                  cards at icon height in the four-column row. */}
              <ol className="grid gap-5 min-[600px]:grid-cols-2 min-[960px]:grid-cols-4">
                {home.steps.map((step, index) => {
                  const StepIcon = STEP_ICONS[index];
                  const TagIcon = STEP_TAG_ICONS[index];
                  const last = index === home.steps.length - 1;
                  return (
                    <li
                      key={step.title}
                      className="relative flex flex-col gap-2 rounded-panel border border-border bg-panel p-5 min-[960px]:not-last:after:absolute min-[960px]:not-last:after:start-[calc(100%+4px)] min-[960px]:not-last:after:top-[46px] min-[960px]:not-last:after:w-3 min-[960px]:not-last:after:border-t-2 min-[960px]:not-last:after:border-dashed min-[960px]:not-last:after:border-primary-line"
                    >
                      <span
                        aria-hidden="true"
                        className={`relative mb-3 grid size-13 place-items-center rounded-panel ${
                          last ? "bg-primary-strong text-white" : "bg-primary-soft text-primary-strong"
                        }`}
                      >
                        {StepIcon ? <StepIcon className="size-6.5" /> : null}
                        <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full border-2 border-panel bg-ink text-xs font-bold text-ink-text tabular-nums">
                          {index + 1}
                        </span>
                      </span>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="text-sm text-muted">{step.body}</p>
                      <p className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-success">
                        {TagIcon ? <TagIcon className="size-3.5 shrink-0" /> : null}
                        {step.tag}
                      </p>
                    </li>
                  );
                })}
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
