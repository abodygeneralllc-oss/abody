import Link from "next/link";
import { signOut } from "@/actions/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { ChevronIcon, LogoutIcon } from "@/components/icons";
import { initials } from "@/lib/account";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

// The shared account frame. Not an auth boundary: layouts do not re-render on
// navigation, so every account page checks the session and redirects itself.
// Without a user this renders only the page, which then redirects.
export default async function AccountLayout({
  children,
}: LayoutProps<"/[lang]/account">) {
  const user = await getCurrentUser();
  if (!user) return children;
  const locale = await getLocale();
  const { account: text } = await getDictionary();
  const path = (rest: string) => localizedPath(locale, `/account${rest}`);

  return (
    <main className="flex-1 font-sans">
      <div className="mx-auto grid w-full max-w-site gap-6 px-4 pt-6 pb-16 min-[700px]:px-8">
        <nav aria-label={text.breadcrumb}>
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <li>
              <Link
                href={localizedPath(locale, "/")}
                className={`rounded-control hover:text-primary-strong ${FOCUS}`}
              >
                {text.home}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
            </li>
            <li aria-current="page" className="text-foreground">
              {text.breadcrumbCurrent}
            </li>
          </ol>
        </nav>

        <div className="grid items-start gap-6 min-[960px]:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-panel border border-border bg-panel">
            <div className="grid justify-items-center gap-1 p-5 text-center">
              <span
                aria-hidden="true"
                className="mb-2 grid size-18 place-items-center rounded-full bg-ink text-lg font-bold text-ink-text"
              >
                {initials(user.name)}
              </span>
              <strong className="max-w-full text-md font-bold wrap-break-word" dir="auto">
                {user.name}
              </strong>
              <span dir="ltr" className="max-w-full text-sm break-all text-muted">
                {user.email}
              </span>
            </div>
            <div className="grid min-w-0 gap-1 border-t border-border p-2">
              <AccountNav
                label={text.navLabel}
                items={[
                  { segment: null, href: path(""), label: text.nav.overview, icon: "overview" },
                  { segment: "orders", href: path("/orders"), label: text.nav.orders, icon: "orders" },
                  { segment: "downloads", href: path("/downloads"), label: text.nav.downloads, icon: "downloads" },
                  { segment: "services", href: path("/services"), label: text.nav.services, icon: "services" },
                  { segment: "settings", href: path("/settings"), label: text.nav.profile, icon: "profile" },
                ]}
              />
              <form action={signOut}>
                <input type="hidden" name="lang" value={locale} />
                <button
                  type="submit"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-card px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground ${FOCUS}`}
                >
                  <LogoutIcon className="h-5 w-5 rtl:-scale-x-100" />
                  {text.signOut}
                </button>
              </form>
            </div>
          </aside>

          <div className="grid min-w-0 gap-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
