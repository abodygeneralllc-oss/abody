import type { Metadata } from "next";
import Link from "next/link";
import { ProductStatusChip } from "@/components/admin/ProductStatusChip";
import { ProductCover } from "@/components/catalog/ProductCover";
import { EditIcon, PlusIcon } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminMetadata, listAdminProducts, requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { formatPriceCents } from "@/lib/money";

export function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Products");
}

const FOCUS =
  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-strong";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts("DIGITAL_PRODUCT");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted">
            Digital products customers download after paying.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={`flex h-11 items-center gap-2 rounded-control bg-primary-strong px-5 text-sm font-semibold text-white hover:bg-primary-hover ${FOCUS}`}
        >
          <PlusIcon className="h-4 w-4" />
          New product
        </Link>
      </div>

      <section
        aria-labelledby="products-title"
        className="min-w-0 overflow-hidden rounded-panel border border-border bg-panel"
      >
        <h2 id="products-title" className="sr-only">
          All products
        </h2>
        {products.length === 0 ? (
          <div className="p-5">
            {/* Not the shared EmptyState: admin links have no hover underline. */}
            <div className="grid justify-items-start gap-3 rounded-card bg-surface p-5 text-sm">
              <p className="text-muted">No products yet.</p>
              <Link
                href="/admin/products/new"
                className={`rounded-control font-semibold text-primary-strong hover:text-primary-hover ${FOCUS}`}
              >
                Create the first product
              </Link>
            </div>
          </div>
        ) : (
          <Table className="min-w-190">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Product</TableHead>
                <TableHead scope="col">Category</TableHead>
                <TableHead scope="col" className="text-end">Price</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Featured</TableHead>
                <TableHead scope="col">File</TableHead>
                <TableHead scope="col">Updated</TableHead>
                <TableHead scope="col">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductCover product={product} locale="en" index={index} alt="" variant="thumb" />
                      <div className="min-w-0">
                        {/* React text: admin-entered names never render as HTML. */}
                        <Link
                          href={`/admin/products/${product.id}`}
                          className={`rounded-control font-semibold text-foreground hover:text-primary-strong ${FOCUS}`}
                          dir="auto"
                        >
                          {product.name}
                        </Link>
                        {product.nameAr ? (
                          <span lang="ar" dir="rtl" className="block text-left text-sm text-muted">
                            {product.nameAr}
                          </span>
                        ) : (
                          <span className="block text-xs text-faint">
                            No Arabic name yet · shows English
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted" dir="auto">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {formatPriceCents(product.priceCents)}
                  </TableCell>
                  <TableCell>
                    <ProductStatusChip status={product.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted tabular-nums">
                    {product.featuredRank !== null ? (
                      <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
                        {product.featuredRank}
                      </span>
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">Not featured</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.hasFile ? (
                      <span className="inline-flex items-center rounded-control bg-well px-2 py-0.5 text-xs font-bold whitespace-nowrap text-muted">
                        Attached
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-control bg-warning-soft px-2 py-0.5 text-xs font-bold whitespace-nowrap text-warning">
                        Missing
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-faint">
                    {formatDate(product.updatedAt, "en")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Link
                      href={`/admin/products/${product.id}`}
                      aria-label={`Edit ${product.name}`}
                      className={`inline-grid size-8 place-items-center rounded-full border border-border-strong text-muted hover:border-foreground hover:text-foreground ${FOCUS}`}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  );
}
