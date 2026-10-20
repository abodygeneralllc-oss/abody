import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { CartIcon, SearchIcon, UserIcon } from "@/components/icons";
import {
  LanguageSwitcher,
  LanguageSwitcherFallback,
} from "@/components/layout/LanguageSwitcher";
import { MainNav, type NavItem } from "@/components/layout/MainNav";
import { CART_COOKIE, cartItemCount, parseCart } from "@/lib/cart";
import { localizedPath } from "@/lib/i18n/config";
import { SEARCH_MAX_LENGTH } from "@/lib/listing";
import { SESSION_COOKIE } from "@/lib/session-token";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

export async function SiteHeader() {
  const locale = await getLocale();
  const { header } = await getDictionary();
  // Read straight from the cookie: the cart page and every write recheck items.
  const cookieStore = await cookies();
  const count = cartItemCount(parseCart(cookieStore.get(CART_COOKIE)?.value));
  // Optimistic: a cookie is enough to offer the account link, so no database
  // query runs on every page. The account page does the real check.
  const signedIn = cookieStore.has(SESSION_COOKIE);
  // Only pages that exist are linked; each feature adds its own entry.
  const navItems: NavItem[] = [
    { href: localizedPath(locale, "/"), label: header.home },
    { href: localizedPath(locale, "/products"), label: header.products },
    { href: localizedPath(locale, "/services"), label: header.services },
    { href: localizedPath(locale, "/about"), label: header.about },
    { href: localizedPath(locale, "/contact"), label: header.contact },
  ];

  return (
    <header className="border-b border-border bg-background font-sans">
      {/* Below 900px the search drops to its own full-width row. */}
      <div className="mx-auto flex w-full max-w-site flex-wrap items-center gap-x-2 gap-y-3 px-4 py-3 min-[700px]:px-8 min-[900px]:h-18 min-[900px]:flex-nowrap min-[900px]:gap-x-6 min-[900px]:py-0">
        <Link href={localizedPath(locale, "/")} className={`shrink-0 rounded-control ${FOCUS}`}>
          {/* The logo is bilingual and is used as is in both languages. */}
          <Image
            src="/Logo-0.jpg"
            alt={header.logoAlt}
            width={164}
            height={32}
            priority
            className="h-7.5 w-auto"
          />
        </Link>
        {/* A plain GET form: the products listing parses and limits q itself. */}
        <form
          role="search"
          action={localizedPath(locale, "/products")}
          className="order-last flex h-11 w-full overflow-hidden rounded-card border border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-strong min-[900px]:order-none min-[900px]:max-w-140 min-[900px]:flex-1"
        >
          <label htmlFor="header-search" className="sr-only">
            {header.search.label}
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            dir="auto"
            maxLength={SEARCH_MAX_LENGTH}
            placeholder={header.search.placeholder}
            className="min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            aria-label={header.search.submit}
            className="grid w-12 shrink-0 place-items-center bg-foreground text-background hover:bg-ink-raised"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
        <div className="ms-auto flex items-center gap-1">
          <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
            <LanguageSwitcher locale={locale} />
          </Suspense>
          <Link
            href={localizedPath(locale, signedIn ? "/account" : "/login")}
            className={`flex h-10 items-center gap-2 rounded-card px-3 text-sm font-medium whitespace-nowrap text-muted hover:text-primary-strong ${FOCUS}`}
          >
            <UserIcon />
            {/* Below 600px the icon stays and the label is read by screen readers. */}
            <span className="sr-only min-[600px]:not-sr-only">
              {signedIn ? header.account : header.signIn}
            </span>
          </Link>
          <Link
            href={localizedPath(locale, "/cart")}
            aria-label={header.cartLabel(count)}
            className={`relative grid h-10 w-11 place-items-center rounded-card text-muted hover:text-primary-strong ${FOCUS}`}
          >
            <CartIcon />
            <span className="absolute end-0.5 top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary-strong px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
      <MainNav label={header.nav} items={navItems} />
    </header>
  );
}
