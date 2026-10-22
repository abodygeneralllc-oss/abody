import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthForm, type AuthMode } from "@/components/auth/AuthForm";
import {
  ChevronIcon,
  DownloadIcon,
  MegaphoneIcon,
  ShieldIcon,
} from "@/components/icons";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

interface AuthPanelProps {
  mode: AuthMode;
  locale: Locale;
  next: string;
  text: Dictionary["auth"];
  // A confirmation shown above the form, such as after a password reset.
  notice?: string;
  // Register only; null when the bot check is off.
  turnstileSiteKey?: string | null;
}

// Segmented switch: the current tab is a raised white segment.
const TAB =
  "grid h-10 place-items-center rounded-full text-sm font-semibold text-muted outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-strong aria-[current=page]:bg-panel aria-[current=page]:text-foreground aria-[current=page]:shadow-[0_1px_2px_oklch(22%_0.05_256/0.12),0_2px_8px_-4px_oklch(22%_0.05_256/0.2)]";

export const TEXT_LINK =
  "cursor-pointer rounded-control font-semibold text-primary-strong outline-offset-2 transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong";

// The sign-in and register pages share this panel; the tabs are links, so
// each mode has its own URL and works without JavaScript.
export function AuthPanel({
  mode,
  locale,
  next,
  text,
  notice,
  turnstileSiteKey,
}: AuthPanelProps) {
  const isRegister = mode === "register";
  // Only a non-default next is carried, so plain links stay clean.
  const query =
    next === localizedPath(locale, "/account")
      ? ""
      : `?${new URLSearchParams({ next }).toString()}`;
  const tabs = [
    { mode: "signIn", href: `${localizedPath(locale, "/login")}${query}`, label: text.signInTab },
    { mode: "register", href: `${localizedPath(locale, "/register")}${query}`, label: text.registerTab },
  ] as const;
  const other = isRegister ? tabs[0] : tabs[1];

  return (
    <AuthShell
      locale={locale}
      text={text}
      current={isRegister ? text.registerTab : text.signInTab}
    >
      <nav aria-label={text.tabs} className="grid grid-cols-2 rounded-full bg-well p-1">
        {tabs.map((tab) => {
          const current = tab.mode === mode;
          return (
            <Link
              key={tab.mode}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={TAB}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div>
        <h1 className="text-3xl font-bold">
          {isRegister ? text.registerHeading : text.signInHeading}
        </h1>
        <p className="mt-2 text-muted">
          {isRegister ? text.registerIntro : text.signInIntro}
        </p>
      </div>
      {notice && (
        <p role="status" className="rounded-control bg-primary-soft px-4 py-3 text-sm text-foreground">
          {notice}
        </p>
      )}
      <AuthForm
        mode={mode}
        locale={locale}
        next={next}
        turnstileSiteKey={turnstileSiteKey}
        text={{
          name: text.name,
          email: text.email,
          password: text.password,
          passwordHint: text.passwordHint,
          confirm: text.confirm,
          showPassword: text.showPassword,
          hidePassword: text.hidePassword,
          submit: isRegister ? text.submitRegister : text.submitSignIn,
          pending: isRegister ? text.registering : text.signingIn,
          forgotLink: text.forgotLink,
          errors: text.errors,
          fieldErrors: text.fieldErrors,
        }}
      />
      <p className="border-t border-border pt-5 text-center text-sm text-muted">
        {isRegister ? text.toSignIn : text.toRegister}{" "}
        <Link href={other.href} className={TEXT_LINK}>
          {isRegister ? text.toSignInLink : text.toRegisterLink}
        </Link>
      </p>
    </AuthShell>
  );
}

interface AuthShellProps {
  locale: Locale;
  text: Dictionary["auth"];
  // The breadcrumb's current page.
  current: string;
  children: ReactNode;
}

// The breadcrumb, photo column, and form column every sign-in page shares.
export function AuthShell({ locale, text, current, children }: AuthShellProps) {
  const artCards = [
    { icon: DownloadIcon, ...text.artCards.downloads },
    { icon: MegaphoneIcon, ...text.artCards.services },
    { icon: ShieldIcon, ...text.artCards.protected },
  ];

  return (
    <main className="mx-auto grid w-full max-w-site gap-5 px-4 pt-6 pb-16 font-sans min-[700px]:px-8">
      <nav
        aria-label={text.breadcrumb}
        className="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link
          href={localizedPath(locale, "/")}
          className="rounded-control outline-offset-2 hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          {text.home}
        </Link>
        <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
        <span aria-current="page" className="font-semibold text-foreground">
          {current}
        </span>
      </nav>

      <section className="grid gap-3 rounded-[20px] border border-border bg-panel p-3 shadow-[0_24px_60px_-32px_oklch(22%_0.05_256/0.3)] min-[900px]:grid-cols-2">
        <div className="relative isolate hidden min-h-155 flex-col justify-between gap-12 overflow-hidden rounded-[14px] bg-ink p-12 text-ink-text min-[900px]:flex">
          {/* Decorative: the heading beside it says what the page is for.
              Unsplash photo-1563013544-824ae1b704d3 (Unsplash License). */}
          <Image
            src="/auth/shopping-online.jpg"
            alt=""
            fill
            sizes="(min-width: 1200px) 580px, 50vw"
            className="-z-20 object-cover object-[70%_center]"
          />
          {/* Darkens the photo so white text keeps its contrast. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-160 from-ink/95 via-ink/55 to-[oklch(30%_0.1_250/0.9)]"
          />
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-[oklch(75%_0.15_155)] shadow-[0_0_0_4px_oklch(75%_0.15_155/0.25)]"
              />
              {text.artEyebrow}
            </p>
            <h2 className="mt-5 max-w-[14ch] text-3xl font-bold">{text.artTitle}</h2>
            <p className="mt-3 max-w-[38ch] text-ink-muted">{text.artBody}</p>
          </div>
          <ul aria-hidden="true" className="grid max-w-80 gap-3">
            {artCards.map(({ icon: Icon, title, body }, index) => (
              <li
                key={title}
                className={`flex items-center gap-3 rounded-panel bg-panel/96 px-4 py-3 text-sm text-foreground shadow-float ${
                  index === 1 ? "ms-12 -me-12" : ""
                }`}
              >
                <span className="grid size-9.5 shrink-0 place-items-center rounded-card bg-primary-soft text-primary-strong">
                  <Icon />
                </span>
                <span>
                  <strong className="block">{title}</strong>
                  <span className="block text-xs text-muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto grid w-full max-w-105 content-center gap-6 px-3 py-10 min-[600px]:px-5 min-[900px]:py-12">
          {children}
        </div>
      </section>
    </main>
  );
}
