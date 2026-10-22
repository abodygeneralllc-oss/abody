import { ServiceStatusChip } from "@/components/account/AccountParts";
import type { ServiceStatus as Status } from "@/lib/generated/prisma/enums";
import { en } from "@/lib/i18n/dictionaries/en";

// The admin's view of a service's work status. Before onboarding there is no
// record, which the admin reads as awaiting the customer.
export function ServiceStatus({ status }: { status: Status | null }) {
  if (status === null) {
    return (
      <span className="inline-flex items-center rounded-control bg-warning-soft px-2 py-0.5 text-xs font-bold whitespace-nowrap text-warning">
        Awaiting details
      </span>
    );
  }
  return <ServiceStatusChip status={status} text={en.account} badge />;
}
