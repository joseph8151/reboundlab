import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "@/components/demo-notice";
import { Badge } from "@/components/ui/badge";
import { getAdminUser } from "@/lib/auth";
import { subjectLabel, typeLabel } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatPrice } from "@/lib/utils";
import { AttachPdfButton, PublishToggle } from "./product-actions";
import { ProductForm } from "./product-form";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page max-w-3xl py-14">
        <h1 className="text-2xl font-bold">관리자</h1>
        <div className="mt-6">
          <DemoNotice>데모 모드입니다. Supabase를 연결하고 ADMIN_EMAILS에 관리자 이메일을 넣으면 상품 등록이 가능합니다.</DemoNotice>
        </div>
      </div>
    );
  }

  const admin = await getAdminUser();
  if (!admin) {
    return (
      <div className="container-page max-w-3xl py-14">
        <h1 className="text-2xl font-bold">접근 권한이 없습니다</h1>
        <p className="mt-2 text-muted-foreground">관리자 계정(ADMIN_EMAILS)으로 로그인해 주세요.</p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase.from("products").select("id, slug, title, subject, type, price, file_path, is_published").order("created_at", { ascending: false }),
    supabase.from("orders").select("order_id, product_title, amount, status, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-2xl font-bold">관리자</h1>
      <p className="mt-1 text-sm text-muted-foreground">{admin.email}</p>

      <section className="mt-10">
        <h2 className="text-lg font-bold">등록된 상품 ({products?.length ?? 0})</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">상품</th>
                <th className="px-4 py-3 font-medium">분류</th>
                <th className="px-4 py-3 font-medium">가격</th>
                <th className="px-4 py-3 font-medium">PDF</th>
                <th className="px-4 py-3 font-medium">공개</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.slug}`} className="font-medium hover:text-primary">{p.title}</Link>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">{subjectLabel(p.subject)} · {typeLabel(p.type)}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.file_path ? <Badge variant="success">연결됨</Badge> : <AttachPdfButton productId={p.id} />}
                  </td>
                  <td className="px-4 py-3"><PublishToggle productId={p.id} published={p.is_published} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold">최근 주문</h2>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border text-sm">
          {orders?.length ? (
            orders.map((o) => (
              <li key={o.order_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="font-medium">{o.product_title}</span>
                <span className="text-muted-foreground">{o.order_id}</span>
                <span>{formatPrice(o.amount)}</span>
                <Badge variant={o.status === "paid" ? "success" : "muted"}>{o.status}</Badge>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-muted-foreground">아직 주문이 없습니다.</li>
          )}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">환불은 토스페이먼츠 상점관리자에서 결제 취소 후, 웹훅으로 주문 상태가 자동 반영됩니다.</p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-lg font-bold">새 상품 등록</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF는 비공개 버킷에, 썸네일·샘플 이미지는 공개 버킷에 저장됩니다. 샘플 이미지는 워터마크를 넣은 저해상도 이미지로 올려 주세요.
        </p>
        <div className="mt-6">
          <ProductForm />
        </div>
      </section>
    </div>
  );
}
