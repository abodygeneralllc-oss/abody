import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AccountEmpty,
  AccountSection,
  DownloadList,
  OrderNumber,
  SectionHead,
  StatusChip,
} from "@/components/account/AccountParts";
import { BoxIcon, DownloadIcon, MegaphoneIcon } from "@/components/icons";
import {
  getAccountCounts,
  listAccountDownloads,
  listAccountOrders,
} from "@/lib/account";
import { localizedName } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatPriceCents } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";

const RECENT_ORDERS = 5;
const RECENT_DOWNLOADS = 3;

const TH =
  "border-b border-border bg-surface px-5 py-3 text-xs font-bold tracking-wider whitespace-nowrap text-muted uppercase rtl:tracking-normal";
const TD = "px-5 py-3";

export async function generateMetadata(): Promise<Metadata> {
  const { account } = await getDictionary();
  return { title: account.title, robots: { index: false, follow: false } };
}

export default async function AccountPage() {
  const locale = await getLocale();
  // The real check: the header link only looks at whether a cookie exists.
  const user = await getCurrentUser();
  if (!user) {
    const next = localizedPath(locale, "/account");
    redirect(`${localizedPath(locale, "/login")}?${new URLSearchParams({ next })}`);
  }
  const { account: text } = await getDictionary();
  const [counts, orders, downloads] = await Promise.all([
    getAccountCounts(user.id),
    listAccountOrders(user.id, RECENT_ORDERS),
    listAccountDownloads(user.id, RECENT_DOWNLOADS),
  ]);
  const stats = [
    { label: text.stats.orders, value: counts.orders, Icon: BoxIcon },
    { label: text.stats.downloads, value: counts.downloads, Icon: DownloadIcon },
    { label: text.stats.services, value: counts.services, Icon: MegaphoneIcon },
  ];

  return (
    <>
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight wrap-break-word rtl:tracking-normal">
          {/* React text: the name never renders as HTML. */}
          {text.welcome.replace("{name}", () => user.name)}
        </h1>
        <p className="text-muted">{text.intro}</p>
      </div>

      <ul className="grid gap-4 min-[600px]:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <li
            key={label}
            className="flex items-center gap-4 rounded-panel border border-border bg-panel p-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-card bg-primary-soft text-primary-strong">
              <Icon className="h-5 w-5" />
            </span>
            <span className="grid">
              <span className="text-sm text-muted">{label}</span>
              <strong className="text-xl leading-tight font-bold">{value}</strong>
            </span>
          </li>
        ))}
      </ul>

      <AccountSection labelledBy="orders-heading">
        <SectionHead
          id="orders-heading"
          title={text.recentOrders}
          link={
            orders.length > 0
              ? { href: localizedPath(locale, "/account/orders"), label: text.allOrders }
              : undefined
          }
        />
        {orders.length === 0 ? (
          <AccountEmpty
            message={text.orders.empty}
            action={{ href: localizedPath(locale, "/products"), label: text.browseProducts }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} text-start`}>{text.columns.order}</th>
                  <th scope="col" className={`${TH} text-start`}>{text.columns.date}</th>
                  <th scope="col" className={`${TH} text-start`}>{text.columns.items}</th>
                  <th scope="col" className={`${TH} text-start`}>{text.columns.status}</th>
                  <th scope="col" className={`${TH} text-end`}>{text.columns.total}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface"
                  >
                    <td className={`${TD} whitespace-nowrap`}>
                      <OrderNumber number={order.number} />
                    </td>
                    <td className={`${TD} whitespace-nowrap`}>
                      {formatDate(order.createdAt, locale)}
                    </td>
                    <td className={`${TD} min-w-48`} dir="auto">
                      {order.items
                        .map((item) => localizedName(item, locale))
                        .join(text.itemSeparator)}
                    </td>
                    <td className={TD}>
                      <StatusChip status={order.status} text={text} badge />
                    </td>
                    <td className={`${TD} text-end whitespace-nowrap tabular-nums`}>
                      <strong dir="ltr" className="font-semibold">
                        {formatPriceCents(order.totalCents)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AccountSection>

      <AccountSection labelledBy="downloads-heading">
        <SectionHead
          id="downloads-heading"
          title={text.recentDownloads}
          link={
            downloads.length > 0
              ? { href: localizedPath(locale, "/account/downloads"), label: text.allDownloads }
              : undefined
          }
        />
        {downloads.length === 0 ? (
          <AccountEmpty message={text.downloads.empty} />
        ) : (
          <DownloadList downloads={downloads} locale={locale} text={text} />
        )}
      </AccountSection>
    </>
  );
}
