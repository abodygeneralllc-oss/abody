import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, DownloadIcon } from "@/components/icons";
import type { AccountDownload } from "@/lib/account";
import { localizedName } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import type { OrderStatus, ServiceStatus } from "@/lib/generated/prisma/enums";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { formatOrderNumber } from "@/lib/orders";

type AccountText = Dictionary["account"];

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

// A bordered account panel. Content that is not a flush list or table sits in
// PANEL_BODY inside it.
export const ACCOUNT_PANEL =
  "min-w-0 overflow-hidden rounded-panel border border-border bg-panel";
export const PANEL_BODY = "grid gap-4 p-5";

// Used by admin and sign-in pages too, so its look stays as it is.
export const TEXT_LINK =
  "cursor-pointer rounded-control font-semibold text-primary-strong outline-offset-2 transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong";

export const OUTLINE_PILL = `inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border-strong bg-panel px-4 text-sm font-semibold text-foreground hover:border-foreground ${FOCUS}`;
export const PRIMARY_PILL = `inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-strong px-5 text-sm font-semibold text-white hover:bg-primary-hover ${FOCUS}`;

// The mockup's arrow link: bold brand text with a trailing arrow.
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-control text-sm font-bold text-primary-strong hover:text-primary-hover ${FOCUS}`}
    >
      {children}
      <ArrowIcon className="h-4 w-4 rtl:-scale-x-100" />
    </Link>
  );
}

const CHIP =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap";
// The redesign badge, used by the customer account. Admin keeps CHIP until 31e.
const BADGE =
  "inline-flex items-center rounded-control px-2 py-0.5 text-xs font-bold whitespace-nowrap";

const STATUS_TONES: Record<OrderStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  PAID: "bg-primary-soft text-primary-strong",
  PROCESSING: "bg-primary-soft text-primary-strong",
  COMPLETED: "bg-success-soft text-success",
  CANCELLED: "bg-danger-soft text-danger",
  REFUNDED: "bg-danger-soft text-danger",
};

// Mockup tones: paid and completed are good news, ended orders are neutral.
const BADGE_TONES: Record<OrderStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  PAID: "bg-success-soft text-success",
  PROCESSING: "bg-primary-soft text-primary-strong",
  COMPLETED: "bg-success-soft text-success",
  CANCELLED: "bg-well text-muted",
  REFUNDED: "bg-well text-muted",
};

export function StatusChip({
  status,
  text,
  badge = false,
}: {
  status: OrderStatus;
  text: AccountText;
  badge?: boolean;
}) {
  return (
    <span
      className={badge ? `${BADGE} ${BADGE_TONES[status]}` : `${CHIP} ${STATUS_TONES[status]}`}
    >
      {text.status[status]}
    </span>
  );
}

const SERVICE_STATUS_TONES: Record<ServiceStatus | "none", string> = {
  none: "bg-warning-soft text-warning",
  NEW: "bg-primary-soft text-primary-strong",
  WAITING_FOR_INFORMATION: "bg-warning-soft text-warning",
  IN_PROGRESS: "bg-primary-soft text-primary-strong",
  COMPLETED: "bg-success-soft text-success",
  CANCELLED: "bg-danger-soft text-danger",
};

// A purchased service's status; null means no onboarding details yet.
export function ServiceStatusChip({
  status,
  text,
  badge = false,
}: {
  status: ServiceStatus | null;
  text: AccountText;
  badge?: boolean;
}) {
  const key = status ?? "none";
  return (
    <span className={`${badge ? BADGE : CHIP} ${SERVICE_STATUS_TONES[key]}`}>
      {text.serviceStatus[key]}
    </span>
  );
}

export function OrderNumber({ number }: { number: number }) {
  return (
    <span dir="ltr" className="font-mono font-semibold">
      {formatOrderNumber(number)}
    </span>
  );
}

// A panel's head row: the title and an optional arrow link, over a rule.
export function SectionHead({
  id,
  title,
  link,
}: {
  id: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <h2 id={id} className="text-md font-bold tracking-normal">
        {title}
      </h2>
      {link && <ArrowLink href={link.href}>{link.label}</ArrowLink>}
    </div>
  );
}

// Kept for the admin analytics page; account pages use AccountEmpty.
export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid justify-items-start gap-3 rounded-card bg-surface p-5 text-sm">
      <p className="text-muted">{message}</p>
      {action && (
        <Link href={action.href} className={TEXT_LINK}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

// An empty list inside an account panel.
export function AccountEmpty({
  message,
  action,
}: {
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid justify-items-center gap-4 px-5 py-10 text-center text-sm">
      <p className="max-w-[44ch] text-muted">{message}</p>
      {action && (
        <Link href={action.href} className={OUTLINE_PILL}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function PageHead({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-bold tracking-tight rtl:tracking-normal">{title}</h1>
      <p className="text-muted">{intro}</p>
    </div>
  );
}

export function DownloadList({
  downloads,
  locale,
  text,
}: {
  downloads: AccountDownload[];
  locale: Locale;
  text: AccountText;
}) {
  return (
    <ul>
      {downloads.map((item) => {
        const name = localizedName(item, locale);
        const query = new URLSearchParams({ session_id: item.checkoutSessionId });
        return (
          <li
            key={item.itemId}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-3 last:border-b-0"
          >
            <div className="grid min-w-0 flex-1 gap-0.5">
              <strong className="text-sm font-bold wrap-break-word" dir="auto">
                {name}
              </strong>
              <span className="text-xs text-muted">
                {text.purchased.replace(
                  "{date}",
                  formatDate(item.purchasedAt, locale),
                )}
                {" · "}
                {text.orderLabel} <OrderNumber number={item.orderNumber} />
              </span>
            </div>
            <a
              href={`/api/downloads/${encodeURIComponent(item.itemId)}?${query}`}
              download
              className={`${OUTLINE_PILL} w-full min-[600px]:w-auto`}
            >
              <DownloadIcon className="h-4 w-4" />
              {/* The whole name lives in the sr-only span: splitting it around
                  the visible word adds a space before ":". */}
              <span aria-hidden="true">{text.download}</span>
              <span className="sr-only">
                {text.download}
                {": "}
                <span dir="auto">{name}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function AccountSection({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={labelledBy} className={ACCOUNT_PANEL}>
      {children}
    </section>
  );
}
