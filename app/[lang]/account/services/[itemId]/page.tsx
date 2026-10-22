import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ACCOUNT_PANEL,
  OrderNumber,
  PANEL_BODY,
  PRIMARY_BUTTON,
  SectionHead,
  ServiceStatusChip,
} from "@/components/account/AccountParts";
import { ServiceProgress } from "@/components/account/ServiceProgress";
import { ArrowIcon } from "@/components/icons";
import { OnboardingAnswers } from "@/components/onboarding/OnboardingAnswers";
import { findAccountService } from "@/lib/account";
import { localizedName } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import {
  canEditOnboarding,
  onboardingState,
  readRequirements,
} from "@/lib/onboarding";
import { serviceProgress } from "@/lib/service-progress";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary();
  return { title: account.service.title, robots: { index: false, follow: false } };
}

// One purchased service's progress and the details the customer sent. Only
// the signed-in owner of the order can open it.
export default async function AccountServicePage({
  params,
}: PageProps<"/[lang]/account/services/[itemId]">) {
  const { itemId } = await params;
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    const next = localizedPath(
      locale,
      `/account/services/${encodeURIComponent(itemId)}`,
    );
    redirect(`${localizedPath(locale, "/login")}?${new URLSearchParams({ next })}`);
  }
  const item = await findAccountService(user.id, itemId);
  if (!item) notFound();

  const saved = item.service ? readRequirements(item.service.requirements) : null;
  if (item.service && !saved) {
    throw new Error(`Service for order item ${item.itemId} has malformed requirements`);
  }
  const progress = serviceProgress(item);
  const editable = canEditOnboarding(progress.status);
  // No details yet, or the team asked for more: the customer has to act.
  const actionNeeded = onboardingState(progress.status) === "needed";
  const { account, onboarding } = await getDictionary();
  const text = account.service;
  const onboardingLink = {
    href: localizedPath(locale, `/onboarding/${encodeURIComponent(item.itemId)}`),
    label: item.service ? onboarding.edit : onboarding.add,
  };

  return (
    <>
      <div className="grid gap-3">
        <Link
          href={localizedPath(locale, "/account/services")}
          className="inline-flex items-center gap-1 justify-self-start rounded-control text-sm font-bold text-primary-strong outline-offset-2 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          <ArrowIcon className="h-4 w-4 -scale-x-100 rtl:scale-x-100" />
          {text.back}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1
            dir="auto"
            className="text-2xl font-bold tracking-tight wrap-break-word rtl:tracking-normal"
          >
            {localizedName(item, locale)}
          </h1>
          <ServiceStatusChip status={progress.status} text={account} badge />
        </div>
        <p className="text-sm text-muted">
          {account.purchased.replace("{date}", formatDate(item.purchasedAt, locale))}
          {" · "}
          {account.orderLabel} <OrderNumber number={item.orderNumber} />
        </p>
      </div>

      <section aria-labelledby="service-progress" className={ACCOUNT_PANEL}>
        <SectionHead id="service-progress" title={text.progress} />
        <div className="grid gap-5 p-5">
          <ServiceProgress steps={progress.steps} locale={locale} text={text} />
          <div className="grid gap-3 rounded-card bg-surface p-4 text-sm">
            <p>{text.messages[progress.status ?? "none"]}</p>
            <p className="text-muted">
              {text.lastUpdated.replace(
                "{date}",
                formatDate(progress.lastUpdated, locale),
              )}
            </p>
            {actionNeeded && (
              <Link
                href={onboardingLink.href}
                className={`justify-self-start ${PRIMARY_BUTTON}`}
              >
                {onboardingLink.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="service-details" className={ACCOUNT_PANEL}>
        <SectionHead
          id="service-details"
          title={text.details}
          link={editable ? onboardingLink : undefined}
        />
        <div className={PANEL_BODY}>
          {saved ? (
            <OnboardingAnswers answers={saved} text={onboarding} />
          ) : (
            <p className="text-muted">{text.noDetails}</p>
          )}
        </div>
      </section>
    </>
  );
}
