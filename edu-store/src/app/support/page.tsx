import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";
import { downloadPolicy, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "고객지원",
  description: "멜리사 에듀(MELISA EDU) 교재의 구매, 다운로드, 환불·교환, 상담 문의를 안내합니다.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <p className="font-display text-[15px] font-semibold tracking-[0.24em] text-muted-foreground">SUPPORT</p>
      <h1 className="mt-2 text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">고객지원</h1>

      <div className="mt-12 grid gap-14 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div>
          <h2 className="border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">문의하기</h2>
          <ul className="mt-2 text-[15px]">
            <li className="border-b border-border py-4"><Link href="/consult" className="font-semibold underline underline-offset-4">상담 신청</Link><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">교재 추천과 학습 순서 상담. 수능과 중등 상담을 나누어 접수합니다.</p></li>
            <li className="border-b border-border py-4"><span className="font-semibold">주문·다운로드·환불 문의</span><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">주문번호와 가입 이메일을 함께 알려 주세요. {siteConfig.supportEmail ? `${siteConfig.supportEmail}로도 접수할 수 있습니다.` : "상담 신청의 '구매·결제' 내용으로 접수해 주세요."}</p></li>
          </ul>

          <h2 className="mt-12 border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">이용 안내</h2>
          <ul className="mt-2 text-[14px] leading-relaxed">
            <li className="border-b border-border py-3">다운로드 기간 {downloadPolicy.validDays}일, 교재당 최대 {downloadPolicy.maxCount}회</li>
            <li className="border-b border-border py-3">다운로드 전 결제일로부터 7일 이내 전액 환불</li>
            <li className="border-b border-border py-3"><Link href="/refund" className="underline underline-offset-4">환불·교환 정책</Link> · <Link href="/terms" className="underline underline-offset-4">이용약관</Link> · <Link href="/privacy" className="underline underline-offset-4">개인정보처리방침</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">자주 묻는 질문</h2>
          <ul>
            {FAQ_ITEMS.slice(0, 6).map((f) => (
              <li key={f.q} className="border-b border-border py-4"><p className="text-[15px] font-semibold">{f.q}</p><p className="mt-1.5 text-[14px] leading-[1.8] text-muted-foreground">{f.a}</p></li>
            ))}
          </ul>
          <Link href="/faq" className="mt-5 inline-block border-b border-foreground pb-0.5 text-[13px] font-medium">질문 전체 보기</Link>
        </div>
      </div>
    </div>
  );
}
