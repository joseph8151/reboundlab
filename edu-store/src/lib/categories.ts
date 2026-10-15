import type { ProductFilters } from "./products";

export type CategoryDef = {
  slug: string;
  title: string;
  /** 검색 결과·브레드크럼에 쓰는 짧은 이름 */
  short: string;
  seoTitle: string;
  seoDescription: string;
  lead: string;
  intro: string[];
  filter: ProductFilters;
  parent?: string;
  children?: string[];
  courseTable?: "social" | "science";
};

const SCOPE_NOTE =
  "교육과정 개편으로 학년도에 따라 수능 출제 범위가 달라지므로, 수능 교재에는 적용 교육과정과 학년도를 표기합니다. 최종 출제 범위는 한국교육과정평가원의 공고를 기준으로 확인해 주세요.";

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "suneung",
    title: "수능 교재",
    short: "수능",
    seoTitle: "수능 문제집 · 기출 분석 교재",
    seoDescription: "수능 국어·수학·영어·사회·과학 영역별 문제집과 기출 분석, 변형문제, 실전 모의고사 PDF 교재. 멜리사 에듀(MELISA EDU)의 수능 교재를 영역별로 찾아보세요.",
    lead: "영역마다 기준이 되는 한 권을, 시리즈로 이어서.",
    intro: [
      "수능 교재는 국어, 수학, 영어, 사회, 과학 영역으로 나누어 진열합니다. 한 영역 안에서 개념 정리, 기출 분석, 변형문제, 실전 모의고사가 이어지도록 시리즈 단위로 구성합니다.",
      SCOPE_NOTE,
    ],
    filter: { scope: "csat" },
    children: ["suneung-korean", "suneung-math", "suneung-english", "suneung-social", "suneung-science"],
  },
  {
    slug: "suneung-korean",
    title: "수능 국어 교재",
    short: "수능 국어",
    seoTitle: "수능 국어 문제집 · 독서·문학 기출 분석",
    seoDescription: "수능 국어 독서·문학 기출 분석, 화법과 작문, 언어와 매체, 고난도 문제집과 실전 모의고사 PDF 교재. 영역별 교재를 멜리사 에듀에서 확인하세요.",
    lead: "독서와 문학, 선택 영역까지 판단의 근거를 중심으로.",
    intro: [
      "수능 국어 교재는 독서, 문학, 화법과 작문, 언어와 매체 영역으로 나뉩니다. 지문을 읽는 방식과 선지를 판단하는 근거를 함께 다루는 것을 기본 방향으로 합니다.",
      "기출 문항은 출처(학년도·시행월·문항 번호)를 표기하는 것을 원칙으로 하며, 수록 범위는 교재마다 상세 페이지에서 확인할 수 있습니다.",
    ],
    filter: { scope: "csat", area: "korean" },
    parent: "suneung",
  },
  {
    slug: "suneung-math",
    title: "수능 수학 교재",
    short: "수능 수학",
    seoTitle: "수능 수학 문제집 · 개념·유형·고난도",
    seoDescription: "수능 수학 공통 개념 정리부터 유형별 문제, 준킬러·고난도 훈련, 실전 모의고사 PDF 교재. 교육과정과 적용 학년도를 구분해 안내합니다. 멜리사 에듀(MELISA EDU).",
    lead: "개념의 연결에서 고난도 유형까지, 단계를 나누어.",
    intro: [
      "수능 수학 교재는 공통 개념 정리와 과목별 교재, 고난도 유형 훈련, 실전 모의고사로 단계를 나눕니다. 계산 실수와 오답 유형을 따로 점검하는 학습 자료도 함께 구성합니다.",
      SCOPE_NOTE,
    ],
    filter: { scope: "csat", area: "math" },
    parent: "suneung",
  },
  {
    slug: "suneung-english",
    title: "수능 영어 교재",
    short: "수능 영어",
    seoTitle: "수능 영어 문제집 · 빈칸 추론·순서·삽입",
    seoDescription: "수능 영어 빈칸 추론, 순서 배열, 문장 삽입, 어법, 어휘, 듣기, 장문 독해 유형별 문제집과 실전 모의고사 PDF 교재. 멜리사 에듀(MELISA EDU).",
    lead: "유형마다 풀이의 순서를 정하고, 같은 순서로 반복한다.",
    intro: [
      "수능 영어 교재는 독해 기본, 빈칸 추론, 순서 배열, 문장 삽입, 어법, 어휘, 듣기, 장문 독해 같은 유형 단위로 나눕니다. 한 유형에 집중해 풀이 순서를 익힌 뒤 실전 모의고사에서 시간 배분까지 점검하는 흐름입니다.",
      "영어 독해를 훈련하는 무료 도구(영단어 30일, 독해 속도 훈련, 지문 구조 10가지)도 함께 운영합니다.",
    ],
    filter: { scope: "csat", area: "english" },
    parent: "suneung",
  },
  {
    slug: "suneung-social",
    title: "수능 사회탐구 교재",
    short: "사회탐구",
    seoTitle: "수능 사회탐구 문제집 · 과목별 개념·기출",
    seoDescription: "생활과 윤리, 사회·문화, 한국지리, 세계지리, 동아시아사, 세계사, 정치와 법, 경제 등 수능 사회탐구 과목별 교재 시리즈. 멜리사 에듀(MELISA EDU).",
    lead: "과목마다 개념, 기출, 고난도 문제, 모의고사로 나누어.",
    intro: [
      "사회탐구는 과목 단위로 시리즈를 구성하고, 각 과목을 개념 정리, 기출 분석, 고난도 문제, 실전 모의고사로 세분화합니다. 아래 표에서 과목별 등록 교재를 확인할 수 있습니다. 등록된 교재가 없는 칸은 상담으로 제작 가능 여부를 문의해 주세요.",
      SCOPE_NOTE,
    ],
    filter: { scope: "csat", area: "social" },
    parent: "suneung",
    courseTable: "social",
  },
  {
    slug: "suneung-science",
    title: "수능 과학탐구 교재",
    short: "과학탐구",
    seoTitle: "수능 과학탐구 문제집 · 물리·화학·생명·지구과학",
    seoDescription: "수능 물리학, 화학, 생명과학, 지구과학 개념·기출·자료 해석·고난도 문제·모의고사 PDF 교재 시리즈. 교육과정별 과목명을 구분합니다. 멜리사 에듀(MELISA EDU).",
    lead: "자료 해석과 고난도 문항까지, 과목별 시리즈로.",
    intro: [
      "과학탐구는 물리학, 화학, 생명과학, 지구과학 과목별로 개념, 기출, 자료 해석, 고난도 문제, 모의고사 시리즈를 연결합니다. 교육과정에 따라 과목명이 다르므로 교재마다 적용 교육과정을 함께 표기합니다.",
      SCOPE_NOTE,
    ],
    filter: { scope: "csat", area: "science" },
    parent: "suneung",
    courseTable: "science",
  },
  {
    slug: "high-school",
    title: "고등 내신 교재",
    short: "고등 내신",
    seoTitle: "고등학교 내신 문제집 · 고1 고2 고3 시험 대비",
    seoDescription: "고1·고2·고3 국어·수학·영어 내신 대비 문제집과 서술형, 중간·기말고사 대비, 수행평가 준비 PDF 교재. 멜리사 에듀(MELISA EDU)의 고등 내신 교재.",
    lead: "학교 시험의 문항 방식에 맞춰, 학기 단위로.",
    intro: [
      "고등 내신 교재는 고1, 고2, 고3으로 나누어 국어·수학·영어 교재와 중간·기말고사 대비, 서술형 훈련, 수행평가 준비 자료로 구성합니다.",
      "학교별 교재는 자료의 정식 확보와 사용 권한이 확인된 경우에만 제작합니다.",
    ],
    filter: { scope: "high-school" },
    children: ["high1", "high2", "high3"],
  },
  {
    slug: "middle-school",
    title: "중등 내신 교재",
    short: "중등 내신",
    seoTitle: "중학교 내신 문제집 · 중등 영어 문법·수학·국어",
    seoDescription: "중1·중2·중3 국어 독해와 문법, 수학 개념과 유형별 문제, 영어 문법·독해·서술형, 중간·기말고사 대비 PDF 교재. 멜리사 에듀(MELISA EDU)의 중학교 내신 교재.",
    lead: "학습의 기초를, 학년의 속도에 맞추어.",
    intro: [
      "중등 내신 교재는 중1, 중2, 중3으로 나누어 국어, 수학, 영어, 과학, 사회, 역사 교재와 시험 대비 자료를 구성합니다. 중3 학생을 위한 고등학교 선행 교재도 함께 구성합니다.",
      "개념을 정확히 이해한 뒤 유형별 문제로 확인하는 순서를 기본으로 합니다.",
    ],
    filter: { scope: "middle-school" },
    children: ["middle1", "middle2", "middle3"],
  },
  {
    slug: "mock",
    title: "모의고사 · 실전 문제집",
    short: "모의고사",
    seoTitle: "수능 모의고사 PDF · 실전 모의고사 문제집",
    seoDescription: "수능 국어·수학·영어 실전 모의고사, 고1·고2 전국연합 대비, 고3 평가원 모의평가 대비, 단원별 진단 테스트와 파이널 모의고사 PDF. 멜리사 에듀(MELISA EDU).",
    lead: "실전의 시간과 형식으로, 부족한 부분을 확인한다.",
    intro: [
      "모의고사 시리즈는 수능 영역별 실전 모의고사와 학년별 전국연합 대비, 평가원 모의평가 대비, 과목별 미니 모의고사, 단원별 진단 테스트, 시험 직전 파이널 모의고사로 구성합니다.",
    ],
    filter: { kind: "mock" },
  },
  {
    slug: "planner",
    title: "학습 플래너 · 오답노트",
    short: "학습 플래너",
    seoTitle: "수능 공부 플래너 · 오답노트 · 학습 관리 PDF",
    seoDescription: "30일·100일 수능 학습 계획표, 내신 시험 4주 플래너, 오답노트, 회독 관리표, 영어 단어 암기장 등 학습 관리 PDF 자료. 멜리사 에듀(MELISA EDU).",
    lead: "계획하고, 기록하고, 다시 점검하는 도구.",
    intro: [
      "학습자료는 교재와 함께 쓰는 관리 도구입니다. 학습 계획표와 플래너, 오답노트, 회독 관리표, 과목별 정리 노트를 PDF로 제공합니다.",
      "바로 사용할 수 있는 무료 학습 도구도 있습니다. 영단어 30일, 독해 속도 훈련, 오답노트, 공부 시간 기록은 무료 학습 도구에서 이용하세요.",
    ],
    filter: { kind: "material" },
  },
  ...[1, 2, 3].map((n): CategoryDef => ({
    slug: `high${n}`, title: `고${n} 내신 교재`, short: `고${n} 내신`, parent: "high-school",
    seoTitle: `고${n} 내신 문제집`, seoDescription: `고${n} 내신 대비 PDF 교재. 멜리사 에듀(MELISA EDU)에서 상담 후 구매할 수 있습니다.`,
    lead: `고${n} 학교 시험에 맞춘 교재.`, intro: [`고${n} 학생을 위한 국어·수학·영어 내신 교재입니다. 아래 교재는 상담 후 계좌이체로 구매하며 PDF로 전달됩니다.`],
    filter: { scope: "high-school", level: `high${n}` },
  })),
  ...[1, 2, 3].map((n): CategoryDef => ({
    slug: `middle${n}`, title: `중${n} 내신 교재`, short: `중${n} 내신`, parent: "middle-school",
    seoTitle: `중${n} 내신 문제집`, seoDescription: `중${n} 내신 대비 PDF 교재. 멜리사 에듀(MELISA EDU)에서 상담 후 구매할 수 있습니다.`,
    lead: `중${n} 학습의 기초를 학년의 속도에 맞추어.`, intro: [`중${n} 학생을 위한 내신 교재입니다. 아래 교재는 상담 후 계좌이체로 구매하며 PDF로 전달됩니다.`],
    filter: { scope: "middle-school", level: `middle${n}` },
  })),
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
