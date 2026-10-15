import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const b = siteConfig.business;
  return (
    <footer className="mt-24 border-t border-border bg-muted">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-base font-bold">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            검수한 학습 자료를 PDF로. 필요한 만큼 고르고, 결제 후 바로 내려받아 오늘 공부에 쓰세요.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">자료</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products?subject=korean" className="hover:text-foreground">국어</Link></li>
            <li><Link href="/products?subject=math" className="hover:text-foreground">수학</Link></li>
            <li><Link href="/products?subject=english" className="hover:text-foreground">영어</Link></li>
            <li><Link href="/products?subject=inquiry" className="hover:text-foreground">탐구</Link></li>
            <li><Link href="/study" className="hover:text-foreground">무료 학습 도구</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">고객 지원</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/faq" className="hover:text-foreground">자주 묻는 질문</Link></li>
            <li><Link href="/refund" className="hover:text-foreground">환불·교환 정책</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">이용약관</Link></li>
            <li><Link href="/privacy" className="font-semibold text-foreground">개인정보처리방침</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page space-y-1 py-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            상호 {b.companyName} · 대표 {b.ceo} · 사업자등록번호 {b.registrationNumber} · 통신판매업 신고 {b.mailOrderNumber}
          </p>
          <p>
            주소 {b.address} · 고객센터 {b.phone} · 이메일 {siteConfig.supportEmail} · 개인정보 보호책임자 {b.privacyOfficer}
          </p>
          <p className="pt-2">© {new Date().getFullYear()} {siteConfig.name}. 자료의 무단 복제·배포·공유를 금지합니다.</p>
        </div>
      </div>
    </footer>
  );
}
