/**
 * MELISA EDU 교재 분류 체계.
 * 상품 데이터(DB)에는 아래 id 값만 저장하고, 화면에 쓰는 이름·설명은 이 파일에서 관리합니다.
 */

// ── 대상 학년 ──────────────────────────────────────────────
export const LEVELS = [
  { id: "middle1", label: "중1", group: "middle" },
  { id: "middle2", label: "중2", group: "middle" },
  { id: "middle3", label: "중3", group: "middle" },
  { id: "high1", label: "고1", group: "high" },
  { id: "high2", label: "고2", group: "high" },
  { id: "high3", label: "고3", group: "high" },
  { id: "suneung", label: "수능", group: "suneung" },
] as const;
export type LevelId = (typeof LEVELS)[number]["id"];

/** 화면 필터용 묶음: 중등 / 고1 / 고2 / 고3 / 수능 */
export const LEVEL_GROUPS = [
  { id: "middle", label: "중등", members: ["middle1", "middle2", "middle3"] as LevelId[] },
  { id: "high1", label: "고1", members: ["high1"] as LevelId[] },
  { id: "high2", label: "고2", members: ["high2"] as LevelId[] },
  { id: "high3", label: "고3", members: ["high3"] as LevelId[] },
  { id: "suneung", label: "수능", members: ["suneung"] as LevelId[] },
] as const;
export type LevelGroupId = (typeof LEVEL_GROUPS)[number]["id"];

// ── 학습 과정(진열 기준) ───────────────────────────────────
export const TRACKS = [
  { id: "csat", label: "수능" },
  { id: "school", label: "학교 내신" },
  { id: "common", label: "학습 관리" },
] as const;
export type TrackId = (typeof TRACKS)[number]["id"];

// ── 과목(영역) ─────────────────────────────────────────────
export const AREAS = [
  { id: "korean", label: "국어", color: "#5b1f2c", tint: "#efe3e5" },
  { id: "math", label: "수학", color: "#1b2a45", tint: "#e3e7ef" },
  { id: "english", label: "영어", color: "#2d4a3e", tint: "#e2ebe5" },
  { id: "social", label: "사회", color: "#6b5442", tint: "#eee8e1" },
  { id: "science", label: "과학", color: "#44566f", tint: "#e5e9ef" },
  { id: "common", label: "종합", color: "#3a3d3a", tint: "#e9e8e3" },
] as const;
export type AreaId = (typeof AREAS)[number]["id"];

// ── 유형 ───────────────────────────────────────────────────
export const KINDS = [
  { id: "concept", label: "개념" },
  { id: "past-exam", label: "기출" },
  { id: "variant", label: "변형문제" },
  { id: "mock", label: "모의고사" },
  { id: "material", label: "학습자료" },
] as const;
export type KindId = (typeof KINDS)[number]["id"];

export const DIFFICULTIES = [
  { id: "basic", label: "기초" },
  { id: "standard", label: "표준" },
  { id: "advanced", label: "심화" },
] as const;
export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];

export const CURRICULA = [
  { id: "2015", label: "2015 개정" },
  { id: "2022", label: "2022 개정" },
] as const;
export type CurriculumId = (typeof CURRICULA)[number]["id"];

export const STATUSES = [
  { id: "on_sale", label: "판매 중" },
  { id: "sold_out", label: "품절" },
  { id: "discontinued", label: "판매 중단" },
] as const;
export type StatusId = (typeof STATUSES)[number]["id"] | "coming_soon";

export const ANSWER_MODES = [
  { id: "separate", label: "정답 및 해설 별도 PDF 제공" },
  { id: "inline", label: "정답 및 해설 본문 수록" },
  { id: "none", label: "정답만 제공 또는 미제공" },
] as const;
export type AnswerMode = (typeof ANSWER_MODES)[number]["id"];

/** 납품 형태: custom = 주문 제작 상담(제작 가능 여부·납품 시점은 상담에서 안내), ready = 완성된 PDF 즉시 전달 */
export const DELIVERY_TYPES = [
  { id: "custom", label: "주문 제작 상담 가능" },
  { id: "ready", label: "PDF 완성본" },
] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number]["id"];

/** 취약 유형 태그. 상품에 연결해 두면 진단·고민별 추천에 쓰입니다. 운영자는 상품마다 태그를 지정합니다. */
export const WEAK_TAGS = [
  { id: "kor-reading", area: "korean", label: "독서 지문 이해" },
  { id: "kor-inference", area: "korean", label: "추론" },
  { id: "kor-literature", area: "korean", label: "문학 표현·작품 감상" },
  { id: "kor-choice", area: "korean", label: "선택지 판단" },
  { id: "math-concept-apply", area: "math", label: "개념 적용·응용" },
  { id: "math-function", area: "math", label: "함수" },
  { id: "math-equation", area: "math", label: "방정식" },
  { id: "math-counting", area: "math", label: "경우의 수" },
  { id: "math-geometry", area: "math", label: "도형" },
  { id: "math-calc", area: "math", label: "계산 실수" },
  { id: "eng-blank", area: "english", label: "빈칸 추론" },
  { id: "eng-order", area: "english", label: "순서 배열" },
  { id: "eng-insert", area: "english", label: "문장 삽입" },
  { id: "eng-grammar", area: "english", label: "어법" },
  { id: "eng-vocab", area: "english", label: "어휘" },
  { id: "eng-long", area: "english", label: "장문 독해" },
  { id: "eng-writing", area: "english", label: "서술형" },
  { id: "soc-apply", area: "social", label: "개념의 문제 적용" },
  { id: "sci-data", area: "science", label: "자료 해석" },
  { id: "time", area: "common", label: "시간 관리" },
  { id: "school-score", area: "common", label: "내신 점수 관리" },
  { id: "wrong-note", area: "common", label: "오답 관리" },
] as const;
export type WeakTagId = (typeof WEAK_TAGS)[number]["id"];
export const weakTagLabel = (id: string) => WEAK_TAGS.find((t) => t.id === id)?.label ?? id;

export const PRICE_BANDS = [
  { id: "under-20", label: "2만원 미만", min: 0, max: 19999 },
  { id: "20-30", label: "2만원대", min: 20000, max: 29999 },
  { id: "over-30", label: "3만원 이상", min: 30000, max: Infinity },
] as const;
export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

/**
 * 사회·과학탐구는 과목 단위로 시리즈를 구성합니다. 교재가 등록되면 같은 과목명(course)으로 연결됩니다.
 * 교육과정별 과목명과 학년도별 출제 범위는 상품 등록 시 확정하며, 수능 출제 범위는 한국교육과정평가원 공고를 기준으로 합니다.
 */
export const COURSE_PLAN = {
  social: {
    label: "사회탐구",
    kinds: ["concept", "past-exam", "variant", "mock"] as KindId[],
    courses: ["생활과 윤리", "윤리와 사상", "사회·문화", "한국지리", "세계지리", "동아시아사", "세계사", "정치와 법", "경제"],
  },
  science: {
    label: "과학탐구",
    kinds: ["concept", "past-exam", "variant", "mock"] as KindId[],
    courses: ["물리학", "화학", "생명과학", "지구과학"],
    courseNamesByCurriculum: {
      "2015": ["물리학Ⅰ", "물리학Ⅱ", "화학Ⅰ", "화학Ⅱ", "생명과학Ⅰ", "생명과학Ⅱ", "지구과학Ⅰ", "지구과학Ⅱ"],
      "2022": ["물리학", "화학", "생명과학", "지구과학"],
    },
  },
} as const;

// ── 조회 도우미 ────────────────────────────────────────────
const find = <T extends { id: string; label: string }>(list: readonly T[], id: string | null | undefined) =>
  list.find((x) => x.id === id);

export const levelLabel = (id: string) => find(LEVELS, id)?.label ?? id;
export const areaLabel = (id: string) => find(AREAS, id)?.label ?? id;
export const kindLabel = (id: string) => find(KINDS, id)?.label ?? id;
export const trackLabel = (id: string) => find(TRACKS, id)?.label ?? id;
export const difficultyLabel = (id: string | null | undefined) => find(DIFFICULTIES, id)?.label ?? "";
export const curriculumLabel = (id: string | null | undefined) => find(CURRICULA, id)?.label ?? "";
export const statusLabel = (id: string) => find(STATUSES, id)?.label ?? id;
export const areaInfo = (id: string) => AREAS.find((a) => a.id === id) ?? AREAS[AREAS.length - 1];

/** 학년 배열을 화면 문구로: [middle1,middle2,middle3] → "중1–중3", [high1] → "고1" */
export function levelsText(levels: readonly string[]) {
  const order = LEVELS.map((l) => l.id as string);
  const sorted = [...levels].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (!sorted.length) return "";
  const groups = new Map<string, string[]>();
  for (const id of sorted) {
    const g = LEVELS.find((l) => l.id === id)?.group ?? "etc";
    groups.set(g, [...(groups.get(g) ?? []), id]);
  }
  const parts: string[] = [];
  for (const [g, ids] of groups) {
    if (g === "suneung") parts.push("수능");
    else if (ids.length === 1) parts.push(levelLabel(ids[0]));
    else parts.push(`${levelLabel(ids[0])}–${levelLabel(ids[ids.length - 1])}`);
  }
  return parts.join(" · ");
}

export const deliveryLabel = (id: string | null | undefined) => find(DELIVERY_TYPES, id)?.label ?? "";

export const isOneOf = <T extends readonly { id: string }[]>(list: T, v: unknown): v is T[number]["id"] =>
  typeof v === "string" && list.some((x) => x.id === v);
