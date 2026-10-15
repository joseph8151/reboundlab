import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { getOwnedItems } from "@/lib/orders";
import { downloadPolicy, siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "내 자료함", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  not_found: "주문 정보를 확인할 수 없습니다.",
  file_missing: "교재 파일을 준비하고 있습니다. 잠시 후 다시 시도하거나 고객지원으로 문의해 주세요.",
  expired: "다운로드 기간이 지났습니다. 다시 내려받아야 한다면 고객지원으로 문의해 주세요.",
  limit: "다운로드 가능 횟수를 모두 사용했습니다. 고객지원으로 문의해 주세요.",
  storage: "다운로드 링크를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function MyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page max-w-3xl py-14">
        <h1 className="text-[30px] font-bold tracking-[-0.03em]">내 자료함</h1>
        <p className="mt-6 border-l-2 border-sand bg-card p-4 text-[14px] leading-relaxed text-muted-foreground">회원·구매 기능은 교재 데이터베이스가 연결된 뒤에 사용할 수 있습니다.</p>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");
  const { error } = await searchParams;
  const items = await getOwnedItems(user.id);

  // 주문 단위로 묶어 보여 줍니다.
  const orders = new Map<string, typeof items>();
  items.forEach((i) => orders.set(i.orderId, [...(orders.get(i.orderId) ?? []), i]));

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">내 자료함</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex shrink-0 gap-4 text-[13px]">
          {isAdminEmail(user.email) && <Link href="/admin" className="underline underline-offset-4">관리자</Link>}
          <form action="/auth/signout" method="post"><button type="submit" className="text-muted-foreground underline underline-offset-4">로그아웃</button></form>
        </div>
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
        결제일로부터 {downloadPolicy.validDays}일 동안 교재마다 최대 {downloadPolicy.maxCount}회 내려받을 수 있습니다. 링크는 보안을 위해 {downloadPolicy.urlTtlSeconds}초 동안만 유효하며, 파일에는 구매자 정보가 표시됩니다.
      </p>
      {error && ERRORS[error] && <p role="alert" className="mt-4 text-[14px] text-destructive">{ERRORS[error]}</p>}

      {items.length === 0 ? (
        <div className="mt-10 border-t border-border pt-10">
          <p className="text-[18px] font-semibold">아직 구매한 교재가 없습니다.</p>
          <Button asChild className="mt-6"><Link href="/books">교재 둘러보기</Link></Button>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {[...orders.entries()].map(([orderId, list]) => (
            <section key={orderId} aria-label={`주문 ${orderId}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground/30 pb-2 text-[12px] text-muted-foreground">
                <span>{formatDate(list[0].approvedAt)} 결제 · 주문번호 {orderId}</span>
                {list[0].receiptUrl && <a href={list[0].receiptUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">영수증</a>}
              </div>
              <ul>
                {list.map((item) => (
                  <li key={item.productId} className="grid gap-4 border-b border-border py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold leading-snug">
                        {item.productSlug ? <Link href={`/books/${item.productSlug}`} className="hover:underline">{item.productTitle}</Link> : item.productTitle}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                        {item.expired ? "다운로드 기간 만료" : `${formatDate(item.expiresAt)}까지`} · 남은 횟수 {item.remaining}/{downloadPolicy.maxCount}
                        {item.refundable && " · 다운로드 전 환불 가능"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DownloadButton orderId={orderId} productId={item.productId} kind="main" label="교재 PDF" disabled={item.expired || item.remaining === 0} />
                      {item.hasAnswerFile && <DownloadButton orderId={orderId} productId={item.productId} kind="answer" label="정답·해설" disabled={item.expired || item.answerRemaining === 0} outline />}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 text-[13px] text-muted-foreground">
        환불·교환 문의: {siteConfig.supportContact} (주문번호를 함께 알려 주세요) · <Link href="/refund" className="underline underline-offset-4">환불·교환 정책</Link>
      </p>
    </div>
  );
}

function DownloadButton({ orderId, productId, kind, label, disabled, outline }: { orderId: string; productId: string; kind: "main" | "answer"; label: string; disabled: boolean; outline?: boolean }) {
  return (
    <form action={`/api/download/${orderId}`} method="post">
      <input type="hidden" name="p" value={productId} />
      <input type="hidden" name="k" value={kind} />
      <Button type="submit" size="sm" variant={outline ? "outline" : "default"} disabled={disabled}>{label} 다운로드</Button>
    </form>
  );
}
