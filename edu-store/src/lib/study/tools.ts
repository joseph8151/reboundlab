export const STUDY_TOOLS = [
  { href: "/study/words", title: "초고속 수능 영단어 30일 챌린지", short: "영단어 30일", desc: "하루 10단어 × 30일. 카드로 보고, 단어당 5초 스피드 퀴즈로 확인합니다. 틀린 단어는 오답 단어장에 자동 저장.", tag: "영어", icon: "zap" },
  { href: "/study/speed-reading", title: "수능 영어 지문 속독 훈련", short: "지문 속독", desc: "내 읽기 속도(WPM)를 재고, 끊어 읽기 페이서로 목표 속도에 맞춰 읽습니다. 읽은 뒤 바로 이해도 확인.", tag: "영어", icon: "gauge" },
  { href: "/study/structures", title: "수능 영어 지문 구조 10가지", short: "지문 구조 10", desc: "주장-근거, 통념-반박, 실험·연구… 구조를 알면 어디를 꼼꼼히 읽고 어디를 훑을지 보입니다.", tag: "영어", icon: "layers" },
  { href: "/study/strategy", title: "수능 영어 시간 단축 풀이 전략", short: "시간 단축 전략", desc: "독해 28문항을 45분 안에. 유형별 시간 배분과 푸는 순서, 실전 구간 타이머.", tag: "영어", icon: "timer" },
  { href: "/study/ai-melisa", title: "AI 멜리사 · 영어 지문 분석", short: "AI 멜리사", desc: "지문 사진이나 텍스트를 넣으면 핵심 내용, 문장별 해석, 어휘·문법, 글의 구조, 정답 근거까지 분석해 줍니다.", tag: "AI", icon: "sparkles" },
  { href: "/study/habit", title: "66일 공부 습관 만들기", short: "66일 습관", desc: "새 습관이 자리 잡는 데 평균 66일. 매일 체크하고 3단계로 나눠 흔들리는 구간을 버팁니다.", tag: "자기주도", icon: "flame" },
  { href: "/study/time", title: "순공 시간 분석기", short: "순공 시간", desc: "과목별 스톱워치로 실제 공부 시간만 기록하고, 주간 그래프로 과목 균형을 확인합니다.", tag: "자기주도", icon: "chart" },
  { href: "/study/report", title: "주간 학습 리포트", short: "학습 리포트", desc: "모든 도구의 기록을 모아 한 주를 점검하고, 다음 주에 무엇을 바꿀지 코멘트로 알려 줍니다. 인쇄해서 보호자와 공유하세요.", tag: "자기주도", icon: "report" },
  { href: "/study/wrong-notes", title: "오답노트 & 복습 알림", short: "오답노트", desc: "틀린 이유를 5가지로 분류하고, 1·3·7·14일 간격으로 다시 풀 문제를 알려 줍니다.", tag: "자기주도", icon: "notebook" },
] as const;

/** 공감 체크리스트: 고민 → 해결 도구 */
export const PAIN_POINTS = [
  { pain: "시험 볼 때 항상 시간이 부족해요", fix: "속독 훈련 + 시간 단축 전략", href: "/study/speed-reading" },
  { pain: "단어는 아는데 해석이 안 돼요", fix: "끊어 읽기 페이서 + AI 멜리사 문장별 해석", href: "/study/ai-melisa" },
  { pain: "해석은 다 했는데 문제를 못 풀겠어요", fix: "지문 구조 10가지로 정답 근거 찾기", href: "/study/structures" },
  { pain: "단어를 외워도 금방 잊어버려요", fix: "30일 챌린지 + 오답 단어 반복", href: "/study/words" },
  { pain: "계획은 세우는데 작심삼일이에요", fix: "66일 습관 + 순공 시간 기록", href: "/study/habit" },
  { pain: "같은 유형을 계속 틀려요", fix: "오답 이유 분류 + 간격 복습", href: "/study/wrong-notes" },
] as const;
