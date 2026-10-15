import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { areaLabel, deliveryLabel, kindLabel, statusLabel } from "@/lib/catalog";
import { CONSULT_ENDPOINT } from "@/lib/consult";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const shell = (children: React.ReactNode) => <div className="container-page max-w-5xl py-10 md:py-14">{children}</div>;
  if (!isSupabaseConfigured()) return shell(<><h1 className="text-[28px] font-bold">관리자</h1><p className="mt-4 text-muted-foreground">교재 데이터베이스(Supabase)를 연결하고 ADMIN_EMAILS에 관리자 이메일을 설정하면 교재 등록이 가능합니다.</p></>);
  const admin = await getAdminUser();
  if (!admin) return shell(<><h1 className="text-[28px] font-bold">접근 권한이 없습니다</h1><p className="mt-4 text-muted-foreground">관리자 계정으로 로그인해 주세요.</p></>);

  const { status } = await searchParams;
  const db = createAdminClient();
  let q = db.from("products").select("id, sku, slug, title, area, kind, price, sale_price, status, delivery_type, featured_rank").order("featured_rank", { ascending: true, nullsFirst: false }).order("title");
  if (status) q = q.eq("status", status);
  const [{ data: products }, { data: bundles }] = await Promise.all([
    q,
    db.from("bundles").select("id, slug, title, price, status, bundle_items(product_id)").order("title"),
  ]);

  return shell(
    <>
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-[28px] font-bold tracking-[-0.03em]">관리자</h1><p className="mt-1 text-[13px] text-muted-foreground">{admin.email}</p></div>
        <Link href="/admin/products/new" className="border-b border-foreground pb-0.5 text-[14px] font-semibold">교재 등록</Link>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[18px] font-bold">교재 {products?.length ?? 0}권</h2>
          <nav className="flex gap-4 text-[13px] text-muted-foreground" aria-label="상태 필터">
            {[["", "전체"], ["on_sale", "판매 중"], ["sold_out", "품절"], ["discontinued", "판매 중단"]].map(([v, l]) => (
              <Link key={v} href={v ? `/admin?status=${v}` : "/admin"} className={(status ?? "") === v ? "font-semibold text-foreground underline underline-offset-4" : "hover:text-foreground"}>{l}</Link>
            ))}
          </nav>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-foreground/30 text-muted-foreground"><tr><th className="py-2 pr-3 font-medium">교재</th><th className="pr-3 font-medium">분류</th><th className="pr-3 font-medium">가격</th><th className="pr-3 font-medium">납품 형태</th><th className="pr-3 font-medium">상태</th><th /></tr></thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-b border-border align-top">
                  <td className="py-2.5 pr-3"><Link href={`/books/${p.slug}`} className="font-medium hover:underline">{p.title}</Link><p className="text-[11px] text-muted-foreground">{p.sku}{p.featured_rank ? ` · 대표 ${p.featured_rank}` : ""}</p></td>
                  <td className="pr-3">{areaLabel(p.area)} · {kindLabel(p.kind)}</td>
                  <td className="pr-3 tabular-nums">{p.price === null ? "-" : formatPrice(p.sale_price ?? p.price)}</td>
                  <td className="pr-3">{deliveryLabel(p.delivery_type ?? "custom")}</td>
                  <td className="pr-3">{statusLabel(p.status)}</td>
                  <td className="text-right"><Link href={`/admin/products/${p.id}`} className="underline underline-offset-4">수정</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between"><h2 className="text-[18px] font-bold">패키지 {bundles?.length ?? 0}개</h2><Link href="/admin/bundles/new" className="border-b border-foreground pb-0.5 text-[13px] font-semibold">패키지 등록</Link></div>
        <ul className="mt-3 border-t border-border text-[14px]">
          {bundles?.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 border-b border-border py-2.5">
              <span>{b.title} <span className="text-[12px] text-muted-foreground">· {statusLabel(b.status)} · {b.bundle_items?.length ?? 0}권{b.price !== null ? ` · ${formatPrice(b.price)}` : ""}</span></span>
              <Link href={`/admin/bundles/${b.id}`} className="underline underline-offset-4">수정</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-[18px] font-bold">상담 접수(Formspree) 연결</h2>
        <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-2 border-t border-border pt-4 text-[13px]">
          <dt className="text-muted-foreground">접수 주소</dt>
          <dd>{CONSULT_ENDPOINT ? <code className="break-all">{CONSULT_ENDPOINT.replace(/^https?:\/\//, "")}</code> : <span className="text-destructive">설정되지 않음</span>}</dd>
          <dt className="text-muted-foreground">상태</dt>
          <dd>{CONSULT_ENDPOINT ? "주소가 설정되어 있습니다. 실제 접수 여부는 ‘상담 신청’ 화면에서 테스트 신청을 보내 Formspree 대시보드에서 확인하세요." : "NEXT_PUBLIC_FORMSPREE_ENDPOINT를 설정한 뒤 다시 배포하세요."}</dd>
        </dl>
        <p className="mt-3 text-[12px] text-muted-foreground">상담 접수 내역은 Formspree에서 관리합니다. 이 사이트에는 별도의 상담 데이터베이스가 없습니다. 입금 확인과 PDF 전달은 운영자가 직접 처리합니다.</p>
      </section>
    </>,
  );
}
