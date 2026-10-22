import type { ProductStatus } from "@/lib/generated/prisma/enums";

export function ProductStatusChip({ status }: { status: ProductStatus }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex items-center rounded-control px-2 py-0.5 text-xs font-bold whitespace-nowrap ${
        published ? "bg-success-soft text-success" : "bg-well text-muted"
      }`}
    >
      {published ? "Published" : "Unpublished"}
    </span>
  );
}
