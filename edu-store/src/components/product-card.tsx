import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { gradeLabel, subjectLabel, typeLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { ProductCover } from "./product-cover";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(15,31,61,0.25)]">
      <Link href={`/products/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <ProductCover product={product} className="transition-transform duration-300 group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge>{subjectLabel(product.subject)}</Badge>
          <Badge variant="muted">{product.grades.map(gradeLabel).join("·")}</Badge>
          <Badge variant="gold">{typeLabel(product.type)}</Badge>
        </div>
        <h3 className="mt-3 text-[17px] font-bold leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3.5" /> PDF {product.pageCount}쪽
            </p>
          </div>
          <Link
            href={`/products/${product.slug}#preview`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-semibold text-primary hover:bg-accent"
          >
            <Eye className="size-4" /> 미리보기
          </Link>
        </div>
      </div>
    </article>
  );
}
