import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/session";

// Also what everyone but an admin sees, so it never mentions the admin area.
// For an admin it sits inside the layout's <main>, so it renders a section.
export default async function AdminNotFound() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const Wrapper = isAdmin ? "section" : "main";

  return (
    <Wrapper
      className={`grid flex-1 place-items-center px-4 py-16 ${
        isAdmin
          ? ""
          : "bg-[radial-gradient(60%_50%_at_50%_30%,var(--color-primary-soft),transparent_70%)]"
      }`}
    >
      <div className="grid max-w-md justify-items-center gap-2 text-center">
        {!isAdmin && (
          <p className="mb-6 text-lg font-bold text-primary-strong">Abody</p>
        )}
        <span
          aria-hidden="true"
          className="mb-2 grid size-14 place-items-center rounded-full bg-well text-muted"
        >
          <SearchIcon className="size-6" />
        </span>
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-strong uppercase">
          404
        </p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/en"
          className="mt-4 inline-flex h-11 items-center rounded-card bg-primary-strong px-6 font-semibold text-white outline-offset-2 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          Go to the store
        </Link>
      </div>
    </Wrapper>
  );
}
