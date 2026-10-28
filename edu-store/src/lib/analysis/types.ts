/**
 * 수능 영어 지문 분석 콘텐츠의 구조화 데이터. 웹 화면, 관리자 편집기, PDF(인쇄) 화면이 모두 이 한 가지 데이터를 씁니다.
 * 지문 하나가 AnalysisPassage 하나이며 DB에는 data(jsonb)로 저장됩니다.
 */

export const STATUSES = [
  { id: "draft", label: "초안" },
  { id: "in_review", label: "검수 중" },
  { id: "approved", label: "승인 완료" },
  { id: "on_sale", label: "판매 중" },
] as const;
export type AnalysisStatus = (typeof STATUSES)[number]["id"];
export const statusLabel = (id: string) => STATUSES.find((s) => s.id === id)?.label ?? id;
/** 일반 방문자에게 공개되는 상태 */
export const isPublicStatus = (s: string) => s === "approved" || s === "on_sale";

export const RIGHTS = [
  { id: "original", label: "멜리사 에듀 창작 지문" },
  { id: "licensed", label: "이용 허락 확인됨" },
  { id: "pending", label: "이용 허락 확인 중" },
  { id: "unknown", label: "미확인" },
] as const;
export type RightsStatus = (typeof RIGHTS)[number]["id"];

export const QUESTION_TYPES = ["주제", "요지", "제목", "빈칸 추론", "함축적 의미", "문장 삽입", "글의 순서", "어법", "어휘", "요약문 완성", "서술형", "영작"] as const;

/** 논리 구조 단계 유형 */
export const LOGIC_TYPES = ["통념 제시", "문제 제기", "주장", "반박", "대조", "원인과 결과", "예시", "재진술", "양보", "조건", "근거", "결론"] as const;

/** 패러프레이징 환원 유형 */
export const PARAPHRASE_TYPES = [
  "동의어 치환", "반의어를 이용한 의미 전환", "구체적 표현의 추상화", "추상적 표현의 구체화", "문장 구조 변환",
  "능동태와 수동태 전환", "인과 관계의 압축", "부정 표현의 긍정 표현 전환", "여러 문장의 의미 통합", "함축적 의미의 재진술",
] as const;

/** 오답 유형 */
export const WRONG_TYPES = [
  "반대 의미", "지문에 없는 내용", "부분적 일치", "과도한 일반화", "인과 관계 왜곡", "주체 변경",
  "범위 확대 또는 축소", "핵심 논점 이탈", "조건 누락", "매력적인 함정 선택지",
] as const;

export type Chunk = { en: string; ko: string };
export type SentenceAnalysis = {
  n: number;
  en: string;
  ko: string;
  chunks: Chunk[];
  syntax: { expr: string; note: string }[];
  grammar: { point: string; note: string }[];
  words: { w: string; note: string }[];
  /** 문장의 논리적 역할 설명 */
  role: string;
  /** 짧은 역할 라벨(예: 핵심 전환) */
  roleTag: string;
  /** 정답과의 관련성 */
  answerLink: string;
};

export type LogicStep = { label: string; type: string; sentenceNos: number[]; text: string; connective?: string; emphasis?: boolean };
export type EvidenceExplicit = { sentenceNo: number; quote: string; ko: string };
export type EvidenceInferential = { sentenceNos: number[]; quote?: string; ko: string; reasoning: string };

export type Paraphrase = {
  passageExpr: string;
  sentenceNo: number;
  choiceExpr: string;
  choiceNo: number;
  ko: string;
  type: string;
  why: string;
  impact: string;
};

export type WrongChoice = { choiceNo: number; text: string; ko: string; verdict: "정답" | "오답"; types: string[]; explain: string };

export type VocabItem = {
  word: string; meaning: string; pos: string; synonyms: string[]; antonyms: string[]; idioms: string[]; example: string; point: string;
  /** 정답과 직접 연결되는 핵심 어휘 */
  key: boolean;
};

export type VariantQuestion = {
  id: string;
  type: (typeof QUESTION_TYPES)[number];
  no: number;
  stem: string;
  /** 문제 지문(변형된 지문이면 그대로 기재) */
  passage?: string;
  choices?: string[];
  /** 객관식은 선택지 번호, 주관식은 모범 답안 */
  answer: string;
  acceptedAnswers?: string[];
  explain: string;
  evidence: { sentenceNos: number[]; quote: string }[];
  paraphrase: { from: string; to: string; note: string }[];
  wrong: { choiceNo: number; verdict: "정답" | "오답"; types: string[]; explain: string }[];
  difficulty: "하" | "중하" | "중" | "중상" | "상";
  intent: string;
};

export type ReviewCheckId =
  | "translation" | "grammar" | "topic" | "logic" | "evidence" | "paraphrase" | "wrong" | "unique" | "korean" | "typo" | "rights";

export const REVIEW_CHECKS: { id: ReviewCheckId; label: string }[] = [
  { id: "translation", label: "원문과 해석의 정확성" },
  { id: "grammar", label: "문법 설명의 정확성" },
  { id: "topic", label: "소재와 주제의 적절성" },
  { id: "logic", label: "지문 논리 구조의 타당성" },
  { id: "evidence", label: "정답 근거의 정확성" },
  { id: "paraphrase", label: "패러프레이징 의미 일치 여부" },
  { id: "wrong", label: "오답 선택지 분석의 타당성" },
  { id: "unique", label: "변형문제 정답의 유일성" },
  { id: "korean", label: "한국어 문장의 자연스러움" },
  { id: "typo", label: "오탈자 및 PDF 출력 오류" },
  { id: "rights", label: "원문 및 변형문제의 저작권·이용 허락 확인" },
];

export type AnalysisPassage = {
  id: string;
  slug: string;
  title: string;
  status: AnalysisStatus;
  source: { origin: string; year: string; rights: RightsStatus; rightsNote: string; verifiedBy: string; verifiedAt: string };
  meta: { questionType: string; difficulty: string; topicTag: string };
  passage: { sentences: { n: number; en: string }[] };
  question: { stem: string; choices: string[]; answerNo: number };
  /** A. 핵심 정보 */
  overview: {
    topic: string; theme: string; mainIdea: string; titleEn: string; titleKo: string; purpose: string; structure: string;
    coreLogic: string; summaryEn: string; summaryKo: string; background: string;
  };
  /** B. 문장별 정밀 해석 */
  sentences: SentenceAnalysis[];
  /** C. 논리 구조 */
  logic: { steps: LogicStep[]; contrast?: { leftLabel: string; left: string[]; rightLabel: string; right: string[] }; note: string };
  /** D. 정답 근거 */
  evidence: {
    answerNo: number; answerText: string; answerKo: string; explicit: EvidenceExplicit[]; inferential: EvidenceInferential[];
    keyExpressions: string[]; process: string[]; verdict: string;
  };
  /** E. 패러프레이징 */
  paraphrase: Paraphrase[];
  /** F. 오답 분석 */
  wrong: WrongChoice[];
  /** G. 어휘 */
  vocab: VocabItem[];
  /** H. 요약문 훈련 */
  summary: { sentenceEn: string; sentenceKo: string; keywords: string[]; blank: { text: string; answers: string[]; note: string } };
  /** 변형문제 */
  variants: VariantQuestion[];
  /** 만들지 않은 유형과 그 이유(억지로 문항 수를 채우지 않음) */
  skippedTypes: { type: string; reason: string }[];
  review: { checks: Partial<Record<ReviewCheckId, boolean>>; notes: string };
  /** 관리자가 직접 고쳐 AI 재생성이 덮어쓰지 않는 항목 경로(예: "overview.theme", "sentences.2.ko") */
  lockedPaths: string[];
  updatedAt: string;
};

// ── 경로 도우미: 관리자 수정 보호와 AI 재생성 병합 ─────────────────────────
type Json = unknown;

export function getPath(obj: Json, path: string): Json {
  return path.split(".").reduce<Json>((cur, k) => (cur === null || cur === undefined ? undefined : (cur as Record<string, Json>)[k]), obj);
}

export function setPath<T>(obj: T, path: string, value: Json): T {
  const keys = path.split(".");
  const copy = structuredClone(obj) as Record<string, Json>;
  let cur: Record<string, Json> = copy;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = Array.isArray(cur[k]) ? [...(cur[k] as Json[])] : { ...(cur[k] as object) };
    cur = cur[k] as Record<string, Json>;
  });
  cur[keys[keys.length - 1]] = value;
  return copy as unknown as T;
}

/** 두 값의 말단(문자열·숫자·불리언) 경로 중 서로 다른 것을 모읍니다. 관리자가 고친 항목을 잠그는 데 씁니다. */
export function diffPaths(a: Json, b: Json, base = ""): string[] {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null || b === null) return base ? [base] : [];
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: string[] = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) out.push(...diffPaths(a[i], b[i], base ? `${base}.${i}` : String(i)));
    return out;
  }
  if (typeof a === "object") {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    const out: string[] = [];
    for (const k of keys) out.push(...diffPaths((a as Record<string, Json>)[k], (b as Record<string, Json>)[k], base ? `${base}.${k}` : k));
    return out;
  }
  return a === b ? [] : [base];
}

/** 편집 가능한 데이터 영역(메타·상태·잠금 제외) */
export const CONTENT_KEYS = ["passage", "question", "overview", "sentences", "logic", "evidence", "paraphrase", "wrong", "vocab", "summary", "variants"] as const;

/**
 * AI가 새로 만든 결과(fresh)를 기존 데이터(current)에 합칩니다.
 * 잠긴 경로(lockedPaths)는 기존 값을 유지하고, 그 외는 새 값으로 바꿉니다.
 * 배열 항목 수가 달라져 인덱스가 어긋나면 잠긴 항목이 속한 배열은 통째로 보호합니다.
 */
export function mergeRegenerated(current: AnalysisPassage, fresh: Partial<AnalysisPassage>, onlyKeys?: readonly string[]): { result: AnalysisPassage; protectedPaths: string[] } {
  const keys = (onlyKeys ?? CONTENT_KEYS).filter((k) => k in fresh);
  let result = structuredClone(current);
  const protectedPaths: string[] = [];
  for (const k of keys) {
    const locked = current.lockedPaths.filter((p) => p === k || p.startsWith(`${k}.`));
    const next = (fresh as Record<string, Json>)[k];
    if (!locked.length) {
      result = setPath(result, k, next);
      continue;
    }
    const cur = (current as unknown as Record<string, Json>)[k];
    if (Array.isArray(cur) && Array.isArray(next) && cur.length !== next.length) {
      protectedPaths.push(...locked); // 인덱스가 어긋나므로 이 영역은 그대로 둡니다.
      continue;
    }
    let merged = setPath(result, k, structuredClone(next));
    for (const p of locked) {
      const keep = getPath(current, p);
      if (keep !== undefined) {
        merged = setPath(merged, p, keep);
        protectedPaths.push(p);
      }
    }
    result = merged;
  }
  return { result, protectedPaths };
}

/** 승인 가능 여부: 모든 검수 항목 체크 + 저작권 확인 */
export function approvalProblems(p: AnalysisPassage): string[] {
  const out: string[] = [];
  for (const c of REVIEW_CHECKS) if (!p.review.checks[c.id]) out.push(`검수 항목 미체크: ${c.label}`);
  if (p.source.rights === "unknown" || p.source.rights === "pending") out.push("저작권·이용 허락이 확인되지 않았습니다.");
  if (p.source.rights !== "original" && (!p.source.verifiedBy || !p.source.verifiedAt)) out.push("이용 허락 확인자와 확인일을 입력해 주세요.");
  if (p.source.rights === "original" && !p.source.rightsNote) out.push("창작 지문 메모를 입력해 주세요.");
  if (p.evidence.answerNo !== p.question.answerNo) out.push("정답 번호가 문제의 정답과 다릅니다.");
  return out;
}
