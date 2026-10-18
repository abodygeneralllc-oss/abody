const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatPriceCents(priceCents: number): string {
  return gbp.format(priceCents / 100);
}
