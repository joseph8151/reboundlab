/**
 * 상품 기초 데이터. 이 파일은 (1) supabase/seed.sql 생성, (2) Supabase 미연결 때 사이트에 표시되는 상품 목록으로 쓰입니다.
 * 모든 상품은 '판매 중(상담 구매)'이며, PDF가 완성되지 않은 교재는 '주문 제작 상담 가능'(deliveryType custom)입니다.
 * 가격은 아래 PRICE_TABLE 한 곳에서 관리합니다. 이미 운영자가 정한 가격(우선 6종)은 다시 올리지 않습니다.
 * 출시일·교육과정·학년도·쪽수는 확정되지 않았으므로 비워 둡니다. 임의로 채우지 마세요.
 */
import type { AreaId, DeliveryType, DifficultyId, KindId, LevelId, TrackId } from "./catalog";
import { GUIDE_PACKAGES, GUIDE_PRODUCTS } from "./catalog-guides";

export type SeedProduct = {
  slug: string;
  sku: string;
  title: string;
  series?: string;
  summary: string;
  description?: string;
  track: TrackId;
  area: AreaId;
  course?: string;
  levels: LevelId[];
  kind: KindId;
  difficulty?: DifficultyId;
  questionCount?: number;
  price?: number;
  /** 운영자 지정가가 이미 반영된 상품(우선 6종)의 인상 전 가격. 기록용이며 다시 곱하지 않습니다. */
  priceOriginal?: number;
  deliveryType?: DeliveryType;
  weakTags?: string[];
  /** 신규 컬렉션(self-study / study-method / study-planner / parent-guide). 기존 수능·내신 교재는 비어 있습니다. */
  collection?: string;
  /** 학습 방법 안내 */
  method?: string;
  includes?: string[];
  targets?: string[];
  goals?: string[];
  keywords?: string[];
  featuredRank?: number;
  seoTitle?: string;
  seoDescription?: string;
};

// ── 1. 우선 출시 6종 (가격은 운영자 지정가) ───────────────────
export const PRIORITY_PRODUCTS: SeedProduct[] = [
  {
    slug: "csat-english-blank-inference-100",
    sku: "ME-CSAT-ENG-001",
    title: "수능 영어 빈칸 추론 100제",
    series: "수능 영어 유형별 훈련",
    summary: "빈칸 추론 한 가지 유형만 100문항으로 묶어, 빈칸 문장의 성격과 근거 문장을 찾는 순서를 반복 훈련합니다.",
    description:
      "빈칸 추론은 해석이 되어도 정답을 놓치기 쉬운 유형입니다. 이 교재는 빈칸이 들어간 문장의 역할을 먼저 판단하고, 지문 안에서 그 문장을 뒷받침하는 근거를 찾는 과정을 문항마다 같은 순서로 연습하도록 구성합니다.\n\n해설은 정답 선지만 설명하지 않고, 근거 문장과 오답 선지가 배제되는 이유를 함께 다룹니다. 풀이 과정을 스스로 점검할 수 있도록 한 문항씩 끝까지 따라갈 수 있는 형식을 지향합니다.",
    track: "csat", area: "english", course: "독해", levels: ["suneung"], kind: "variant", difficulty: "advanced", questionCount: 100, price: 25800, priceOriginal: 12900,
    goals: ["빈칸 문장의 역할(주제·재진술·대조)을 먼저 판단한다", "지문에서 근거 문장을 찾아 선지와 대응시킨다", "그럴듯한 오답이 배제되는 이유를 말로 설명한다"],
    keywords: ["수능 영어 빈칸 추론", "수능 영어 문제집", "빈칸 추론 문제"],
    featuredRank: 1,
    seoTitle: "수능 영어 빈칸 추론 100제",
    seoDescription: "수능 영어 빈칸 추론 유형만 100문항으로 구성한 훈련 교재. 근거 문장을 찾는 풀이 순서와 오답 배제 해설을 다룹니다. 멜리사 에듀(MELISSA EDU) ",
  },
  {
    slug: "high1-common-math1-variant-300",
    sku: "ME-SCHO-MAT-001",
    title: "고1 공통수학1 내신 변형문제 300",
    series: "고등 수학 내신 변형문제",
    summary: "공통수학1 대표 유형을 조건만 바꾸어 다시 출제한 변형문제 300문항으로, 학교 시험 직전 점검에 맞춥니다.",
    description:
      "내신 수학에서 점수 차이는 교재의 예제를 약간 바꾼 문제에서 벌어집니다. 이 교재는 공통수학1의 대표 유형을 정리하고, 같은 개념을 다른 조건과 표현으로 묻는 변형문제 300문항을 담도록 구성합니다.\n\n각 문항에는 원래 어떤 유형에서 나온 문제인지를 표시해, 틀린 문제를 어느 개념으로 돌아가 복습해야 하는지 바로 알 수 있게 합니다.",
    track: "school", area: "math", course: "공통수학1", levels: ["high1"], kind: "variant", difficulty: "standard", questionCount: 300, price: 29800, priceOriginal: 14900,
    goals: ["대표 유형의 풀이 구조를 정확히 익힌다", "조건이 바뀐 문제에서도 같은 개념을 적용한다", "틀린 문제의 원유형을 찾아 복습한다"],
    keywords: ["고1 수학 문제집", "고1 공통수학1", "내신 변형문제", "고등 수학 유형별 문제"],
    featuredRank: 2,
    seoTitle: "고1 공통수학1 내신 변형문제 300",
    seoDescription: "고1 공통수학1 대표 유형을 조건을 바꿔 다시 출제한 내신 변형문제 300문항. 원유형 표시로 복습 방향을 잡습니다. 멜리사 에듀(MELISSA EDU) ",
  },
  {
    slug: "csat-korean-reading-advanced-past-exam",
    sku: "ME-CSAT-KOR-001",
    title: "수능 국어 독서 고난도 기출 분석",
    series: "수능 국어 기출 분석",
    summary: "독서 영역에서 정답률이 낮았던 고난도 기출을 골라, 지문 구조와 선지 판단 근거를 단계별로 분석합니다.",
    description:
      "독서 고난도 문항은 지문의 정보량보다 선지가 요구하는 판단의 종류가 다양해서 어렵습니다. 이 교재는 고난도 기출을 대상으로 지문을 문단별 핵심으로 정리하고, 선지가 지문의 어느 부분에 대응하는지를 표시하는 분석 방식을 다룹니다.\n\n문항 출처(학년도·시행월·문항 번호)는 모두 표기하는 것을 원칙으로 하며, 기출 문항의 수록 범위와 이용 허락은 출시 전에 별도로 확정합니다.",
    track: "csat", area: "korean", course: "독서", levels: ["suneung"], kind: "past-exam", difficulty: "advanced", price: 31800, priceOriginal: 15900,
    goals: ["지문을 문단별 핵심으로 요약하는 방식을 익힌다", "선지가 대응하는 지문 위치를 찾아 판단한다", "고난도 문항의 오답 패턴을 유형으로 정리한다"],
    keywords: ["수능 국어 독서", "수능 국어 문제집", "수능 기출문제집", "독서 고난도"],
    featuredRank: 3,
    seoTitle: "수능 국어 독서 고난도 기출 분석",
    seoDescription: "수능 국어 독서 영역의 고난도 기출을 지문 구조와 선지 판단 근거로 분석하는 교재. 멜리사 에듀(MELISSA EDU) ",
  },
  {
    slug: "high-english-descriptive-writing-intensive",
    sku: "ME-SCHO-ENG-001",
    title: "고등 영어 서술형 집중 문제집",
    series: "고등 영어 내신",
    summary: "고등학교 영어 내신 서술형을 어법 판단, 문장 전환, 영작 유형으로 나누어 연습하는 문제집입니다.",
    description:
      "서술형은 아는 문법을 정확한 문장으로 쓰는 단계에서 감점이 발생합니다. 이 교재는 서술형 문항을 어법 오류 수정, 문장 전환, 조건 영작으로 나누고, 유형마다 감점되기 쉬운 지점과 답안을 쓰는 틀을 함께 제시하도록 구성합니다.\n\n채점 기준을 문항에 붙여 두어, 부분 점수가 어디서 갈리는지 스스로 확인할 수 있게 합니다.",
    track: "school", area: "english", course: "영어 서술형", levels: ["high1", "high2", "high3"], kind: "variant", difficulty: "standard", price: 25800, priceOriginal: 12900,
    goals: ["서술형 문항을 유형별로 구분해 접근한다", "감점되기 쉬운 지점을 점검하며 답안을 쓴다", "조건 영작의 문장 틀을 익힌다"],
    keywords: ["고등 영어 서술형 문제집", "고등학교 내신 문제집", "영어 서술형"],
    featuredRank: 4,
    seoTitle: "고등 영어 서술형 집중 문제집",
    seoDescription: "고등학교 영어 내신 서술형을 어법 판단·문장 전환·영작으로 나누어 연습하는 문제집. 채점 기준 포함. 멜리사 에듀(MELISSA EDU) ",
  },
  {
    slug: "csat-english-order-insertion-100",
    sku: "ME-CSAT-ENG-002",
    title: "수능 영어 순서·삽입 실전 100제",
    series: "수능 영어 유형별 훈련",
    summary: "글의 순서와 문장 삽입, 두 유형을 실전 형식 100문항으로 구성해 논리 흐름을 판단하는 연습에 집중합니다.",
    description:
      "순서와 문장 삽입은 지시어, 연결어, 관사 같은 단서를 어떤 순서로 확인하느냐에 따라 풀이 시간이 크게 달라집니다. 이 교재는 두 유형을 실전 형식으로 묶어 단서를 확인하는 순서를 반복 연습하도록 구성합니다.\n\n해설에서는 논리가 끊기는 지점과 정답 선지가 이어지는 근거를 문장 단위로 밝힙니다.",
    track: "csat", area: "english", course: "독해", levels: ["suneung"], kind: "variant", difficulty: "standard", questionCount: 100, price: 23800, priceOriginal: 11900,
    goals: ["지시어·연결어·관사 단서를 순서대로 확인한다", "첫 문장 선택과 연결 검증으로 순서 문제를 푼다", "논리가 끊기는 지점을 찾아 문장을 삽입한다"],
    keywords: ["수능 영어 순서", "수능 영어 문장 삽입", "수능 영어 문제집"],
    featuredRank: 5,
    seoTitle: "수능 영어 순서·삽입 실전 100제",
    seoDescription: "수능 영어 글의 순서·문장 삽입을 실전 형식 100문항으로 훈련하는 교재. 멜리사 에듀(MELISSA EDU) ",
  },
  {
    slug: "middle3-high-english-preview-grammar",
    sku: "ME-SCHO-ENG-002",
    title: "중3 고등 영어 선행 문법",
    series: "중등 영어",
    summary: "중학교 3학년이 고등학교 영어를 시작하기 전에 꼭 정리해야 할 핵심 문법을 단계별로 다지는 교재입니다.",
    description:
      "고등학교 영어는 지문의 길이와 문장 구조가 달라지면서 중학교 문법을 정확히 알고 있는지가 곧바로 독해 속도로 나타납니다. 이 교재는 중3 학생이 고등 영어에서 반복해서 만나는 문법 항목을 순서대로 정리하고 확인 문제로 점검하도록 구성합니다.\n\n문법 설명은 용어를 최소화하고, 문장 안에서 어떻게 쓰이는지 보여 주는 방식을 따릅니다.",
    track: "school", area: "english", course: "영어 문법", levels: ["middle3"], kind: "concept", difficulty: "basic", price: 25800, priceOriginal: 12900,
    goals: ["고등 영어에서 자주 쓰이는 문법 항목을 정리한다", "문장 구조를 보고 해석의 순서를 정한다", "확인 문제로 이해한 내용을 점검한다"],
    keywords: ["중3 영어 문법", "고등 영어 선행", "중등 영어 문법 문제집"],
    featuredRank: 6,
    seoTitle: "중3 고등 영어 선행 문법",
    seoDescription: "중학교 3학년이 고등 영어를 시작하기 전에 정리해야 할 핵심 문법을 단계별로 다지는 교재. 멜리사 에듀(MELISSA EDU) ",
  },
];

// ── 2. 추가 교재 목록 (가격은 아래 PRICE_TABLE로 등록) ────────────────────────────────────
type Row = [slug: string, title: string, course: string | null, kind: KindId, difficulty?: DifficultyId, series?: string];
const csat = (area: AreaId, prefix: string, seriesName: string, rows: Row[], levels: LevelId[] = ["suneung"]): SeedProduct[] =>
  rows.map(([slug, title, course, kind, difficulty, series], i) => ({
    slug: `${prefix}-${slug}`,
    sku: "",
    title,
    series: series ?? seriesName,
    summary: "",
    track: "csat" as TrackId,
    area,
    course: course ?? undefined,
    levels,
    kind,
    difficulty,
  }));

const school = (prefix: string, seriesName: string, area: AreaId, levels: LevelId[], rows: Row[]): SeedProduct[] =>
  rows.map(([slug, title, course, kind, difficulty, series], i) => ({
    slug: `${prefix}-${slug}`,
    sku: "",
    title,
    series: series ?? seriesName,
    summary: "",
    track: "school" as TrackId,
    area,
    course: course ?? undefined,
    levels,
    kind,
    difficulty,
  }));

const HS: LevelId[] = ["high1", "high2", "high3"];
const MS: LevelId[] = ["middle1", "middle2", "middle3"];

export const PLANNED_PRODUCTS: SeedProduct[] = [
  // 수능 국어
  ...csat("korean", "csat-korean", "수능 국어 기출 분석", [
    ["reading-past-exam", "수능 국어 독서 기출 분석", "독서", "past-exam"],
    ["literature-past-exam", "수능 국어 문학 기출 분석", "문학", "past-exam"],
    ["speech-writing", "수능 국어 화법과 작문", "화법과 작문", "concept", undefined, "수능 국어 선택 영역"],
    ["language-media", "수능 국어 언어와 매체", "언어와 매체", "concept", undefined, "수능 국어 선택 영역"],
    ["reading-advanced-workbook", "수능 국어 독서 고난도 문제집", "독서", "variant", "advanced", "수능 국어 고난도"],
    ["literature-ebs-linked", "수능 국어 문학 EBS 연계 대비", "문학", "variant", undefined, "수능 국어 연계 대비"],
    ["mock-exam", "수능 국어 실전 모의고사", null, "mock", undefined, "수능 국어 실전 모의고사"],
    ["error-type-analysis", "수능 국어 오답 유형 분석", null, "material", undefined, "수능 국어 오답 관리"],
    ["grade1-advanced-workbook", "수능 국어 1등급 심화 문제집", null, "variant", "advanced", "수능 국어 고난도"],
    ["grade34-foundation", "수능 국어 3·4등급 기초 보완 교재", null, "concept", "basic", "수능 국어 기초 보완"],
  ]),
  // 수능 수학
  ...csat("math", "csat-math", "수능 수학 개념·유형", [
    ["common-concept-summary", "수능 수학 공통 개념 총정리", "공통", "concept", "basic"],
    ["algebra", "수능 수학 대수", "대수", "concept"],
    ["calculus1", "수능 수학 미적분Ⅰ", "미적분Ⅰ", "concept"],
    ["probability-statistics", "수능 수학 확률과 통계", "확률과 통계", "concept"],
    ["calculus2", "수능 수학 미적분Ⅱ", "미적분Ⅱ", "concept"],
    ["geometry", "수능 수학 기하", "기하", "concept"],
    ["advanced-types", "수능 수학 고난도 유형", null, "variant", "advanced", "수능 수학 고난도"],
    ["semi-killer-training", "수능 수학 준킬러 집중 훈련", null, "variant", "advanced", "수능 수학 고난도"],
    ["mock-exam", "수능 수학 실전 모의고사", null, "mock", undefined, "수능 수학 실전 모의고사"],
    ["calculation-error-prevention", "수능 수학 계산 실수 방지", null, "material", undefined, "수능 수학 오답 관리"],
    ["error-type-retraining", "수능 수학 오답 유형별 재훈련", null, "material", undefined, "수능 수학 오답 관리"],
  ]),
  // 수능 영어 (빈칸 추론·순서·삽입은 우선 출시 상품과 중복되므로 개별 유형 교재만 둡니다)
  ...csat("english", "csat-english", "수능 영어 유형별 훈련", [
    ["reading-basic", "수능 영어 독해 기본", "독해", "concept", "basic", "수능 영어 독해"],
    ["order", "수능 영어 순서 배열", "독해", "variant"],
    ["insertion", "수능 영어 문장 삽입", "독해", "variant"],
    ["grammar", "수능 영어 어법", "어법", "concept"],
    ["vocabulary", "수능 영어 어휘", "어휘", "concept", undefined, "수능 영어 어휘"],
    ["listening", "수능 영어 듣기", "듣기", "variant"],
    ["long-reading", "수능 영어 장문 독해", "독해", "variant"],
    ["grade1-practice", "수능 영어 1등급 실전 문제집", null, "variant", "advanced", "수능 영어 고난도"],
    ["mock-exam", "수능 영어 실전 모의고사", null, "mock", undefined, "수능 영어 실전 모의고사"],
    ["essential-vocabulary-2000", "수능 영어 필수 어휘 2000", "어휘", "material", undefined, "수능 영어 어휘"],
    ["error-intensive", "수능 영어 오답 집중 훈련", null, "material", undefined, "수능 영어 오답 관리"],
  ]),
  // 고등 내신
  ...school("hs", "고등 내신", "korean", ["high1"], [
    ["high1-common-korean", "고1 공통국어 내신 대비", "공통국어", "concept"],
  ]),
  ...school("hs", "고등 내신", "english", ["high1"], [
    ["high1-common-english", "고1 공통영어 내신 대비", "공통영어", "concept"],
  ]),
  ...school("hs", "고등 수학 내신", "math", HS, [
    ["math-midterm", "고등 수학 중간고사 대비", null, "variant", undefined, "고등 수학 내신 변형문제"],
    ["math-final", "고등 수학 기말고사 대비", null, "variant", undefined, "고등 수학 내신 변형문제"],
  ]),
  ...school("hs", "고등 국어 내신", "korean", HS, [
    ["korean-literature-by-work", "고등 국어 문학 작품별 분석", "문학", "concept"],
  ]),
  ...school("hs", "고등 내신", "common", HS, [
    ["grade1-practice", "고등 내신 1등급 실전 문제", null, "variant", "advanced"],
    ["performance-assessment", "고등학교 수행평가 준비 자료", null, "material"],
    ["semester-concept-summary", "고등학교 학기별 개념 정리", null, "concept"],
  ]),
  // 중학교 내신
  ...school("ms", "중등 국어", "korean", MS, [
    ["korean-reading", "중등 국어 독해력", "독해", "concept"],
    ["korean-grammar", "중등 국어 문법", "문법", "concept"],
  ]),
  ...school("ms", "중등 수학", "math", MS, [
    ["math-concept", "중등 수학 개념", null, "concept"],
    ["math-by-type", "중등 수학 유형별 문제", null, "variant"],
  ]),
  ...school("ms", "중등 영어", "english", MS, [
    ["english-grammar", "중등 영어 문법", "영어 문법", "concept"],
    ["english-reading", "중등 영어 독해", "독해", "concept"],
    ["english-descriptive", "중등 영어 서술형", "영어 서술형", "variant"],
  ]),
  ...school("ms", "중등 과학·사회", "science", MS, [["science-core-concepts", "중등 과학 핵심 개념", null, "concept"]]),
  ...school("ms", "중등 과학·사회", "social", MS, [
    ["social-core-concepts", "중등 사회 핵심 개념", null, "concept"],
    ["history", "중등 역사", "역사", "concept"],
  ]),
  ...school("ms", "중등 시험 대비", "common", MS, [
    ["midterm", "중등 중간고사 대비", null, "variant"],
    ["final", "중등 기말고사 대비", null, "variant"],
  ]),
  // 모의고사 시리즈 (수능 국어·수학·영어 실전 모의고사는 위 수능 과목별 목록에 있습니다)
  ...school("mock", "모의고사 시리즈", "common", ["high1"], [["high1-nationwide", "고1 전국연합 대비", null, "mock"]]),
  ...school("mock", "모의고사 시리즈", "common", ["high2"], [["high2-nationwide", "고2 전국연합 대비", null, "mock"]]),
  ...csat("common", "mock", "모의고사 시리즈", [["high3-kice-mock-prep", "고3 평가원 모의평가 대비", null, "mock"]], ["high3"]),
  ...csat("common", "mock", "모의고사 시리즈", [
    ["subject-mini-mock", "과목별 미니 모의고사", null, "mock"],
    ["unit-diagnostic-test", "단원별 실력 진단 테스트", null, "mock"],
    ["final-mock-exam", "시험 직전 파이널 모의고사", null, "mock"],
  ]),
  // 학습 관리 및 부가 상품
  ...(
    [
      ["csat-30day-planner", "30일 수능 공부 플래너", ["suneung"]],
      ["csat-100day-plan", "100일 수능 학습 계획표", ["suneung"]],
      ["csat-d100-management", "수능 D-100 학습 관리", ["suneung"]],
      ["school-4week-planner", "내신 시험 4주 플래너", [...MS, ...HS]],
      ["wrong-answer-note", "오답노트 PDF", [...MS, ...HS, "suneung"]],
      ["subject-review-tracker", "과목별 회독 관리표", [...HS, "suneung"]],
      ["english-vocabulary-notebook", "영어 단어 암기장", [...MS, ...HS, "suneung"]],
      ["korean-reading-analysis-note", "국어 독서 분석 노트", [...HS, "suneung"]],
      ["math-formula-note", "수학 공식 정리 노트", [...MS, ...HS, "suneung"]],
      ["achievement-checklist", "학습 성취도 점검표", [...MS, ...HS, "suneung"]],
    ] as [string, string, LevelId[]][]
  ).map(
    ([slug, title, levels], i): SeedProduct => ({
      slug: `planner-${slug}`,
      sku: "",
      title,
      series: "학습 관리",
      summary: "",
      track: "common",
      area: "common",
      levels,
      kind: "material",
    }),
  ),
];

// ── 3. 패키지(묶음): 구성 교재는 위 목록의 교재로만 구성합니다 ──
const BASE_PACKAGES: { slug: string; title: string; track: TrackId; price: number; summary: string; items: string[]; weakTags: string[] }[] = [
  { slug: "csat-english-blank-order-package", title: "수능 영어 빈칸·순서 집중 패키지", track: "csat", price: 49800, weakTags: ["eng-blank", "eng-order", "eng-insert"],
    summary: "빈칸 추론과 순서·삽입, 두 가지 약점 유형을 한 번에 훈련하는 구성입니다.",
    items: ["csat-english-blank-inference-100", "csat-english-order-insertion-100", "csat-english-long-reading"] },
  { slug: "csat-korean-reading-package", title: "수능 국어 독서·문학 패키지", track: "csat", price: 49800, weakTags: ["kor-reading", "kor-inference", "kor-literature"],
    summary: "독서 고난도 기출 분석과 문학 기출 분석을 함께 쓰는 구성입니다.",
    items: ["csat-korean-reading-advanced-past-exam", "csat-korean-literature-past-exam", "csat-korean-reading-advanced-workbook"] },
  { slug: "csat-math-calc-package", title: "수능 수학 실전·계산 정확도 패키지", track: "csat", price: 49800, weakTags: ["math-calc", "math-concept-apply"],
    summary: "고난도 유형 훈련과 계산 실수 방지, 실전 모의고사를 묶었습니다.",
    items: ["csat-math-advanced-types", "csat-math-calculation-error-prevention", "csat-math-mock-exam"] },
  { slug: "high1-school-comprehensive-package", title: "고1 내신 종합 패키지", track: "school", price: 69800, weakTags: ["school-score", "math-concept-apply"],
    summary: "고1 공통수학1 변형문제와 공통국어·공통영어 내신 대비를 한 세트로 구성했습니다.",
    items: ["high1-common-math1-variant-300", "hs-high1-common-korean", "hs-high1-common-english", "mock-high1-nationwide"] },
  { slug: "middle-english-grammar-reading-package", title: "중등 영어 문법·독해 패키지", track: "school", price: 49800, weakTags: ["eng-grammar"],
    summary: "중등 영어 문법·독해·서술형과 중3 고등 영어 선행 문법을 묶었습니다.",
    items: ["ms-english-grammar", "ms-english-reading", "ms-english-descriptive", "middle3-high-english-preview-grammar"] },
  { slug: "csat-final-mock-package", title: "수능 파이널 모의고사 패키지", track: "csat", price: 69800, weakTags: ["time"],
    summary: "수능 국어·수학·영어 실전 모의고사와 파이널 모의고사를 묶은 실전 대비 구성입니다.",
    items: ["csat-korean-mock-exam", "csat-math-mock-exam", "csat-english-mock-exam", "mock-final-mock-exam"] },
];

export const PLANNED_PACKAGES = [...BASE_PACKAGES, ...(GUIDE_PACKAGES as unknown as typeof BASE_PACKAGES)];

/** 상품 코드는 (과정, 과목)별 일련번호로 겹치지 않게 부여합니다. 우선 출시 6종은 001~ 번대를 씁니다. */
function assignSkus(list: SeedProduct[]): SeedProduct[] {
  const counters = new Map<string, number>();
  return list.map((p) => {
    const key = `${p.track}-${p.area}`;
    const n = (counters.get(key) ?? 10) + 1;
    counters.set(key, n);
    return { ...p, sku: `ME-${p.track.toUpperCase().slice(0, 4)}-${p.area.slice(0, 3).toUpperCase()}-${String(n).padStart(3, "0")}` };
  });
}

// ── 가격표(원) ─ 운영자 확정 전 권장 가격입니다. 바꾸려면 이 표의 숫자만 수정하세요. ──
export const PRICE_TABLE = {
  koreanEnglishUnit: 19800, // 국어·영어 단원별 집중 문제집
  mathUnit: 25800, // 수학 단원별 유형
  csatPastExam: 29800, // 수능 기출 분석
  csatAdvanced: 35800, // 수능 고난도 심화
  mock: 29800, // 실전 모의고사
  finalComprehensive: 39800, // 파이널 종합
  highVariant: 25800, // 고등 내신 변형문제
  highComprehensive: 35800, // 고등 내신 종합
  middle: 19800, // 중학교 내신
  middleDescriptive: 23800, // 중등 서술형 집중
  inquiry: 25800, // 사회·과학 탐구
  planner: 9800, // 학습 플래너·오답노트
} as const;

function tierPrice(p: SeedProduct): number {
  const T = PRICE_TABLE;
  if (p.track === "common") return T.planner;
  if (p.slug.endsWith("final-mock-exam")) return T.finalComprehensive;
  if (p.kind === "mock") return T.mock;
  if (p.track === "school" && p.levels.some((l) => l.startsWith("middle"))) return p.course === "영어 서술형" ? T.middleDescriptive : T.middle;
  if (p.track === "school") return p.kind === "concept" || p.slug.includes("grade1") ? T.highComprehensive : T.highVariant;
  // 수능
  if (p.area === "social" || p.area === "science") return T.inquiry;
  if (p.kind === "past-exam") return T.csatPastExam;
  if (p.difficulty === "advanced") return T.csatAdvanced;
  if (p.area === "math") return T.mathUnit;
  return T.koreanEnglishUnit;
}

/** 취약 유형 태그: 교재명·과목·세부 과목으로 연결합니다. 상품마다 DB/관리자에서 수정할 수 있습니다. */
function tagsFor(p: SeedProduct): string[] {
  const t = `${p.title} ${p.course ?? ""}`;
  const out = new Set<string>();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (p.area === "korean") {
    if (has("독서", "독해")) out.add("kor-reading"), out.add("kor-inference");
    if (has("문학")) out.add("kor-literature");
    if (has("고난도", "1등급", "기출")) out.add("kor-choice");
  }
  if (p.area === "math") {
    if (has("계산")) out.add("math-calc");
    if (has("유형", "고난도", "준킬러", "공통수학", "개념")) out.add("math-concept-apply");
    if (has("대수", "미적분")) out.add("math-function");
    if (has("확률")) out.add("math-counting");
    if (has("기하")) out.add("math-geometry");
    if (has("오답")) out.add("math-calc");
  }
  if (p.area === "english") {
    if (has("빈칸")) out.add("eng-blank");
    if (has("순서")) out.add("eng-order");
    if (has("삽입")) out.add("eng-insert");
    if (has("어법", "문법")) out.add("eng-grammar");
    if (has("어휘", "단어")) out.add("eng-vocab");
    if (has("장문", "독해")) out.add("eng-long");
    if (has("서술형")) out.add("eng-writing");
  }
  if (p.area === "social") out.add("soc-apply");
  if (p.area === "science") out.add("sci-data");
  if (p.kind === "mock") out.add("time");
  if (p.track === "school") out.add("school-score");
  if (has("오답")) out.add("wrong-note");
  return [...out];
}

function finalize(list: SeedProduct[]): SeedProduct[] {
  return list.map((p) => ({
    ...p,
    price: p.price ?? tierPrice(p),
    deliveryType: p.deliveryType ?? "custom",
    weakTags: p.weakTags ?? tagsFor(p),
  }));
}

export const SEED_PRODUCTS: SeedProduct[] = finalize([...PRIORITY_PRODUCTS, ...assignSkus(PLANNED_PRODUCTS), ...GUIDE_PRODUCTS]);
