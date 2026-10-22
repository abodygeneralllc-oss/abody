export function CouponStatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-control px-2 py-0.5 text-xs font-bold whitespace-nowrap ${
        active ? "bg-success-soft text-success" : "bg-well text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
