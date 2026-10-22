import { CheckIcon, MinusIcon } from "@/components/icons";
import { formatDate } from "@/lib/dates";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { ProgressStep, ProgressStepState } from "@/lib/service-progress";

const MARKERS: Record<ProgressStepState, string> = {
  done: "bg-primary text-white",
  current: "border-[3px] border-primary bg-panel ring-4 ring-primary-soft",
  upcoming: "border-[3px] border-border bg-panel",
};
// A cancellation is reached but is not a success, so it never gets the check.
const CANCELLED_MARKER = "bg-danger text-white";

// The line from each marker to the next. The current step is half filled,
// from the start side, so it mirrors in Arabic.
const CONNECTORS: Record<ProgressStepState, string> = {
  done: "bg-primary",
  current:
    "bg-linear-to-r from-primary from-50% to-border to-50% rtl:bg-linear-to-l",
  upcoming: "bg-border",
};

// The service timeline: a vertical list on phones, a horizontal track from
// 600px. Each step says its state in words for screen readers, so the marker
// colors are never the only signal.
export function ServiceProgress({
  steps,
  locale,
  text,
}: {
  steps: ProgressStep[];
  locale: Locale;
  text: Dictionary["account"]["service"];
}) {
  return (
    <ol className="grid gap-4 min-[600px]:flex min-[600px]:gap-0">
      {steps.map((step) => {
        const cancelled = step.key === "cancelled";
        return (
          <li
            key={step.key}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex items-start gap-3 min-[600px]:block min-[600px]:min-w-0 min-[600px]:flex-1 min-[600px]:pt-8"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-2.25 hidden h-0.75 min-[600px]:block ${
                cancelled ? "bg-border" : CONNECTORS[step.state]
              }`}
            />
            <span
              aria-hidden="true"
              className={`relative mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full min-[600px]:absolute min-[600px]:inset-s-0 min-[600px]:top-0 min-[600px]:mt-0 min-[600px]:size-5 ${
                cancelled ? CANCELLED_MARKER : MARKERS[step.state]
              }`}
            >
              {cancelled ? (
                <MinusIcon className="h-3.5 w-3.5" />
              ) : (
                step.state === "done" && <CheckIcon className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="grid gap-0.5 min-[600px]:pe-3">
              <span
                className={`text-sm ${
                  step.state === "upcoming" ? "text-faint" : "font-bold"
                }`}
              >
                {text.steps[step.key]}
                <span className="sr-only">
                  {" ("}
                  {text.stepState[step.state]}
                  {")"}
                </span>
              </span>
              {step.date && (
                <span className="text-xs text-muted">
                  {formatDate(step.date, locale)}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
