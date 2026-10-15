const env = (k: string) => (process.env[k] ?? "").trim();

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "멜리사 에듀",
  nameEn: "MELISA EDU",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  slogan: "공부의 기준을 다시 세우다.",
  description:
    "수능부터 학교 내신까지. 학습의 깊이를 더하는 전문 교재를 PDF로 펴내는 교육 출판 브랜드, 멜리사 에듀(MELISA EDU)입니다.",
  // 고객지원 이메일. 설정 전에는 화면에 표시하지 않고 상담 신청 페이지로 안내합니다.
  supportEmail: env("NEXT_PUBLIC_SUPPORT_EMAIL"),
  /** 문장 안에서 "OOO로 문의" 형태로 쓰는 연락 수단 */
  get supportContact() {
    return this.supportEmail || "상담 신청 페이지";
  },
  // 상담 신청이 전송되는 Formspree 엔드포인트 (공개되어도 되는 폼 주소). 환경 변수로 바꿀 수 있습니다.
  consultEndpoint: (process.env.NEXT_PUBLIC_FORMSPREE_URL || "https://formspree.io/f/mwlvwoev").trim(),
  // 2027학년도 대학수학능력시험 시행일. 평가원 시행계획 공고로 꼭 다시 확인하세요.
  suneungDate: process.env.NEXT_PUBLIC_SUNEUNG_DATE || "2026-11-19",
  aiTutor: {
    name: "AI 멜리사",
    author: "멜리사 선생님",
    // ChatGPT GPTs 주소. 바뀌면 환경 변수로 덮어쓸 수 있습니다.
    url:
      process.env.NEXT_PUBLIC_AI_TUTOR_URL ||
      "https://chatgpt.com/g/g-67a758c27f2c8191a06378d09af69df7-ai-melrisayeongeo-suneunggiculmoyigosa-bunseog",
  },
  // 사업자 정보: 전자상거래법상 표시 의무 항목입니다. 값이 없으면 화면에 표시하지 않습니다(운영자 입력 필요).
  business: {
    companyName: env("NEXT_PUBLIC_BIZ_COMPANY"),
    ceo: env("NEXT_PUBLIC_BIZ_CEO"),
    registrationNumber: env("NEXT_PUBLIC_BIZ_REG_NO"),
    mailOrderNumber: env("NEXT_PUBLIC_BIZ_MAIL_ORDER_NO"),
    address: env("NEXT_PUBLIC_BIZ_ADDRESS"),
    phone: env("NEXT_PUBLIC_BIZ_PHONE"),
    privacyOfficer: env("NEXT_PUBLIC_BIZ_PRIVACY_OFFICER"),
  },
};

export const downloadPolicy = {
  validDays: Number(process.env.DOWNLOAD_VALID_DAYS ?? 365),
  maxCount: Number(process.env.DOWNLOAD_MAX_COUNT ?? 5),
  urlTtlSeconds: Number(process.env.DOWNLOAD_URL_TTL_SECONDS ?? 60),
};
