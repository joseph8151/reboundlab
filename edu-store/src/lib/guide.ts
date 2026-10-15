/**
 * 학습 고민·진단·시험 직전 추천에 쓰는 규칙 기반 추천 로직(순수 함수).
 * 상품의 취약 유형 태그(weakTags)·학년·과목·유형·난이도를 점수로 매기며, AI나 실력 측정을 하지 않습니다.
 */
import { weakTagLabel, type AreaId, type DifficultyId, type KindId, type LevelId } from "./catalog";

/** 화면으로 내려보내는 최소 상품 정보 */
export type GuideProduct = {
  slug: string;
  title: string;
  price: number | null;
  levels: LevelId[];
  area: AreaId;
  kind: KindId;
  difficulty: DifficultyId | null;
  weakTags: string[];
  track: string;
  deliveryType: "custom" | "ready";
  featuredRank: number | null;
  questionCount: number | null;
  pageCount: number | null;
};

export const CONCERNS = [
  { id: "kor-reading", label: "국어 독서 지문을 읽어도 이해가 안 돼요", area: "korean", tags: ["kor-reading", "kor-inference"] },
  { id: "kor-literature", label: "국어 문학 선지가 헷갈려요", area: "korean", tags: ["kor-literature", "kor-choice"] },
  { id: "math-apply", label: "수학은 개념을 아는데 응용문제가 어려워요", area: "math", tags: ["math-concept-apply"] },
  { id: "math-calc", label: "수학 계산 실수가 많아요", area: "math", tags: ["math-calc"] },
  { id: "eng-blank", label: "영어 빈칸 추론을 자주 틀려요", area: "english", tags: ["eng-blank"] },
  { id: "eng-order", label: "영어 순서 배열과 문장 삽입이 어려워요", area: "english", tags: ["eng-order", "eng-insert"] },
  { id: "eng-writing", label: "영어 서술형 점수가 낮아요", area: "english", tags: ["eng-writing"] },
  { id: "soc-apply", label: "사회탐구 개념은 아는데 문제에 적용하기 어려워요", area: "social", tags: ["soc-apply"] },
  { id: "sci-data", label: "과학탐구 자료 해석이 어려워요", area: "science", tags: ["sci-data"] },
  { id: "time", label: "시험 시간이 항상 부족해요", area: null, tags: ["time"] },
  { id: "school-score", label: "내신 성적이 오르지 않아요", area: null, tags: ["school-score"] },
] as const;
export type ConcernId = (typeof CONCERNS)[number]["id"];

/** 학생 학년 선택 → 대상 학년 id */
export const GRADE_CHOICES = [
  { id: "middle1", label: "중1", levels: ["middle1"] },
  { id: "middle2", label: "중2", levels: ["middle2"] },
  { id: "middle3", label: "중3", levels: ["middle3"] },
  { id: "high1", label: "고1", levels: ["high1"] },
  { id: "high2", label: "고2", levels: ["high2"] },
  { id: "high3", label: "고3", levels: ["high3", "suneung"] },
  { id: "suneung", label: "N수생", levels: ["suneung", "high3"] },
] as const satisfies readonly { id: string; label: string; levels: readonly LevelId[] }[];
export type GradeChoiceId = (typeof GRADE_CHOICES)[number]["id"];

/** 성적대: 학습 목적을 설명하는 분류이며 등급을 예측하지 않습니다. */
export const LEVEL_BANDS = [
  { id: "foundation", label: "기초 개념 보완", note: "개념을 처음부터 정리하고 기본 유형을 익히는 단계", difficulties: ["basic"], kinds: ["concept"] },
  { id: "middle", label: "중위권 유형 정리", note: "대표 유형을 정리하고 약점 유형을 반복하는 단계", difficulties: ["standard"], kinds: ["variant", "concept"] },
  { id: "upper", label: "상위권 심화 훈련", note: "고난도 유형과 기출 분석으로 판단력을 높이는 단계", difficulties: ["advanced"], kinds: ["past-exam", "variant"] },
  { id: "top", label: "최상위권 실전 대비", note: "실전 형식과 시간 배분을 점검하는 단계", difficulties: ["advanced"], kinds: ["mock", "past-exam"] },
] as const;
export type LevelBandId = (typeof LEVEL_BANDS)[number]["id"];
const bandIndex = (id: string) => LEVEL_BANDS.findIndex((b) => b.id === id);

const KIND_ORDER: Record<string, number> = { concept: 0, variant: 1, "past-exam": 2, material: 3, mock: 4 };

export type Rec = { product: GuideProduct; score: number; reasons: string[] };

export type RecInput = {
  tags?: string[];
  area?: AreaId | null;
  levels?: readonly LevelId[];
  band?: LevelBandId;
  kinds?: KindId[];
  difficulty?: DifficultyId;
  limit?: number;
  /** 과목이 정해지지 않았을 때를 위해 태그 일치 없이도 과목 일치로 후보에 넣을지 */
  allowAreaOnly?: boolean;
};

export function recommend(all: GuideProduct[], input: RecInput): Rec[] {
  const tags = input.tags ?? [];
  const out: Rec[] = [];
  for (const p of all) {
    const reasons: string[] = [];
    let score = 0;
    const matched = p.weakTags.filter((t) => tags.includes(t));
    if (matched.length) {
      score += 10 * matched.length;
      reasons.push(`${matched.map(weakTagLabel).join("·")} 유형과 연결된 교재`);
    }
    if (input.area && p.area === input.area) {
      score += 3;
      if (!matched.length) reasons.push(`${p.area === "korean" ? "국어" : p.area === "math" ? "수학" : p.area === "english" ? "영어" : p.area === "social" ? "사회탐구" : "과학탐구"} 교재`);
    }
    if (input.levels?.length) {
      if (p.levels.some((l) => input.levels!.includes(l))) {
        score += 4;
        reasons.push("선택한 학년에 맞는 교재");
      } else if (p.levels.length) score -= 6;
    }
    if (input.band) {
      const b = LEVEL_BANDS[bandIndex(input.band)];
      if (p.difficulty && (b.difficulties as readonly string[]).includes(p.difficulty)) score += 2;
      if ((b.kinds as readonly string[]).includes(p.kind)) {
        score += 2;
        reasons.push(`${b.label} 단계에 맞는 ${p.kind === "concept" ? "개념" : p.kind === "variant" ? "유형" : p.kind === "past-exam" ? "기출 분석" : "실전"} 구성`);
      }
    }
    if (input.kinds?.length && input.kinds.includes(p.kind)) {
      score += 4;
    }
    if (input.difficulty && p.difficulty === input.difficulty) score += 2;
    if (p.featuredRank !== null) score += 0.5;
    const eligible = tags.length ? matched.length > 0 || (input.allowAreaOnly && p.area === input.area) : true;
    if (!eligible || score <= 0) continue;
    out.push({ product: p, score, reasons: [...new Set(reasons)] });
  }
  return out.sort((a, b) => b.score - a.score || (a.product.featuredRank ?? 99) - (b.product.featuredRank ?? 99) || a.product.title.localeCompare(b.product.title, "ko")).slice(0, input.limit ?? 4);
}

/** 학습 순서: 개념 → 유형 → 기출·심화 → 실전 순으로 정렬 */
export const orderForStudy = (recs: Rec[]) => [...recs].sort((a, b) => (KIND_ORDER[a.product.kind] ?? 5) - (KIND_ORDER[b.product.kind] ?? 5));

export const sumPrice = (items: { price: number | null }[]) => (items.length && items.every((i) => i.price !== null) ? items.reduce((s, i) => s + (i.price ?? 0), 0) : null);

// ── 시험 D-DAY ─────────────────────────────────────────────
export type ExamStage = { id: string; min: number; max: number; label: string; headline: string; points: string[]; kinds: KindId[]; band?: LevelBandId; tags?: string[] };

export const EXAM_STAGES: ExamStage[] = [
  { id: "d31", min: 31, max: 9999, label: "D-31 이상", headline: "개념 보완과 유형 정리", points: ["범위를 확인하고 약한 개념부터 다시 정리합니다.", "대표 유형을 한 번 풀어 보며 취약 유형을 표시합니다.", "하루 학습량을 정해 매일 같은 시간에 진행합니다."], kinds: ["concept", "variant"] },
  { id: "d30", min: 15, max: 30, label: "D-30", headline: "개념 보완 및 유형 정리", points: ["개념 보완과 유형 정리를 마무리하는 시기입니다.", "표시해 둔 취약 개념을 한 번 더 정리합니다.", "유형별 문제로 풀이 순서를 고정합니다."], kinds: ["concept", "variant"] },
  { id: "d14", min: 8, max: 14, label: "D-14", headline: "취약 유형 집중 훈련", points: ["자주 틀리는 유형만 골라 반복합니다.", "새로운 교재를 늘리기보다 풀었던 문제의 오답을 정리합니다.", "하루 1회 시간을 재고 풀어 보는 구간을 넣습니다."], kinds: ["variant", "past-exam"] },
  { id: "d7", min: 4, max: 7, label: "D-7", headline: "실전 문제 및 오답 재점검", points: ["실제 시험 시간에 맞춰 실전 문제를 풉니다.", "오답노트를 다시 읽고 같은 실수가 반복되는지 확인합니다.", "새로운 범위는 늘리지 않습니다."], kinds: ["mock", "past-exam"] },
  { id: "d3", min: 0, max: 3, label: "D-3", headline: "핵심 개념과 실수 방지", points: ["핵심 개념과 공식을 한 장으로 정리해 훑어봅니다.", "계산·표기 실수를 줄이는 점검표를 확인합니다.", "수면과 컨디션을 우선합니다. 새 문제집은 시작하지 않습니다."], kinds: ["material", "mock"], tags: ["math-calc", "wrong-note"] },
];

export function examStage(daysLeft: number): ExamStage {
  return EXAM_STAGES.find((s) => daysLeft >= s.min && daysLeft <= s.max && s.id !== "d31") ?? EXAM_STAGES[0];
}

/** 오늘(한국 시간) 기준 남은 일수. 날짜 문자열은 YYYY-MM-DD. */
export function daysUntil(dateStr: string, now = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const kst = new Date(now.getTime() + 9 * 3600_000);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const target = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  return Math.round((target - today) / 86400_000);
}

/** 시험일까지 매일 공부 체크리스트(최대 60일). 단계별 문구는 남은 기간에 따라 달라집니다. */
export function dailyChecklist(daysLeft: number): { day: number; dLabel: string; task: string }[] {
  const n = Math.min(Math.max(daysLeft, 0), 60);
  const out: { day: number; dLabel: string; task: string }[] = [];
  for (let i = 0; i <= n; i++) {
    const d = daysLeft - (n - i); // 남은 일수
    const stage = examStage(d);
    const task =
      d === 0 ? "시험일: 새 문제는 풀지 않고 정리해 둔 핵심 개념만 훑어봅니다."
      : stage.id === "d3" ? "핵심 개념·공식 한 장 정리 훑어보기 + 실수 방지 점검"
      : stage.id === "d7" ? "실전 문제 시간 재고 풀이 + 오답 다시 점검"
      : stage.id === "d14" ? "취약 유형 집중 문제 풀이 + 틀린 문제 이유 기록"
      : "오늘 분량 개념·유형 학습 + 모르는 개념 표시";
    out.push({ day: i + 1, dLabel: d === 0 ? "D-DAY" : `D-${d}`, task });
  }
  return out;
}

// ── 학습 일정 배분 ─────────────────────────────────────────
/** total 분량을 days일에 나누어 담습니다. 나머지는 앞쪽 날에 1씩 더합니다. */
export function distribute(total: number, days: number): number[] {
  if (days <= 0 || total <= 0) return [];
  const base = Math.floor(total / days);
  const extra = total % days;
  return Array.from({ length: days }, (_, i) => base + (i < extra ? 1 : 0));
}
