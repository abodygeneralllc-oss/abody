"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { isCurrentNavPath } from "@/lib/nav";

export interface NavItem {
  href: string;
  label: string;
  // Set for a category link: it is current only on its listing with this
  // `category` value.
  category?: string;
  // Shown only below 600px, where the top bar has no room for the link.
  phoneOnly?: boolean;
}

interface MainNavProps {
  label: string;
  items: NavItem[];
}

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

function isCurrent(item: NavItem, pathname: string, category: string | null) {
  if (item.category === undefined) return isCurrentNavPath(pathname, item.href);
  const path = item.href.split("?")[0];
  return pathname.replace(/\/+$/, "") === path && category === item.category;
}

function NavList({
  label,
  items,
  category,
}: MainNavProps & { category: string | null }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="border-t border-border">
      <ul className="mx-auto flex w-full max-w-site gap-6 overflow-x-auto px-4 scrollbar-none min-[700px]:gap-8 min-[700px]:px-8">
        {items.map((item) => (
          <li
            key={item.href}
            className={`shrink-0 ${item.phoneOnly ? "min-[600px]:hidden" : ""}`}
          >
            <Link
              href={item.href}
              dir="auto"
              aria-current={isCurrent(item, pathname, category) ? "page" : undefined}
              className="block border-b-3 border-transparent py-3 text-sm whitespace-nowrap text-muted -outline-offset-2 hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-strong aria-[current=page]:border-primary aria-[current=page]:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// The header's second row: store categories, then About and Contact. It
// scrolls sideways on phones rather than wrapping. useSearchParams needs a
// Suspense boundary; render it inside one with MainNavFallback.
export function MainNav(props: MainNavProps) {
  const category = useSearchParams().get("category");
  return <NavList {...props} category={category} />;
}

// The Suspense fallback: the same links, with no category marked current.
export function MainNavFallback(props: MainNavProps) {
  return <NavList {...props} category={null} />;
}

// A top-bar link (Products, Services), current on its listing and pages.
export function HeaderNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      aria-current={isCurrentNavPath(pathname, href) ? "page" : undefined}
      className={`hidden h-10 items-center rounded-card px-3 font-medium whitespace-nowrap text-muted hover:text-primary-strong aria-[current=page]:text-foreground min-[600px]:flex ${FOCUS}`}
    >
      {label}
    </Link>
  );
}
