import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// The store's empty-state pattern: icon well, code, title, text, button.
export default async function NotFound() {
  const locale = await getLocale();
  const { notFound } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-site flex-1 px-4 py-12 font-sans min-[700px]:px-8">
      <div className="grid flex-1 content-center justify-items-center gap-2 rounded-panel border border-border px-5 py-16 text-center">
        <span
          aria-hidden="true"
          className="mb-2 grid size-14 place-items-center rounded-full bg-well text-muted"
        >
          <SearchIcon className="size-6" />
        </span>
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-strong uppercase">
          404
        </p>
        <h1 className="text-2xl font-bold">{notFound.title}</h1>
        <p className="max-w-[44ch] text-muted">{notFound.body}</p>
        <Link
          href={localizedPath(locale, "/")}
          className="mt-4 inline-flex h-11 items-center rounded-card bg-primary-strong px-6 font-semibold text-white outline-offset-2 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong"
        >
          {notFound.home}
        </Link>
      </div>
    </main>
  );
}
