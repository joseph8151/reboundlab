import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { siteConfig } from "@/lib/site";

const col = "text-[13px] leading-[2] text-background/75";
const link = "hover:text-background";

function line(parts: [string, string][]) {
  const present = parts.filter(([, v]) => v);
  return present.length ? <p>{present.map(([k, v]) => `${k} ${v}`).join(" · ")}</p> : null;
}

export function SiteFooter() {
  const b = siteConfig.business;
  return (
    <footer className="mt-28 bg-primary text-background print:hidden">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark size="lg" korean={false} className="[&_*]:text-background" />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-background/75">
            수능과 학교 내신을 위한 전문 교재를 PDF로 펴내는 교육 출판 브랜드, 멜리사 에듀입니다. 구매는 상담 후 계좌이체로 진행됩니다.
          </p>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.12em] text-background/60">교재</p>
          <ul className={`mt-3 ${col}`}>
            <li><Link className={link} href="/category/suneung">수능</Link></li>
            <li><Link className={link} href="/category/high-school">고등 내신</Link></li>
            <li><Link className={link} href="/category/middle-school">중등 내신</Link></li>
            <li><Link className={link} href="/category/mock">모의고사</Link></li>
            <li><Link className={link} href="/category/planner">학습 플래너</Link></li>
            <li><Link className={link} href="/packages">패키지</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.12em] text-background/60">교재 찾기·학습 도구</p>
          <ul className={`mt-3 ${col}`}>
            <li><Link className={link} href="/diagnosis">3분 학습 진단</Link></li>
            <li><Link className={link} href="/exam">시험이 얼마 남지 않았다면</Link></li>
            <li><Link className={link} href="/custom">MELISA CUSTOM BOOK</Link></li>
            <li><Link className={link} href="/schedule">학습 일정 만들기</Link></li>
            <li><Link className={link} href="/study">무료 학습 도구</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.12em] text-background/60">고객지원</p>
          <ul className={`mt-3 ${col}`}>
            <li><Link className={link} href="/support">고객지원 센터</Link></li>
            <li><Link className={`${link} font-semibold text-background`} href="/consult" data-consult-button>교재 상담 및 구매 신청</Link></li>
            <li><Link className={link} href="/academy">학원·기관 문의</Link></li>
            <li><Link className={link} href="/errata">오류 제보·정오표</Link></li>
            <li><Link className={link} href="/faq">자주 묻는 질문</Link></li>
            <li><Link className={link} href="/refund">환불·교환 정책</Link></li>
            <li><Link className={link} href="/terms">이용약관</Link></li>
            <li><Link className={`${link} font-semibold text-background`} href="/privacy">개인정보처리방침</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/15">
        <div className="container-page space-y-1 py-7 text-[12px] leading-relaxed text-background/60">
          {line([["상호", b.companyName], ["대표", b.ceo], ["사업자등록번호", b.registrationNumber], ["통신판매업 신고", b.mailOrderNumber]])}
          {line([["주소", b.address], ["고객센터", b.phone], ["이메일", siteConfig.supportEmail], ["개인정보 보호책임자", b.privacyOfficer]])}
          <p className="pt-2">© {new Date().getFullYear()} {siteConfig.nameEn}. 본 사이트의 교재와 콘텐츠의 무단 복제·배포를 금지합니다.</p>
        </div>
      </div>
    </footer>
  );
}
