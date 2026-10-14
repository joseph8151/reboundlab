import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LogOut, Receipt } from "lucide-react";
import { DemoNotice } from "@/components/demo-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import { getOwnedItems } from "@/lib/orders";
import { downloadPolicy, siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "내 자료함", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  not_found: "주문 정보를 확인할 수 없습니다.",
  file_missing: "자료 파일을 준비하고 있습니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.",
  expired: "다운로드 기간이 지났습니다. 재다운로드가 필요하면 고객센터로 문의해 주세요.",
  limit: "다운로드 가능 횟수를 모두 사용했습니다. 고객센터로 문의해 주세요.",
  storage: "다운로드 링크를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function MyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page max-w-3xl py-14">
        <h1 className="text-2xl font-bold">내 자료함</h1>
        <div className="mt-6">
          <DemoNotice>데모 모드입니다. Supabase를 연결하면 구매한 자료 목록과 다운로드 기능이 활성화됩니다.</DemoNotice>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  const { error } = await searchParams;
  const items = await getOwnedItems(user.id);

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">내 자료함</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdminEmail(user.email) && (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">관리자</Link>
            </Button>
          )}
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut /> 로그아웃
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
        결제일로부터 <strong className="text-foreground">{downloadPolicy.validDays}일</strong> 동안 자료당{" "}
        <strong className="text-foreground">최대 {downloadPolicy.maxCount}회</strong> 내려받을 수 있습니다. 다운로드 링크는 보안을 위해{" "}
        {downloadPolicy.urlTtlSeconds}초 동안만 유효하며, 개인 학습 외 공유·배포는 금지됩니다.
      </div>

      {error && ERRORS[error] && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-destructive">
          {ERRORS[error]}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="font-semibold">아직 구매한 자료가 없습니다</p>
          <p className="mt-2 text-sm text-muted-foreground">샘플을 확인하고 필요한 자료를 골라 보세요.</p>
          <Button asChild className="mt-6">
            <Link href="/products">자료 둘러보기</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => {
            const disabled = item.expired || item.remaining === 0;
            return (
              <li key={item.orderId} className="rounded-2xl border border-border p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {item.expired ? (
                        <Badge variant="muted">기간 만료</Badge>
                      ) : (
                        <Badge variant="success">다운로드 가능</Badge>
                      )}
                      {item.refundable && <Badge variant="outline">환불 가능 (다운로드 전)</Badge>}
                    </div>
                    <p className="mt-2 font-bold leading-snug">
                      {item.productSlug ? (
                        <Link href={`/products/${item.productSlug}`} className="hover:text-primary">
                          {item.productTitle}
                        </Link>
                      ) : (
                        item.productTitle
                      )}
                    </p>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                      <dt>결제일</dt>
                      <dd>{formatDate(item.approvedAt)} · {formatPrice(item.amount)}</dd>
                      <dt>다운로드 기한</dt>
                      <dd>{formatDate(item.expiresAt)}까지</dd>
                      <dt>남은 횟수</dt>
                      <dd>{item.remaining}회 / {downloadPolicy.maxCount}회</dd>
                    </dl>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <form action={`/api/download/${item.orderId}`} method="post" className="flex-1">
                      <Button type="submit" className="w-full" disabled={disabled}>
                        <Download /> PDF 다운로드
                      </Button>
                    </form>
                    {item.receiptUrl && (
                      <Button asChild variant="outline" className="flex-1">
                        <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Receipt /> 영수증
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        환불 문의: {siteConfig.supportEmail} (주문번호를 함께 알려 주세요) ·{" "}
        <Link href="/refund" className="underline">환불·교환 정책</Link>
      </p>
    </div>
  );
}
