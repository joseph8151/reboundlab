export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "[브랜드명]",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  slogan: "필요한 만큼, 정확하게. 오늘 바로 시작하는 공부",
  description:
    "수능·내신 대비 기출 분석, 변형문제, 스터디가이드, 자기주도학습 플래너를 PDF로. 샘플을 먼저 확인하고, 결제 후 바로 내려받으세요.",
  supportEmail: "help@example.com",
  // 통신판매업 신고 후 실제 정보로 교체하세요 (전자상거래법 제13조 표시 의무).
  business: {
    companyName: "[상호명]",
    ceo: "[대표자명]",
    registrationNumber: "[사업자등록번호]",
    mailOrderNumber: "[통신판매업 신고번호]",
    address: "[사업장 주소]",
    phone: "[고객센터 전화번호]",
    privacyOfficer: "[개인정보 보호책임자]",
  },
};

export const downloadPolicy = {
  validDays: Number(process.env.DOWNLOAD_VALID_DAYS ?? 365),
  maxCount: Number(process.env.DOWNLOAD_MAX_COUNT ?? 5),
  urlTtlSeconds: Number(process.env.DOWNLOAD_URL_TTL_SECONDS ?? 60),
};
