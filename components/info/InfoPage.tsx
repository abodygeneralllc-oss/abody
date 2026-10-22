import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronIcon } from "@/components/icons";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { pageMetadata } from "@/lib/seo";

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

// Each key is also the page's unprefixed path: "about" is /<lang>/about.
export type InfoPageKey = keyof Dictionary["info"];

export async function infoMetadata(page: InfoPageKey): Promise<Metadata> {
  const { info, meta } = await getDictionary();
  return pageMetadata({
    locale: await getLocale(),
    path: `/${page}`,
    title: info[page].title,
    description: info[page].description,
    siteName: meta.title,
  });
}

// The dictionary infers a different section type per page; every one fits this.
interface InfoSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

interface InfoPageProps {
  page: InfoPageKey;
  // Shown under the intro, such as the contact email.
  children?: ReactNode;
}

export async function InfoPage({ page, children }: InfoPageProps) {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const text = dictionary.info[page];
  const sections: InfoSection[] = text.sections;

  return (
    <div className="flex-1 font-sans">
      <main className="mx-auto w-full max-w-site px-4 pt-6 pb-16 min-[700px]:px-8">
        <nav
          aria-label={dictionary.cart.breadcrumb}
          className="flex flex-wrap items-center gap-2 text-sm text-muted"
        >
          <Link
            href={localizedPath(locale, "/")}
            className={`rounded-control hover:text-primary-strong ${FOCUS}`}
          >
            {dictionary.header.home}
          </Link>
          <ChevronIcon className="h-3 w-3 text-faint rtl:-scale-x-100" />
          <span aria-current="page" className="text-foreground">
            {text.title}
          </span>
        </nav>

        <header className="max-w-[72ch] pt-3 pb-8">
          <h1 className="text-3xl font-bold tracking-tight">{text.title}</h1>
          <p className="mt-2 text-md text-muted">{text.intro}</p>
          {children}
        </header>

        {/* Plain sections with dividers, like the detail page's body. */}
        <div className="grid max-w-[72ch]">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="grid gap-3 border-t border-border py-7"
            >
              <h2 className="text-xl font-bold">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-muted">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="grid list-disc gap-2 ps-5 text-muted">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
