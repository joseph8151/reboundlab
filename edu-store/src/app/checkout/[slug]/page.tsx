import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice } from "@/components/demo-notice";
import { ProductCover } from "@/components/product-cover";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { gradeLabel, subjectLabel, typeLabel } from "@/lib/catalog";
import { hasPurchased } from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isTossConfigured } from "@/lib/toss";
import { formatPrice } from "@/lib/utils";
import { CheckoutWidget } from "./checkout-widget";

export const metadata: Metadata = { title: "주문·결제", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const ready = isSupabaseConfigured() && isTossConfigured();
  const user = ready ? await getCurrentUser() : null;
  const owned = user ? await hasPurchased(user.id, product.id) : false;

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold">주문·결제</h1>

      <section className="mt-6 flex gap-4 rounded-2xl border border-border p-4 sm:p-5">
        <ProductCover product={product} className="w-28 shrink-0 rounded-lg sm:w-36" sizes="144px" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {subjectLabel(product.subject)} · {product.grades.map(gradeLabel).join("·")} · {typeLabel(product.type)}
          </p>
          <p className="mt-1 font-bold leading-snug">{product.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">PDF {product.pageCount}쪽 · 디지털 콘텐츠</p>
          <p className="mt-2 text-lg font-bold">{formatPrice(product.price)}</p>
        </div>
      </section>

      <div className="mt-6">
        {!ready ? (
          <DemoNotice>
            데모 모드입니다. 결제를 테스트하려면 <code>.env.local</code>에 Supabase와 토스페이먼츠 테스트 키를 설정하고,{" "}
            <code>supabase/schema.sql</code>·<code>seed.sql</code>을 실행한 뒤 관리자 페이지에서 PDF를 등록해 주세요. 자세한 방법은 README를 참고하세요.
          </DemoNotice>
        ) : owned ? (
          <div className="rounded-2xl bg-accent p-6">
            <p className="font-bold">이미 구매한 자료입니다</p>
            <p className="mt-1 text-sm text-muted-foreground">내 자료함에서 바로 내려받을 수 있습니다.</p>
            <Button asChild className="mt-4">
              <Link href="/mypage">내 자료함으로 이동</Link>
            </Button>
          </div>
        ) : (
          <CheckoutWidget
            clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!}
            customerKey={user!.id}
            slug={product.slug}
            price={product.price}
          />
        )}
      </div>
    </div>
  );
}
