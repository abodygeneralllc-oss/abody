"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrentNavPath } from "@/lib/nav";

export interface NavItem {
  href: string;
  label: string;
}

interface MainNavProps {
  label: string;
  items: NavItem[];
}

// The header's second row: scrolls sideways on phones rather than wrapping.
export function MainNav({ label, items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="border-t border-border">
      <ul className="mx-auto flex w-full max-w-site gap-6 overflow-x-auto px-4 scrollbar-none min-[700px]:gap-8 min-[700px]:px-8">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isCurrentNavPath(pathname, item.href) ? "page" : undefined}
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
