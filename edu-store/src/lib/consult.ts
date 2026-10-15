/**
 * 상담 신청(Formspree) 공용 로직. 브라우저에서만 쓰이는 순수 함수와 타입입니다.
 * 상담 접수 내역은 Formspree에서 관리하며, 이 사이트에는 별도 상담 DB가 없습니다.
 */

// NEXT_PUBLIC_* 는 빌드 때 값이 들어갑니다. 엔드포인트는 공개되어도 되는 폼 주소입니다.
export const CONSULT_ENDPOINT = (
  process.env.PUBLIC_FORMSPREE_ENDPOINT ||
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ||
  process.env.NEXT_PUBLIC_FORMSPREE_URL ||
  "https://formspree.io/f/mwlvwoev"
).trim();

export const CONSULT_COPY = {
  title: "교재 상담 및 구매 문의",
  description: "원하시는 교재와 연락처를 남겨주시면 문자 또는 전화로 구매 방법을 안내해 드립니다.",
  submit: "교재 상담 신청하기",
  success: "상담 신청이 정상적으로 접수되었습니다. 남겨주신 연락처로 구매 절차를 안내해 드리겠습니다.",
  button: "교재 상담 및 구매 신청",
} as const;

export type InquiryType = "book" | "parent" | "academy" | "custom" | "errata";

export const CONSULT_TITLES: Record<InquiryType, { title: string; desc: string; submit: string }> = {
  book: { title: "교재 상담 및 구매 신청", desc: "구매를 원하시는 교재를 확인하신 후 연락처와 문의 내용을 남겨주세요. 담당자가 문자 또는 전화로 계좌이체 방법을 안내해 드립니다.", submit: CONSULT_COPY.submit },
  parent: { title: "우리 아이 교재 상담", desc: "보호자 연락처를 남겨주시면 자녀의 학년과 학습 고민에 맞는 교재를 문자 또는 전화로 안내해 드립니다.", submit: CONSULT_COPY.submit },
  custom: { title: "MELISA CUSTOM BOOK 구성 상담", desc: "선택하신 구성을 바탕으로 제작 가능 여부, 가격, 납품 일정을 문자 또는 전화로 안내해 드립니다.", submit: "맞춤 구성 상담 신청하기" },
  academy: { title: "학원 및 교육기관 교재 문의", desc: "교재 구성과 이용 규모를 남겨주시면 단체 이용 조건과 가격을 개별 상담으로 안내해 드립니다.", submit: "교재 문의 보내기" },
  errata: { title: "교재 오류 제보 · 해설 문의", desc: "교재명과 오류 내용을 남겨주시면 확인 후 안내해 드립니다. 접수된 내용은 확인 전에는 정오표로 게시되지 않습니다.", submit: "제보 보내기" },
};


/** 진단·구성 도구에서 상담폼으로 넘기는 정보. 브라우저 sessionStorage에만 잠시 보관됩니다. */
export type ConsultDraft = {
  source: string;
  inquiryType?: InquiryType;
  slugs?: string[];
  grade?: string;
  subject?: string;
  currentLevel?: string;
  targetLevel?: string;
  examDate?: string;
  weakTypes?: string[];
  diagnosis?: string;
  recommended?: string[];
  customSpec?: string;
  message?: string;
};

const DRAFT_KEY = "melisa.consult.draft";

export function saveDraft(d: ConsultDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {}
}
export function loadDraft(): ConsultDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ConsultDraft) : null;
  } catch {
    return null;
  }
}
export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** 숫자만 남겨 010-1234-5678 형태로 정리합니다. */
export function formatPhone(input: string) {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** 휴대전화(010·011·016~019) 10~11자리인지 확인합니다. */
export function isValidMobile(input: string) {
  return /^01[016789]-?\d{3,4}-?\d{4}$/.test(input.trim());
}

export type ConsultPayload = Record<string, string | boolean | number>;

export type SubmitResult = { ok: true } | { ok: false; reason: "no-endpoint" | "rejected" | "network"; detail?: string };

/** Formspree에 JSON으로 전송합니다. 실제 성공 응답(2xx, ok !== false)일 때만 ok를 돌려줍니다. */
export async function submitConsult(payload: ConsultPayload, endpoint = CONSULT_ENDPOINT, fetchImpl: typeof fetch = fetch): Promise<SubmitResult> {
  if (!endpoint) return { ok: false, reason: "no-endpoint" };
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    let body: { ok?: boolean; error?: string; errors?: { message?: string }[] } | null = null;
    try {
      body = await res.json();
    } catch {}
    if (res.ok && body?.ok !== false) return { ok: true };
    return { ok: false, reason: "rejected", detail: body?.errors?.[0]?.message ?? body?.error };
  } catch (e) {
    return { ok: false, reason: "network", detail: e instanceof Error ? e.message : undefined };
  }
}
