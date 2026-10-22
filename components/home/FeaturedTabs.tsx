"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";

export interface FeaturedTab {
  id: string;
  label: string;
  // Rendered on the server; this component only shows or hides it.
  panel: ReactNode;
}

interface FeaturedTabsProps {
  // The section title, intro, and link, shown above the tabs.
  head: ReactNode;
  label: string;
  dir: "ltr" | "rtl";
  tabs: FeaturedTab[];
}

// WAI-ARIA tabs with automatic activation: arrow keys move and select.
export function FeaturedTabs({ head, label, dir, tabs }: FeaturedTabsProps) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    setSelected(index);
    buttons.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
    // Arrows follow the visual order, which mirrors in Arabic.
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next: number;
    if (event.key === forward) next = selected === last ? 0 : selected + 1;
    else if (event.key === back) next = selected === 0 ? last : selected - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    select(next);
  }

  return (
    <>
      {head}
      {/* Underline tabs on a bottom rule; they scroll sideways if they overflow.
          The scrollbar is hidden so it never shows beside the tabs. */}
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="mb-6 flex gap-6 overflow-x-auto overflow-y-hidden border-b border-border scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={index === selected}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => select(index)}
            className="-mb-px cursor-pointer border-b-3 border-transparent pb-3 font-bold whitespace-nowrap text-muted -outline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-strong aria-selected:border-primary aria-selected:text-foreground"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={index !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
