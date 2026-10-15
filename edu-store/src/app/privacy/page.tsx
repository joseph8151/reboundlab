import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

const description = `${siteConfig.name}이(가) 수집하는 개인정보의 항목, 이용 목적, 보유 기간과 이용자의 권리를 안내합니다.`;

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { title: "개인정보처리방침", description, url: "/privacy" },
};

export default function PrivacyPage() {
  const b = siteConfig.business;
  return (
    <LegalPage title="개인정보처리방침" effectiveDate="2026년 11월 1일">
      <p>
        {b.companyName}(이하 &lsquo;회사&rsquo;)는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <h2>1. 처리하는 개인정보 항목과 목적</h2>
      <table>
        <thead>
          <tr><th>구분</th><th>항목</th><th>목적</th></tr>
        </thead>
        <tbody>
          <tr><td>회원가입·로그인</td><td>이메일, 비밀번호(암호화 저장)</td><td>회원 식별, 구매 자료 보관, 고객 문의 응대</td></tr>
          <tr><td>구매·결제</td><td>주문번호, 상품명, 결제 금액, 결제 수단, 결제 일시</td><td>계약 이행, 콘텐츠 제공, 환불 처리</td></tr>
          <tr><td>다운로드</td><td>다운로드 일시, 접속 IP, 브라우저 정보</td><td>다운로드 횟수 관리, 청약철회 가능 여부 확인, 부정 이용 방지</td></tr>
          <tr><td>상담 신청</td><td>이름·연락처·상담 내용 (폼에 입력한 항목)</td><td>상담 응대, 답변 안내</td></tr>
          <tr><td>AI 지문 분석</td><td>입력한 지문 텍스트·사진, 일별 사용 횟수</td><td>분석 결과 제공, 사용량 제한</td></tr>
          <tr><td>학습 도구</td><td>단어·속독·습관·순공 시간·오답 기록 (로그인 시)</td><td>기기 간 학습 기록 동기화</td></tr>
          <tr><td>자동 수집</td><td>로그인 유지용 쿠키</td><td>로그인 상태 유지</td></tr>
        </tbody>
      </table>
      <p>카드 번호 등 결제 정보는 결제대행사가 직접 처리하며 회사는 저장하지 않습니다.</p>

      <h2>2. 보유 및 이용 기간</h2>
      <p>회원 탈퇴 시 지체 없이 파기합니다. 다만 관련 법령에 따라 다음 정보는 정해진 기간 동안 보관합니다.</p>
      <ul>
        <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
        <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
        <li>웹사이트 방문 기록(접속 IP 등): 3개월 (통신비밀보호법)</li>
      </ul>

      <h2>3. 만 14세 미만 아동의 개인정보</h2>
      <p>
        회사는 만 14세 미만 아동의 개인정보를 처리할 때 법정대리인의 동의를 받습니다. 법정대리인은 아동의 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.
      </p>

      <h2>4. 개인정보의 제3자 제공</h2>
      <p>회사는 이용자의 동의가 있거나 법령에 특별한 규정이 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.</p>

      <h2>5. 개인정보 처리 위탁 및 국외 이전</h2>
      <table>
        <thead>
          <tr><th>수탁자</th><th>위탁 업무</th><th>이전 국가</th></tr>
        </thead>
        <tbody>
          <tr><td>㈜토스페이먼츠</td><td>결제 처리, 결제 정보 관리</td><td>대한민국</td></tr>
          <tr><td>Supabase, Inc.</td><td>회원 인증, 데이터베이스 및 파일 저장</td><td>[선택한 리전 국가 기재, 예: 대한민국(서울 리전)]</td></tr>
          <tr><td>Vercel Inc.</td><td>웹사이트 호스팅</td><td>미국 등</td></tr>
          <tr><td>폼트리(Formtree)</td><td>상담 신청 폼 수집·저장</td><td>[폼트리 서비스 약관의 저장 국가 확인 후 기재]</td></tr>
          <tr><td>Anthropic, PBC</td><td>AI 지문 분석 (이용자가 입력한 지문 텍스트·사진 처리)</td><td>미국</td></tr>
        </tbody>
      </table>
      <p>
        국외 이전 항목은 위 1항의 항목이며, 서비스 이용 시점에 네트워크를 통해 전송되고, 회원 탈퇴 또는 위탁 계약 종료 시까지 보관됩니다. 이용자는 국외 이전을 거부할 수
        있으나, 이 경우 서비스 이용이 제한될 수 있습니다.
      </p>

      <h2>6. 개인정보의 파기</h2>
      <p>보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방법으로 지체 없이 파기합니다.</p>

      <h2>7. 이용자의 권리와 행사 방법</h2>
      <p>
        이용자(만 14세 미만은 법정대리인)는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있으며, {siteConfig.supportEmail}로 요청하면 지체 없이 조치합니다.
      </p>

      <h2>8. 안전성 확보 조치</h2>
      <ul>
        <li>비밀번호 암호화 저장, 전 구간 HTTPS 암호화 통신</li>
        <li>데이터베이스 행 수준 접근 통제(RLS) 적용, 관리자 권한 최소화</li>
        <li>구매 자료는 비공개 저장소에 보관하고, 단시간만 유효한 서명 링크로만 제공</li>
      </ul>

      <h2>9. 쿠키의 사용</h2>
      <p>회사는 로그인 상태 유지를 위해 필수 쿠키만 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이 필요한 기능을 이용할 수 없습니다.</p>

      <h2>10. 개인정보 보호책임자</h2>
      <ul>
        <li>성명: {b.privacyOfficer}</li>
        <li>연락처: {siteConfig.supportEmail} / {b.phone}</li>
      </ul>
      <p>
        개인정보 침해에 대한 신고나 상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118), 개인정보분쟁조정위원회(www.kopico.go.kr, 1833-6972)에 문의할 수
        있습니다.
      </p>

      <h2>11. 고지 의무</h2>
      <p>이 방침의 내용이 바뀌는 경우 시행 7일 전부터 사이트를 통해 알립니다.</p>
    </LegalPage>
  );
}
