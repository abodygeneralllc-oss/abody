import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  EmptyState,
  OrderNumber,
  StatusChip,
} from "@/components/account/AccountParts";
import {
  BoxIcon,
  CalendarIcon,
  ChartIcon,
  ChevronIcon,
  GridIcon,
  MegaphoneIcon,
  UsersIcon,
} from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/account";
import { adminMetadata, getAdminOverview, requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { en } from "@/lib/i18n/dictionaries/en";
import { formatPriceCents } from "@/lib/money";

export function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Dashboard");
}

interface Stat {
  label: string;
  value: string;
  detail: string;
  Icon: ComponentType<{ className?: string }>;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const overview = await getAdminOverview();

  const stats: Stat[] = [
    {
      label: "Revenue",
      value: formatPriceCents(overview.revenueCents),
      detail: `from ${plural(overview.paidOrders, "paid order", "paid orders")}`,
      Icon: ChartIcon,
    },
    {
      label: "Orders",
      value: String(overview.paidOrders),
      detail: `paid, ${overview.pendingOrders} pending`,
      Icon: BoxIcon,
    },
    {
      label: "Customers",
      value: String(overview.customers),
      detail: "registered accounts",
      Icon: UsersIcon,
    },
    {
      label: "Products",
      value: String(overview.products.published),
      detail: `published of ${overview.products.total}`,
      Icon: GridIcon,
    },
    {
      label: "Services",
      value: String(overview.services.published),
      detail: `published of ${overview.services.total}`,
      Icon: MegaphoneIcon,
    },
    {
      label: "Active services",
      value: String(overview.activeServices),
      detail: "awaiting details or in progress",
      Icon: MegaphoneIcon,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">
            An overview of the store. Revenue is all time.
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-muted">
          <CalendarIcon className="h-4 w-4" />
          {formatDate(new Date(), "en")}
        </p>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Store totals
        </h2>
        <dl className="grid gap-4 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
          {stats.map(({ label, value, detail, Icon }) => (
            // A dl group may hold only dt and dd, so the decorative icon sits
            // inside the term and is positioned at the panel's top end.
            <div
              key={label}
              className="relative grid content-start gap-2 rounded-panel border border-border bg-panel p-5"
            >
              <dt className="pe-8 text-sm text-muted">
                <span aria-hidden="true" className="absolute inset-e-5 top-5 text-faint">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </dt>
              <dd className="text-2xl font-bold tracking-tight tabular-nums">{value}</dd>
              <dd className="text-xs text-faint">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="recent-orders"
        className="min-w-0 overflow-hidden rounded-panel border border-border bg-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id="recent-orders" className="text-md font-semibold">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 rounded-control text-sm font-semibold text-primary-strong outline-offset-2 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong"
          >
            View all orders
            <ChevronIcon className="h-4 w-4" />
          </Link>
        </div>
        {overview.recentOrders.length === 0 ? (
          <div className="p-5">
            <EmptyState message="No orders yet." />
          </div>
        ) : (
          <Table className="min-w-170">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Order</TableHead>
                <TableHead scope="col">Customer</TableHead>
                <TableHead scope="col" className="text-end">Items</TableHead>
                <TableHead scope="col">Date</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-end">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-control text-primary-strong outline-offset-2 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong"
                    >
                      <OrderNumber number={order.number} />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[0.6875rem] font-bold text-ink-text"
                      >
                        {initials(order.customer)}
                      </span>
                      {/* React text: names and emails never render as HTML. */}
                      <span className="max-w-56 break-all" dir="auto">
                        {order.customer}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{order.itemCount}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    {formatDate(order.createdAt, "en")}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={order.status} text={en.account} badge />
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {formatPriceCents(order.totalCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}
