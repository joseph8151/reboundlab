import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "고객지원",
  description: "멜리사 에듀(MELISSA EDU) 교재의 상담·구매 방법, PDF 전달, 환불·교환, 오류 제보를 안내합니다.",
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
            <li className="border-b border-border py-4"><Link href="/consult" className="font-semibold underline underline-offset-4">교재 상담 및 구매 문의</Link><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">교재 추천, 구매 방법, 주문 제작 가능 여부를 문자 또는 전화로 안내해 드립니다.</p></li>
            <li className="border-b border-border py-4"><Link href="/academy" className="font-semibold underline underline-offset-4">학원 및 교육기관 교재 문의</Link><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">수업용 문제집, 맞춤형 PDF 교재, 단체 이용 상담.</p></li>
            <li className="border-b border-border py-4"><Link href="/errata" className="font-semibold underline underline-offset-4">교재 오류 제보 · 해설 문의</Link><p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">교재명과 오류 내용을 알려 주세요. {siteConfig.supportEmail ? `${siteConfig.supportEmail}로도 접수할 수 있습니다.` : ""}</p></li>
          </ul>

          <h2 className="mt-12 border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">구매 안내</h2>
          <ul className="mt-2 text-[14px] leading-relaxed">
            <li className="border-b border-border py-3">교재 선택 → 상담 신청 → 문자·전화 안내 → 계좌이체 → 입금 확인 → PDF 교재 전달</li>
            <li className="border-b border-border py-3">결제는 계좌이체로 진행됩니다.</li>
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
